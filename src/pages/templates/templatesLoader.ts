import {RetroTemplateService} from "../../services/RetroTemplateService.ts";
import {Template} from "../../services/RetroService.ts";

export interface TemplatesPageData {
    templates: Template[]
}

export async function loader(): Promise<TemplatesPageData> {
    return {
        templates: await RetroTemplateService.getTemplates()
    }
}