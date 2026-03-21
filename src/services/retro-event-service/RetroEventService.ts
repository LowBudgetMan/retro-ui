import axios from "axios";
import {ApiConfig} from "../../config/ApiConfig";

async function focus(teamId: string, retroId: string, thoughtId: string) {
    return await axios.post(`${ApiConfig.baseApiUrl()}/api/teams/${teamId}/retros/${retroId}/events/focus`, {
        thoughtId,
    });
}

async function clearFocus(teamId: string, retroId: string) {
    return await axios.post(`${ApiConfig.baseApiUrl()}/api/teams/${teamId}/retros/${retroId}/events/focus-clear`);
}

export const RetroEventService = {
    focus,
    clearFocus
}
