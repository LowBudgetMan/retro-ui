import {RetroTemplateService} from "../../services/retro-template-service/RetroTemplateService.ts";
import {Template} from "../../services/retro-service/RetroService.ts";
import {ensureAuthenticatedApi} from "../../utils/authSetup.ts";

export interface TemplatesPageData {
    templates: Template[]
}

export async function loader(): Promise<TemplatesPageData> {
    await ensureAuthenticatedApi();

    return {
        templates: await RetroTemplateService.getTemplates()
    }
}
