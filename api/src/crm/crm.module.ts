import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CrmController } from './crm.controller';
import { CrmScopeService } from './crm-scope.service';
import { LeadsService } from './leads.service';
import { MeetingsService } from './meetings.service';
import { CatalogService } from './catalog.service';

@Module({
  imports: [AuthModule],
  controllers: [CrmController],
  providers: [CrmScopeService, LeadsService, MeetingsService, CatalogService],
})
export class CrmModule {}
