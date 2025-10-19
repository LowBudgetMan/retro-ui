interface AuthConfig {
    authority: string;
    clientId: string;
}

interface ApiConfig {
    baseApiUrl: string;
    websocketUrl: string;
    authConfig: AuthConfig;
}

const baseApiUrl = 'http://localhost:8080';
const websocketUrl = window.location.hostname.includes('localhost')
    ? 'ws://localhost:8080/websocket/websocket'
    : `wss://${window.location.hostname}/websocket/websocket`;

const localAuthConfig: AuthConfig = {
    authority: 'http://localhost:8010/realms/myrealm',
    clientId: 'retroquest-web',
}

export const ApiConfig: ApiConfig = {
    baseApiUrl,
    websocketUrl,
    authConfig: localAuthConfig
}