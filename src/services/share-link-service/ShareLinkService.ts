import { fetchClient } from "../../config/FetchClient";
import {ApiConfig} from "../../config/ApiConfig";

export interface ShareLinkInfo {
    teamId: string;
    retroId: string;
}

async function validateShareLink(token: string): Promise<ShareLinkInfo> {
    const response = await fetchClient.get<ShareLinkInfo>(`${ApiConfig.baseApiUrl()}/api/share/${token}`);
    return response.data;
}

export const ShareLinkService = {
    validateShareLink
};
