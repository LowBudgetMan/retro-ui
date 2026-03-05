import {RetroTemplateService} from "../../services/retro-template-service/RetroTemplateService.ts";
import {Template} from "../../services/retro-service/RetroService.ts";

export interface TemplatesPageData {
    templates: Template[]
}

export async function loader(): Promise<TemplatesPageData> {
    return {
        templates: await RetroTemplateService.getTemplates()
    }
}
