import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleAuthService {
  private client: OAuth2Client;

  constructor() {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    
    if (googleClientId && googleClientId !== 'your-google-client-id') {
      this.client = new OAuth2Client(googleClientId);
    } else {
      console.warn('Google Client ID not configured. Google authentication will be disabled.');
    }
  }

  async verifyGoogleToken(token: string): Promise<{
    email: string;
    firstName: string;
    lastName: string;
    providerId: string;
  }> {
    try {
      if (!this.client) {
        throw new Error('Google authentication is not configured');
      }

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
