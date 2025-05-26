import {TeamListItem, TeamService} from "../../services/TeamService.ts";
import {RetroListItem, RetroService, Template} from "../../services/RetroService.ts";
import {RetroTemplateService} from "../../services/RetroTemplateService.ts";

export interface TeamPageData extends TeamListItem {
    retros: RetroListItem[],
    templates: Template[]
}

export async function loader({params}: any): Promise<TeamPageData> {
    return {
        ...await TeamService.getTeam(params.teamId),
        templates: await RetroTemplateService.getTemplates(),
        retros: await RetroService.getRetrosForTeam(params.teamId)
    }
}