const baseApiUrl = 'http://localhost:8080';
const websocketUrl = window.location.hostname.includes('localhost')
    ? 'ws://localhost:8080/websocket/websocket'
    : `wss://${window.location.hostname}/websocket/websocket`;



export const ApiConfig = {
    baseApiUrl,
    websocketUrl
}