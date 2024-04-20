import {RetroContextProvider} from "./RetroContext.tsx";
import {RetroComponent} from "./Retro.tsx";
import {WebsocketService} from "../../services/websocket/WebsocketService.ts";
import {useEffect} from "react";

export function RetroPage() {
    useEffect(() => {
        WebsocketService.connect().catch();
        return () => {WebsocketService.disconnect()};
    });

    return (
        <RetroContextProvider>
            <RetroComponent />
        </RetroContextProvider>
    )
}