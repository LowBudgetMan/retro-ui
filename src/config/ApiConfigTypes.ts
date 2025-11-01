export interface AuthConfig {
    authority: string;
    clientId: string;
}

export interface RemoteConfig {
    websocketEnvironmentConfig: {
        baseUrl: string
    },
    "webAuthentication": AuthConfig
}