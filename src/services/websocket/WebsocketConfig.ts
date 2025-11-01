import {StompConfig} from "@stomp/stompjs";
import {getUserManager} from "../../pages/user/UserContext";
import {ApiConfig} from "../../config/ApiConfig";

export async function getConfig(): Promise<StompConfig> {
    return {
        brokerURL: ApiConfig.websocketUrl(),
        connectHeaders: {
            Authorization: `Bearer ${(await getUserManager().getUser())?.access_token}`,
        },
        reconnectDelay: 3000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
    }
}
