import {StompConfig} from "@stomp/stompjs";
import {userManager} from "../../pages/user/UserContext.ts";

// TODO: This should come from properties
const url = window.location.hostname.includes('localhost')
    ? 'ws://localhost:8080/websocket/websocket'
    : `wss://${window.location.hostname}/websocket/websocket`;

export async function getConfig(): Promise<StompConfig> {
    return {
        brokerURL: url,
        connectHeaders: {
            Authorization: `Bearer ${(await userManager.getUser())?.access_token}`,
        },
        reconnectDelay: 3000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
    }
}