import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleAuthService {
  private client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com'
    );
  }

  async verifyGoogleToken(token: string): Promise<{
    email: string;
    firstName: string;
    lastName: string;
    providerId: string;
  }> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: [
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_WEB_CLIENT_ID,
          process.env.GOOGLE_IOS_CLIENT_ID,
          process.env.GOOGLE_ANDROID_CLIENT_ID,
        ].filter(Boolean), // undefined değerleri filtrele
      });

      const payload = ticket.getPayload();
      
      if (!payload) {
        throw new Error('Google token payload is empty');
      }

      return {
        email: payload.email || '',
        firstName: payload.given_name || '',
        lastName: payload.family_name || '',
        providerId: payload.sub || '',
      };
    } catch (error) {
      console.error('Google token verification error:', error);
      throw new Error('Invalid Google token');
    }
  }
}
