import { Body, Controller, Get, Headers, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CrmScopeService } from './crm-scope.service';
import { LeadsService } from './leads.service';
import { MeetingsService } from './meetings.service';
import { CatalogService } from './catalog.service';

// CRM: exclusivo da equipe comercial (cotista não entra — RBAC N).
@Controller('crm')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('presidente', 'diretor', 'supervisor', 'consultor')
export class CrmController {
  constructor(
    private readonly scopeSvc: CrmScopeService,
    private readonly leadsSvc: LeadsService,
    private readonly meetingsSvc: MeetingsService,
    private readonly catalogSvc: CatalogService,
  ) {}

  private scope(req: any, orgId?: string) {
    return this.scopeSvc.resolve(req.auth, orgId);
  }

  // ── Leads ────────────────────────────────────────────────────────────
  @Get('leads')
  async listLeads(@Req() req: any, @Headers('x-org-id') orgId: string, @Query() q: any) {
    const scope = await this.scope(req, orgId);
    return this.leadsSvc.list(scope, {
      stage: q.stage,
      sourceId: q.sourceId,
      batchId: q.batchId,
      search: q.search,
      page: q.page ? Number(q.page) : undefined,
      limit: q.limit ? Number(q.limit) : undefined,
    });
  }

  @Get('board')
  async board(@Req() req: any, @Headers('x-org-id') orgId: string) {
    return this.leadsSvc.board(await this.scope(req, orgId));
  }

  @Get('queue')
  async queue(@Req() req: any, @Headers('x-org-id') orgId: string) {
    return this.leadsSvc.queue(await this.scope(req, orgId));
  }

  @Get('leads/:id')
  async leadDetail(@Req() req: any, @Headers('x-org-id') orgId: string, @Param('id') id: string) {
    return this.leadsSvc.detail(await this.scope(req, orgId), id);
  }

  @Post('leads')
  async createLead(@Req() req: any, @Headers('x-org-id') orgId: string, @Body() body: any) {
    return this.leadsSvc.create(await this.scope(req, orgId), body, req.auth.userId);
  }

  @Patch('leads/:id')
  async updateLead(@Req() req: any, @Headers('x-org-id') orgId: string, @Param('id') id: string, @Body() body: any) {
    return this.leadsSvc.update(await this.scope(req, orgId), id, body, req.auth.userId);
  }

  // Tabulação da ligação (esteira).
  @Post('leads/:id/attempts')
  async tabulate(@Req() req: any, @Headers('x-org-id') orgId: string, @Param('id') id: string, @Body() body: any) {
    return this.leadsSvc.tabulate(await this.scope(req, orgId), id, body, req.auth.userId);
  }

  // ── Reuniões ─────────────────────────────────────────────────────────
  @Post('leads/:id/meetings')
  async scheduleMeeting(@Req() req: any, @Headers('x-org-id') orgId: string, @Param('id') id: string, @Body() body: any) {
    return this.meetingsSvc.schedule(await this.scope(req, orgId), id, body, req.auth.userId);
  }

  @Patch('meetings/:id')
  async closeMeeting(@Req() req: any, @Headers('x-org-id') orgId: string, @Param('id') id: string, @Body() body: any) {
    return this.meetingsSvc.close(await this.scope(req, orgId), id, body, req.auth.userId);
  }

  @Get('meetings')
  async agenda(@Req() req: any, @Headers('x-org-id') orgId: string, @Query('mine') mine: string) {
    return this.meetingsSvc.agenda(await this.scope(req, orgId), mine !== 'false');
  }

  // ── Catálogos (leitura p/ toda a equipe) ─────────────────────────────
  @Get('outcomes')
  async outcomes(@Req() req: any, @Headers('x-org-id') orgId: string) {
    return this.catalogSvc.listOutcomes(await this.scope(req, orgId));
  }

  @Get('sources')
  async sources(@Req() req: any, @Headers('x-org-id') orgId: string) {
    return this.catalogSvc.listSources(await this.scope(req, orgId));
  }

  @Get('referrers')
  async referrers(@Req() req: any, @Headers('x-org-id') orgId: string) {
    return this.catalogSvc.listReferrers(await this.scope(req, orgId));
  }

  @Get('operation-options')
  async operationOptions(@Req() req: any, @Headers('x-org-id') orgId: string) {
    return this.catalogSvc.listOperationOptions(await this.scope(req, orgId));
  }

  @Post('referrers')
  async createReferrer(@Req() req: any, @Headers('x-org-id') orgId: string, @Body() body: any) {
    return this.catalogSvc.createReferrer(await this.scope(req, orgId), body, req.auth.userId);
  }

  // ── Administração (só Presidência) ───────────────────────────────────
  @Post('outcomes')
  @Roles('presidente')
  async createOutcome(@Req() req: any, @Headers('x-org-id') orgId: string, @Body() body: any) {
    return this.catalogSvc.createOutcome(await this.scope(req, orgId), body, req.auth.userId);
  }

  @Patch('outcomes/:id')
  @Roles('presidente')
  async updateOutcome(@Req() req: any, @Headers('x-org-id') orgId: string, @Param('id') id: string, @Body() body: any) {
    return this.catalogSvc.updateOutcome(await this.scope(req, orgId), id, body, req.auth.userId);
  }

  @Post('sources')
  @Roles('presidente')
  async createSource(@Req() req: any, @Headers('x-org-id') orgId: string, @Body() body: any) {
    return this.catalogSvc.createSource(await this.scope(req, orgId), body, req.auth.userId);
  }

  @Post('batches')
  @Roles('presidente', 'diretor')
  async createBatch(@Req() req: any, @Headers('x-org-id') orgId: string, @Body() body: any) {
    return this.catalogSvc.createBatch(await this.scope(req, orgId), body, req.auth.userId);
  }

  @Post('batches/:id/leads')
  @Roles('presidente', 'diretor')
  async importLeads(@Req() req: any, @Headers('x-org-id') orgId: string, @Param('id') id: string, @Body() body: any) {
    const scope = await this.scope(req, orgId);
    return this.catalogSvc.importLeads(
      scope,
      id,
      body?.leads ?? [],
      body?.ownerMembershipId ?? scope.primaryMembershipId,
      req.auth.userId,
      body?.operationId,
    );
  }

  @Get('dnc')
  @Roles('presidente', 'diretor')
  async dnc(@Req() req: any, @Headers('x-org-id') orgId: string) {
    return this.catalogSvc.listDnc(await this.scope(req, orgId));
  }

  @Post('dnc')
  @Roles('presidente', 'diretor')
  async addDnc(@Req() req: any, @Headers('x-org-id') orgId: string, @Body() body: any) {
    return this.catalogSvc.addDnc(await this.scope(req, orgId), body, req.auth.userId);
  }
}
