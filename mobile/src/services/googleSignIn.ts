import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
import Config from '../config/config';

export interface GoogleSignInResponse {
  idToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    familyName: string;
    givenName: string;
    photo: string | null;
  };
}

class GoogleSignInService {
  private isConfigured = false;

  // Google Sign-In yapılandırması
  configure() {
    if (this.isConfigured) return;

    GoogleSignin.configure({
      webClientId: Config.GOOGLE_AUTH.webClientId,
      iosClientId: Config.GOOGLE_AUTH.iosClientId,
      offlineAccess: true, // Refresh token almak için
      hostedDomain: '', // Belirli bir domain ile sınırlamak için (opsiyonel)
      forceCodeForRefreshToken: true, // Android için refresh token zorla
      accountName: '', // Android için hesap seçimi (opsiyonel)
      googleServicePlistPath: '', // iOS için plist path (opsiyonel)
      profileImageSize: 120, // Profil resmi boyutu
    });

    this.isConfigured = true;
  }

  // Google ile giriş yap
  async signIn(): Promise<GoogleSignInResponse> {
    try {
      // Önce yapılandırmayı kontrol et
      this.configure();

      // Play Services kontrolü (Android)
      await GoogleSignin.hasPlayServices();

      // Kullanıcı bilgilerini al
      const result = await GoogleSignin.signIn();

      // result.type kontrolü yapalım
      if (result.type !== 'success') {
        throw new Error('Google Sign-In başarısız');
      }

      const { data } = result;

      if (!data || !data.idToken) {
        throw new Error('Google Sign-In başarısız: ID token alınamadı');
      }

      return {
        idToken: data.idToken,
        user: {
          id: data.user.id,
          name: data.user.name || '',
          email: data.user.email,
          familyName: data.user.familyName || '',
          givenName: data.user.givenName || '',
          photo: data.user.photo,
        },
      };
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('Google giriş işlemi iptal edildi');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('Google giriş işlemi devam ediyor');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Services mevcut değil');
      } else {
        throw new Error('Google giriş işlemi başarısız: ' + error.message);
      }
    }
  }

  // Sessiz giriş (token yenileme)
  async signInSilently(): Promise<GoogleSignInResponse | null> {
    try {
      this.configure();
      
      const result = await GoogleSignin.signInSilently();
      
      if (result.type !== 'success') {
        return null;
      }

      const { data } = result;
      
      if (!data || !data.idToken) {
        return null;
      }

      return {
        idToken: data.idToken,
        user: {
          id: data.user.id,
          name: data.user.name || '',
          email: data.user.email,
          familyName: data.user.familyName || '',
          givenName: data.user.givenName || '',
          photo: data.user.photo,
        },
      };
    } catch (error) {
      console.log('Silent sign-in failed:', error);
      return null;
    }
  }

  // Çıkış yap
  async signOut(): Promise<void> {
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.error('Google Sign-Out Error:', error);
    }
  }

  // Hesabı tamamen iptal et
  async revokeAccess(): Promise<void> {
    try {
      await GoogleSignin.revokeAccess();
    } catch (error) {
      console.error('Google Revoke Access Error:', error);
    }
  }

  // Şu anki kullanıcı bilgilerini al
  async getCurrentUser(): Promise<GoogleSignInResponse | null> {
    try {
      const currentUser = await GoogleSignin.getCurrentUser();
      
      if (!currentUser) {
        return null;
      }

      // Token'ları al
      const tokens = await GoogleSignin.getTokens();

      return {
        idToken: tokens.idToken,
        user: {
          id: currentUser.user.id,
          name: currentUser.user.name || '',
          email: currentUser.user.email,
          familyName: currentUser.user.familyName || '',
          givenName: currentUser.user.givenName || '',
          photo: currentUser.user.photo,
        },
      };
    } catch (error) {
      console.log('Get current user failed:', error);
      return null;
    }
  }

  // Giriş durumunu kontrol et
  async isSignedIn(): Promise<boolean> {
    try {
      const currentUser = await GoogleSignin.getCurrentUser();
      return currentUser !== null;
    } catch (error) {
      return false;
    }
  }
}

// Singleton pattern
export const googleSignInService = new GoogleSignInService();

// Component için export
export { GoogleSigninButton };
