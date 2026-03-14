import {RetroContextProvider} from "../../context/retro/RetroContext.tsx";
import {RetroComponent} from "./Retro.tsx";
import {ActionItemsContextProvider} from "../../context/action-items/ActionItemsContext.tsx";
import {useLoaderData} from "react-router-dom";
import {RetroPageLoaderData} from "./retroLoader.ts";
import {hasShareToken} from "../../services/anonymous-auth/AnonymousAuthService.ts";

export function RetroPage() {
    const {retro, actionItems} = useLoaderData() as RetroPageLoaderData;

    if (hasShareToken(retro.id)) {
        return (
            <RetroContextProvider retro={retro}>
                <RetroComponent />
            </RetroContextProvider>
        )
    }

    return (
        <RetroContextProvider retro={retro}>
            <ActionItemsContextProvider teamId={retro.teamId} actionItems={actionItems}>
                <RetroComponent />
            </ActionItemsContextProvider>
        </RetroContextProvider>
    )
}
