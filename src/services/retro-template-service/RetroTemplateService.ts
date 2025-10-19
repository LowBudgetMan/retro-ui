import axios from "axios";
import {Template} from "../retro-service/RetroService.ts";
import {ApiConfig} from "../../config/ApiConfig.ts";

async function getTemplates(): Promise<Template[]> {
    return axios.get(`${ApiConfig.baseApiUrl()}/api/templates`).then(response => response.data);
}

export const RetroTemplateService = {
    getTemplates
}
