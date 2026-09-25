import { Controller, Get } from '@nestjs/common';

// Endpoint público de saúde — usado pelo healthcheck do Render.
@Controller('health')
export class HealthController {
  @Get()
  health() {
    return { ok: true, service: 'mazari-capital-api', ts: new Date().toISOString() };
  }
}
