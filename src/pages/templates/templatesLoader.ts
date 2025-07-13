import {RetroTemplateService} from "../../services/RetroTemplateService.ts";
import {Template} from "../../services/RetroService.ts";
import {waitForAuthInitialization} from "../user/UserContext.ts";

export interface TemplatesPageData {
    templates: Template[]
}

export async function loader(): Promise<TemplatesPageData> {
    await waitForAuthInitialization();
    
    return {
        templates: await RetroTemplateService.getTemplates()
    }
}
