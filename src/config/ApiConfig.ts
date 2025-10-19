const baseApiUrl = 'http://localhost:8080';
const websocketUrl = window.location.hostname.includes('localhost')
    ? 'ws://localhost:8080/websocket/websocket'
    : `wss://${window.location.hostname}/websocket/websocket`;

interface ApiConfig {
    baseApiUrl: string;
    websocketUrl: string;
}

export const ApiConfig: ApiConfig = {
    baseApiUrl,
    websocketUrl
}