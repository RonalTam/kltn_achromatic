import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new customer account' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);
    this.setRefreshTokenCookie(res, result.refreshToken);
    return { user: result.user, accessToken: result.accessToken };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and receive JWT tokens' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    this.setRefreshTokenCookie(res, result.refreshToken);
    return { user: result.user, accessToken: result.accessToken };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('refreshToken')
  @ApiOperation({ summary: 'Refresh access token using refresh token cookie' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.['refreshToken'] as string;
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }
    const tokens = await this.authService.refresh(refreshToken);
    this.setRefreshTokenCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  // ─────────────────────────────────────
  // MOBILE TOKEN REFRESH (Body-based, no cookie)
  // ─────────────────────────────────────

  @Public()
  @Post('mobile/refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mobile: Refresh access token using refreshToken in request body',
    description:
      'Designed for native mobile apps that cannot use httpOnly cookies. ' +
      'Send the refreshToken obtained during login/register in the JSON body.',
  })
  async mobileRefresh(
    @Body() body: { refreshToken?: string },
  ) {
    if (!body?.refreshToken) {
      throw new BadRequestException('refreshToken is required in the request body');
    }
    const tokens = await this.authService.refresh(body.refreshToken);
    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout and invalidate tokens' })
  async logout(
    @CurrentUser() user: JwtUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(user.sub);
    // Clear the httpOnly refresh token cookie
    res.clearCookie('refreshToken', { path: '/' });
    // Clear the auth status indicator cookie
    res.clearCookie('auth_status', { path: '/' });
    // Clear the role hint used by the frontend Proxy
    res.clearCookie('auth_role', { path: '/' });
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@CurrentUser() user: JwtUser) {
    return this.authService.getProfile(user.sub);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a password reset email' })
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using a valid reset token' })
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }

  private setRefreshTokenCookie(res: Response, token: string) {
    // httpOnly cookie — cannot be read by JS, but sent with all requests (path: '/')
    // so the Next.js middleware can detect it for route protection
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // 'lax' allows cookie after OAuth redirect
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });
    // Non-httpOnly auth status indicator — used by the Next.js Proxy
    // to quickly detect auth state without exposing the actual token
    res.cookie('auth_status', '1', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });
  }

  // ─────────────────────────────────────
  // GOOGLE OAUTH
  // ─────────────────────────────────────

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Redirect to Google OAuth consent screen' })
  googleAuth() {
    // Passport redirects automatically — this handler is never called
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiExcludeEndpoint()
  async googleCallback(
    @Req() req: Request & { user: { user: any; accessToken: string; refreshToken: string } },
    @Res() res: Response,
  ) {
    return this.handleOAuthCallback(req, res);
  }

  // ─────────────────────────────────────
  // FACEBOOK OAUTH
  // ─────────────────────────────────────

  @Public()
  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Redirect to Facebook OAuth consent screen' })
  facebookAuth() {
    // Passport redirects automatically — this handler is never called
  }

  @Public()
  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  @ApiExcludeEndpoint()
  async facebookCallback(
    @Req() req: Request & { user: { user: any; accessToken: string; refreshToken: string } },
    @Res() res: Response,
  ) {
    console.log('[Facebook Callback] Successfully exchanged token and validated user!', req.user?.user?.email);
    return this.handleOAuthCallback(req, res);
  }

  // ─────────────────────────────────────
  // SHARED OAUTH CALLBACK
  // ─────────────────────────────────────

  private handleOAuthCallback(
    req: Request & { user: { user: any; accessToken: string; refreshToken: string } },
    res: Response,
  ) {
    const { user, accessToken, refreshToken } = req.user;
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';

    // Set httpOnly refresh token cookie
    this.setRefreshTokenCookie(res, refreshToken);

    // Encode user safely for query param
    const userParam = encodeURIComponent(JSON.stringify(user));

    // Redirect to frontend callback handler
    return res.redirect(
      `${frontendUrl}/account/oauth/callback?token=${accessToken}&user=${userParam}`,
    );
  }
}
