import {TeamListItem, TeamService} from "../../services/TeamService.ts";
import {Retro, RetroService} from "../../services/RetroService.ts";

export interface TeamPageData extends TeamListItem {
    // actionItems: ActionItem[],
    retros: Retro[]
}

export async function loader({params}: any): Promise<TeamPageData> {
    return {
        ...await TeamService.getTeam(params.teamId),
        // actionItems: await ActionItemService.getActionItemsForTeam(params.teamId),
        retros: await RetroService.getRetrosForTeam(params.teamId)
    }
}