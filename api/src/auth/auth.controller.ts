import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  login(@Body() body: { email?: string; password?: string }, @Req() req: any) {
    return this.auth.login(body?.email ?? '', body?.password ?? '', req.ip, req.headers['user-agent']);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: any) {
    return req.auth;
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Body() body: { currentPassword?: string; newPassword?: string },
    @Req() req: any,
  ) {
    return this.auth.changePassword(
      req.auth.userId,
      body?.currentPassword ?? '',
      body?.newPassword ?? '',
      req.ip,
    );
  }
}
