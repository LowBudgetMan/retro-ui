import {Retro, RetroService} from "../../services/retro-service/RetroService.ts";
import {ActionItem, ActionItemsService} from "../../services/action-items-service/ActionItemsService.ts";
import {LoaderFunctionArgs} from "react-router-dom";
import {ensureAuthenticatedWithReturnUrl} from "../../utils/authSetup.ts";
import {isAnonymousMode} from "../../services/anonymous-auth/AnonymousAuthService.ts";

export type RetroPageLoaderData = {
    retro: Retro;
    actionItems: ActionItem[];
}

export async function loader({params}: LoaderFunctionArgs<{teamId: string, retroId: string}>): Promise<RetroPageLoaderData> {
    if (!isAnonymousMode()) {
        await ensureAuthenticatedWithReturnUrl();
    }
    return {
        retro: await RetroService.getRetro(params.teamId!, params.retroId!),
        actionItems: isAnonymousMode() ? [] : await ActionItemsService.getActionItems(params.teamId!)
    };
}
