import {TeamService} from "../../services/TeamService.ts";
import {ActionItem} from "../../services/ActionItemService.ts";
import {Retro, RetroService} from "../../services/RetroService.ts";

export interface Team {
    id: string,
    name: string,
    createdAt: Date,
    actionItems: ActionItem[],
    retros: Retro[]
}

export async function loader({params}: any): Promise<Team> {
    return {
        ...await TeamService.getTeam(params.teamId),
        // actionItems: await ActionItemService.getActionItemsForTeam(params.teamId),
        retros: await RetroService.getRetrosForTeam(params.teamId)
    }
}