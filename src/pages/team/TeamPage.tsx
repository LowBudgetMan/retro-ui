import {useLoaderData} from "react-router-dom";
import {TeamPageData} from "./teamLoader.ts";
import {ActionItemsContextProvider} from "../../context/action-items/ActionItemsContext.tsx";
import {TeamComponent} from "./TeamComponent.tsx";
import {useEffect} from "react";
import {WebsocketService} from "../../services/websocket/WebsocketService.ts";

export function TeamPage() {
    const team = useLoaderData() as TeamPageData;
    //TODO: Figure out how to move this inside the context provider
    useEffect(() => {
        WebsocketService.connect().catch();
        return () => {WebsocketService.disconnect()};
    });

    return (
        <ActionItemsContextProvider teamId={team.id} actionItems={team.actionItems}>
            <TeamComponent id={team.id} name={team.name} invites={team.invites} retros={team.retros} templates={team.templates} />
        </ActionItemsContextProvider>
    )
}