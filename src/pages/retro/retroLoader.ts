import {Retro, RetroService} from "../../services/retro-service/RetroService.ts";
import {ActionItem, ActionItemsService} from "../../services/action-items-service/ActionItemsService.ts";
import {LoaderFunctionArgs} from "react-router-dom";
import {hasShareToken} from "../../services/anonymous-auth/AnonymousAuthService.ts";

export type RetroPageLoaderData = {
    retro: Retro;
    actionItems: ActionItem[];
}

export async function loader({params}: LoaderFunctionArgs<{teamId: string, retroId: string}>): Promise<RetroPageLoaderData> {
    return {
        retro: await RetroService.getRetro(params.teamId!, params.retroId!),
        actionItems: hasShareToken(params.retroId!) ? [] : await ActionItemsService.getActionItems(params.teamId!)
    };
}
