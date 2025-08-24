import axios from "axios";
import {Template} from "../retro-service/RetroService.ts";

async function getTemplates(): Promise<Template[]> {
    return axios.get("http://localhost:8080/api/templates").then(response => response.data);
}

export const RetroTemplateService = {
    getTemplates
}