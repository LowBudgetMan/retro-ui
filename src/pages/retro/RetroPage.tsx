import {RetroContextProvider} from "../../context/retro/RetroContext.tsx";
import {RetroComponent} from "./Retro.tsx";
import {WebsocketService} from "../../services/websocket/WebsocketService.ts";
import {useEffect} from "react";
import {ActionItemsContextProvider} from "../../context/action-items/ActionItemsContext.tsx";
import {useLoaderData} from "react-router-dom";
import {RetroPageLoaderData} from "./retroLoader.ts";

export function RetroPage() {
    useEffect(() => {
        WebsocketService.connect().catch();
        return () => {WebsocketService.disconnect()};
    });

    const {retro, actionItems} = useLoaderData() as RetroPageLoaderData;

    return (
        <RetroContextProvider retro={retro}>
            <ActionItemsContextProvider teamId={retro.teamId} actionItems={actionItems}>
                <RetroComponent />
            </ActionItemsContextProvider>
        </RetroContextProvider>
    )
}