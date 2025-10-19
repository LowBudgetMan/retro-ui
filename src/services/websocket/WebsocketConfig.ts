import {StompConfig} from "@stomp/stompjs";
import {userManager} from "../../pages/user/UserContext.ts";
import {ApiConfig} from "../../config/ApiConfig.ts";

export async function getConfig(): Promise<StompConfig> {
    return {
        brokerURL: ApiConfig.websocketUrl,
        connectHeaders: {
            Authorization: `Bearer ${(await userManager.getUser())?.access_token}`,
        },
        reconnectDelay: 3000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
    }
}