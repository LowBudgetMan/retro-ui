import {StompConfig} from "@stomp/stompjs";
import {getUserManager} from "../../pages/user/UserContext";
import {ApiConfig} from "../../config/ApiConfig";
import {getShareToken, hasShareToken} from "../anonymous-auth/AnonymousAuthService.ts";

export async function getConfig(retroId?: string): Promise<StompConfig> {
    return {
        brokerURL: ApiConfig.websocketUrl(),
        connectHeaders: await buildConnectHeaders(retroId),
        reconnectDelay: 3000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
    }
}

export async function buildConnectHeaders(retroId?: string): Promise<Record<string, string>> {
    const connectHeaders: Record<string, string> = {};

    const userManager = getUserManager();
    if (userManager) {
        try {
            const user = await userManager.getUser();
            if (user?.access_token) {
                connectHeaders['Authorization'] = `Bearer ${user.access_token}`;
            }
        } catch {
            // proceed without JWT
        }
    }

    if (retroId && hasShareToken(retroId)) {
        connectHeaders['X-Share-Token'] = getShareToken(retroId)!;
    }

    return connectHeaders;
}
