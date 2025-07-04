export interface DatabaseConfig {
  mongoUri: string;
  redisUrl: string;
}

export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  google: {
    clientId: string;
    clientSecret: string;
  };
  facebook: {
    appId: string;
    appSecret: string;
  };
}

export interface MusicConfig {
  spotify: {
    clientId: string;
    clientSecret: string;
  };
  youtube: {
    apiKey: string;
  };
}

export interface AppConfig {
  port: number;
  nodeEnv: string;
  frontendUrl: string;
}

// SOLID: Interface Segregation Principle - Küçük, spesifik arayüzler
export interface NotificationConfig {
  pushNotificationKey: string;
  smtp?: {
    host: string;
    port: number;
    user: string;
    pass: string;
  };
}
