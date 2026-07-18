import { fetchClient } from "../../config/FetchClient";
import {Template} from "../retro-service/RetroService.ts";
import {ApiConfig} from "../../config/ApiConfig.ts";
import {transformCategoryColors} from "../../utils/color/color.ts";

function transformTemplate(template: Template): Template {
    return {
        ...template,
        categories: template.categories.map(transformCategoryColors)
    };
}

async function getTemplates(): Promise<Template[]> {
    return fetchClient.get<Template[]>(`${ApiConfig.baseApiUrl()}/api/templates`)
        .then(response => response.data.map(transformTemplate));
}

export const RetroTemplateService = {
    getTemplates
}
