import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { DB, type Db } from '../db/db.module';
import { memberships, teams } from '../db/schema';
import type { AuthContext } from '../auth/auth.service';

export interface CrmScope {
  organizationId: string;
  // Vínculos do próprio usuário nesta organização (comercial: não-cotista).
  ownMembershipIds: string[];
  primaryMembershipId: string;
  role: 'presidente' | 'diretor' | 'supervisor' | 'consultor';
  // 'all' = Presidência (Total); senão, lista de memberships cujos leads
  // o usuário pode ver (níveis U/E/P do RBAC aplicados na query).
  visibleOwnerIds: 'all' | string[];
}

// Escopo fino do RBAC (T/U/E/P) para o CRM: quem enxerga os leads de quem.
@Injectable()
export class CrmScopeService {
  constructor(@Inject(DB) private readonly db: Db) {}

  async resolve(auth: AuthContext, headerOrgId?: string): Promise<CrmScope> {
    const commercial = auth.memberships.filter((m) => m.role !== 'cotista');
    if (commercial.length === 0) {
      throw new ForbiddenException('O CRM é exclusivo da equipe comercial.');
    }
    const organizationId = headerOrgId ?? commercial[0].organizationId;
    const orgMemberships = commercial.filter((m) => m.organizationId === organizationId);
    if (orgMemberships.length === 0) {
      throw new BadRequestException('Você não tem vínculo comercial nesta organização.');
    }

    // Papel mais alto define o alcance (uma pessoa pode acumular vínculos).
    const rank = { presidente: 4, diretor: 3, supervisor: 2, consultor: 1 } as const;
    const top = orgMemberships.reduce((a, b) =>
      rank[a.role as keyof typeof rank] >= rank[b.role as keyof typeof rank] ? a : b,
    );
    const ownMembershipIds = orgMemberships.map((m) => m.id);

    let visibleOwnerIds: 'all' | string[];
    if (top.role === 'presidente') {
      visibleOwnerIds = 'all';
    } else if (top.role === 'diretor' && top.unitId) {
      const unitMembers = await this.db
        .select({ id: memberships.id })
        .from(memberships)
        .where(and(eq(memberships.organizationId, organizationId), eq(memberships.unitId, top.unitId)));
      visibleOwnerIds = [...new Set([...unitMembers.map((m) => m.id), ...ownMembershipIds])];
    } else if (top.role === 'supervisor') {
      const myTeams = await this.db
        .select({ id: teams.id })
        .from(teams)
        .where(eq(teams.supervisorMembershipId, top.id));
      const teamIds = myTeams.map((t) => t.id);
      const teamMembers = teamIds.length
        ? await this.db
            .select({ id: memberships.id })
            .from(memberships)
            .where(inArray(memberships.teamId, teamIds))
        : [];
      visibleOwnerIds = [...new Set([...teamMembers.map((m) => m.id), ...ownMembershipIds])];
    } else {
      visibleOwnerIds = ownMembershipIds;
    }

    return {
      organizationId,
      ownMembershipIds,
      primaryMembershipId: top.id,
      role: top.role as CrmScope['role'],
      visibleOwnerIds,
    };
  }

  assertCanSeeOwner(scope: CrmScope, ownerMembershipId: string) {
    if (scope.visibleOwnerIds === 'all') return;
    if (!scope.visibleOwnerIds.includes(ownerMembershipId)) {
      throw new ForbiddenException('Este lead está fora do seu alcance.');
    }
  }
}
