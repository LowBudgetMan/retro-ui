import {TeamService} from "../../services/TeamService.ts";
import {ActionItem, ActionItemService} from "../../services/ActionItemService.ts";

export interface Team {
    id: string,
    name: string,
    createdAt: Date,
    actionItems: ActionItem[]
}

export async function loader({params}: any): Promise<Team> {
    return {
        ...await TeamService.getTeam(params.teamId),
        actionItems: await ActionItemService.getActionItemsForTeam(params.teamId)
    }
}