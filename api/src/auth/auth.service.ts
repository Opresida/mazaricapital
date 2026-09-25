import { Inject, Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { DB, type Db } from '../db/db.module';
import { users, memberships, units } from '../db/schema';
import { AuditService } from '../audit/audit.service';

export interface AuthContext {
  userId: string;
  email: string;
  name: string;
  memberships: Array<{
    id: string;
    organizationId: string;
    unitId: string | null;
    teamId: string | null;
    role: 'presidente' | 'diretor' | 'supervisor' | 'consultor' | 'cotista';
  }>;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(DB) private readonly db: Db,
    private readonly jwt: JwtService,
    private readonly audit: AuditService,
  ) {}

  async login(email: string, password: string, ip?: string, userAgent?: string) {
    const [user] = await this.db.select().from(users).where(eq(users.email, email.toLowerCase().trim()));
    if (!user || !user.passwordHash || !user.active) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Credenciais inválidas.');

    const activeMemberships = await this.db
      .select()
      .from(memberships)
      .where(and(eq(memberships.userId, user.id), eq(memberships.status, 'ativo')));
    if (activeMemberships.length === 0) {
      throw new UnauthorizedException('Usuário sem vínculo ativo.');
    }

    await this.db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
    await this.audit.log({
      organizationId: activeMemberships[0].organizationId,
      actorUserId: user.id,
      action: 'auth.login',
      entityType: 'user',
      entityId: user.id,
      ipAddress: ip ?? null,
      userAgent: userAgent ?? null,
    });

    const token = await this.jwt.signAsync({ sub: user.id, email: user.email });
    return {
      token,
      user: { id: user.id, name: user.name, email: user.email },
      memberships: activeMemberships.map((m) => ({
        id: m.id,
        organizationId: m.organizationId,
        unitId: m.unitId,
        teamId: m.teamId,
        role: m.role,
      })),
    };
  }

  async resolveContext(userId: string): Promise<AuthContext> {
    const [user] = await this.db.select().from(users).where(eq(users.id, userId));
    if (!user || !user.active) throw new UnauthorizedException('Sessão inválida.');
    const activeMemberships = await this.db
      .select()
      .from(memberships)
      .where(and(eq(memberships.userId, user.id), eq(memberships.status, 'ativo')));
    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      memberships: activeMemberships.map((m) => ({
        id: m.id,
        organizationId: m.organizationId,
        unitId: m.unitId,
        teamId: m.teamId,
        role: m.role,
      })),
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string, ip?: string) {
    if (!newPassword || newPassword.length < 10) {
      throw new BadRequestException('A nova senha precisa de ao menos 10 caracteres.');
    }
    const [user] = await this.db.select().from(users).where(eq(users.id, userId));
    if (!user?.passwordHash) throw new UnauthorizedException('Sessão inválida.');
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Senha atual incorreta.');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, userId));

    const [membership] = await this.db
      .select()
      .from(memberships)
      .where(and(eq(memberships.userId, userId), eq(memberships.status, 'ativo')));
    if (membership) {
      await this.audit.log({
        organizationId: membership.organizationId,
        actorUserId: userId,
        action: 'auth.change_password',
        entityType: 'user',
        entityId: userId,
        ipAddress: ip ?? null,
      });
    }
    return { ok: true };
  }
}
