import { SetMetadata } from '@nestjs/common';

export type MemberRole = 'presidente' | 'diretor' | 'supervisor' | 'consultor' | 'cotista';

export const ROLES_KEY = 'mazari:roles';

// @Roles('presidente') — a rota exige ao menos um vínculo ativo nesse papel.
export const Roles = (...roles: MemberRole[]) => SetMetadata(ROLES_KEY, roles);
