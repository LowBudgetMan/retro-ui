import {Retro, RetroService} from "../../services/retro-service/RetroService.ts";
import {ActionItem, ActionItemsService} from "../../services/action-items-service/ActionItemsService.ts";

export type RetroPageLoaderData = {
    retro: Retro;
    actionItems: ActionItem[];
}

export async function loader({params}: {params: {teamId: string, retroId: string}}): Promise<RetroPageLoaderData> {
    return {
        retro: await RetroService.getRetro(params.teamId, params.retroId),
        actionItems: await ActionItemsService.getActionItems(params.teamId)
    };
}