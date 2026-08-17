import {
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import * as admin from 'firebase-admin';

type FirebaseCreds = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private ready = false;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const creds = this.readCredentials();
    if (creds) {
      this.initialize(creds);
    } else {
      this.logger.warn(
        'Firebase Admin not configured — add FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY, or place firebase-adminsdk.json in backend/',
      );
    }
  }

  isConfigured(): boolean {
    return this.ready || this.readCredentials() !== null;
  }

  credentialStatus() {
    const creds = this.readCredentials();
    return {
      hasProjectId: Boolean(creds?.projectId),
      hasClientEmail: Boolean(creds?.clientEmail),
      hasPrivateKey: Boolean(creds?.privateKey),
    };
  }

  private normalizePrivateKey(raw: string): string {
    return raw
      .trim()
      .replace(/^["']|["']$/g, '')
      .replace(/\\n/g, '\n');
  }

  private fromEnv(): FirebaseCreds | null {
    const projectId = String(
      this.configService.get<string>('firebase.projectId') ?? process.env.FIREBASE_PROJECT_ID ?? '',
    ).trim();
    const clientEmail = String(
      this.configService.get<string>('firebase.clientEmail') ??
        process.env.FIREBASE_CLIENT_EMAIL ??
        '',
    ).trim();
    const privateKeyRaw = String(
      this.configService.get<string>('firebase.privateKey') ??
        process.env.FIREBASE_PRIVATE_KEY ??
        '',
    );
    const privateKey = this.normalizePrivateKey(privateKeyRaw);
    if (projectId && clientEmail && privateKey.includes('BEGIN PRIVATE KEY')) {
      return { projectId, clientEmail, privateKey };
    }
    return null;
  }

  private fromJsonFile(): FirebaseCreds | null {
    const explicit = (
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH ??
      process.env.GOOGLE_APPLICATION_CREDENTIALS ??
      ''
    ).trim();
    const candidates = [
      explicit,
      resolve(process.cwd(), 'firebase-adminsdk.json'),
      resolve(process.cwd(), 'firebase-service-account.json'),
    ].filter(Boolean);

    for (const filePath of candidates) {
      if (!existsSync(filePath)) continue;
      try {
        const parsed = JSON.parse(readFileSync(filePath, 'utf8')) as {
          project_id?: string;
          client_email?: string;
          private_key?: string;
        };
        const projectId = (parsed.project_id ?? '').trim();
        const clientEmail = (parsed.client_email ?? '').trim();
        const privateKey = this.normalizePrivateKey(parsed.private_key ?? '');
        if (projectId && clientEmail && privateKey.includes('BEGIN PRIVATE KEY')) {
          this.logger.log(`Loaded Firebase service account from ${filePath}`);
          return { projectId, clientEmail, privateKey };
        }
      } catch (error) {
        this.logger.warn(`Could not read Firebase JSON at ${filePath}: ${String(error)}`);
      }
    }
    return null;
  }

  private readCredentials(): FirebaseCreds | null {
    return this.fromEnv() ?? this.fromJsonFile();
  }

  private initialize(creds: FirebaseCreds) {
    if (admin.apps.length > 0) {
      this.ready = true;
      return;
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: creds.projectId,
        clientEmail: creds.clientEmail,
        privateKey: creds.privateKey,
      }),
    });

    this.ready = true;
    this.logger.log(`Firebase Admin initialized for project ${creds.projectId}`);
  }

  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    if (!this.ready) {
      const creds = this.readCredentials();
      if (creds) {
        this.initialize(creds);
      } else {
        throw new ServiceUnavailableException('Firebase auth is not configured on the server');
      }
    }

    try {
      return await admin.auth().verifyIdToken(idToken, true);
    } catch (error) {
      this.logger.warn(`Firebase ID token verification failed: ${String(error)}`);
      throw new UnauthorizedException('Invalid or expired Firebase session');
    }
  }
}
