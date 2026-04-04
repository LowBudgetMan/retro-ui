import { fetchClient } from "../../config/FetchClient";
import {Template} from "../retro-service/RetroService.ts";
import {ApiConfig} from "../../config/ApiConfig.ts";

async function getTemplates(): Promise<Template[]> {
    return fetchClient.get<Template[]>(`${ApiConfig.baseApiUrl()}/api/templates`).then(response => response.data);
}

export const RetroTemplateService = {
    getTemplates
}
