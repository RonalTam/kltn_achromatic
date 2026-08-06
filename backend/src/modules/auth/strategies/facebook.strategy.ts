import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('FACEBOOK_APP_ID'),
      clientSecret: configService.getOrThrow<string>('FACEBOOK_APP_SECRET'),
      callbackURL: configService.getOrThrow<string>('FACEBOOK_CALLBACK_URL'),
      scope: ['email', 'public_profile'],
      profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
      proxy: true, // Fix "authorization code has been used" error on Render (trusts X-Forwarded-Proto)
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (err: unknown, user?: unknown) => void,
  ): Promise<void> {
    const email = profile.emails?.[0]?.value;
    const firstName = profile.name?.givenName ?? profile.displayName ?? 'User';
    const lastName = profile.name?.familyName ?? '';
    // Facebook picture is nested under photos
    const avatarUrl = (profile as any).photos?.[0]?.value;

    const result = await this.authService.findOrCreateOAuthUser({
      provider: 'FACEBOOK',
      providerId: profile.id,
      email: email ?? `facebook_${profile.id}@oauth.local`,
      firstName,
      lastName,
      avatarUrl,
    });

    done(null, result);
  }
}
