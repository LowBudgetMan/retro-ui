import {StompConfig} from "@stomp/stompjs";
import {getUserManager} from "../../pages/user/UserContext";
import {ApiConfig} from "../../config/ApiConfig";
import {getShareToken, isAnonymousMode} from "../anonymous-auth/AnonymousAuthService.ts";

export async function getConfig(): Promise<StompConfig> {
    let connectHeaders: Record<string, string>;

    if (isAnonymousMode()) {
        connectHeaders = {
            'X-Share-Token': getShareToken()!,
        };
    } else {
        connectHeaders = {
            Authorization: `Bearer ${(await getUserManager().getUser())?.access_token}`,
        };
    }

    return {
        brokerURL: ApiConfig.websocketUrl(),
        connectHeaders,
        reconnectDelay: 3000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
    }
}
