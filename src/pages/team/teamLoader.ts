import {Invite, TeamListItem, TeamService} from "../../services/team-service/TeamService.ts";
import {RetroListItem, RetroService, Template} from "../../services/retro-service/RetroService.ts";
import {RetroTemplateService} from "../../services/retro-template-service/RetroTemplateService.ts";
import {waitForAuthInitialization} from "../user/UserContext.ts";

export interface TeamPageData extends TeamListItem {
    invites: Invite[],
    retros: RetroListItem[],
    templates: Template[]
}

export async function loader({params}: {params: {teamId: string}}): Promise<TeamPageData> {
    await waitForAuthInitialization();
    
    return {
        ...await TeamService.getTeam(params.teamId),
        templates: await RetroTemplateService.getTemplates(),
        retros: await RetroService.getRetrosForTeam(params.teamId),
        invites: await TeamService.getInvitesForTeam(params.teamId)
    }
}
