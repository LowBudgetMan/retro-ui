import {Invite, TeamListItem, TeamService} from "../../services/team-service/TeamService.ts";
import {RetroListItem, RetroService, Template} from "../../services/retro-service/RetroService.ts";
import {RetroTemplateService} from "../../services/retro-template-service/RetroTemplateService.ts";
import {LoaderFunctionArgs} from "react-router-dom";
import {ActionItem, ActionItemsService} from "../../services/action-items-service/ActionItemsService.ts";
import {ApiToken, ApiTokenService} from "../../services/api-token-service/ApiTokenService.ts";

export interface TeamPageData extends TeamListItem {
    invites: Invite[],
    retros: RetroListItem[],
    templates: Template[],
    actionItems: ActionItem[],
    apiTokens: ApiToken[],
}

export async function loader({params}: LoaderFunctionArgs<{teamId: string}>): Promise<TeamPageData> {
    return {
        ...await TeamService.getTeam(params.teamId!),
        templates: await RetroTemplateService.getTemplates(),
        retros: await RetroService.getRetrosForTeam(params.teamId!),
        invites: await TeamService.getInvitesForTeam(params.teamId!),
        actionItems: await ActionItemsService.getActionItems(params.teamId!),
        apiTokens: await ApiTokenService.getTokens(params.teamId!),
    }
}
