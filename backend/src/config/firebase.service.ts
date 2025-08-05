import * as admin from 'firebase-admin';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);
  private firebaseApp: admin.app.App;

  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      // Firebase servis hesap anahtarı için environment variable kullan
      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      
      if (!serviceAccountKey) {
        this.logger.warn('Firebase service account key not found in environment variables');
        return;
      }

      // JSON string'ini parse et
      const serviceAccount = JSON.parse(serviceAccountKey);

      // Firebase Admin SDK'yı başlat
      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });

      this.logger.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK:', error);
    }
  }

  getFirebaseAdmin() {
    if (!this.firebaseApp) {
      throw new Error('Firebase Admin SDK is not initialized');
    }
    return admin;
  }

  getMessaging() {
    if (!this.firebaseApp) {
      throw new Error('Firebase Admin SDK is not initialized');
    }
    return admin.messaging();
  }

  isInitialized(): boolean {
    return !!this.firebaseApp;
  }
}
