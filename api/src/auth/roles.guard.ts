import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, type MemberRole } from './roles.decorator';
import type { AuthContext } from './auth.service';

// RBAC de papel. O escopo fino (unidade/equipe/próprio — níveis T/U/E/P/L)
// é aplicado nas queries de cada módulo; aqui barra o papel errado na porta.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<MemberRole[] | undefined>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required || required.length === 0) return true;
    const auth: AuthContext | undefined = ctx.switchToHttp().getRequest().auth;
    const ok = !!auth?.memberships.some((m) => required.includes(m.role));
    if (!ok) throw new ForbiddenException('Seu perfil não tem acesso a este recurso.');
    return true;
  }
}
