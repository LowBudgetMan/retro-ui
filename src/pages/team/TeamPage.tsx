import {useLoaderData} from "react-router-dom";
import {TeamPageData} from "./teamLoader.ts";
import {ActionItemsContextProvider} from "../../context/action-items/ActionItemsContext.tsx";
import {TeamComponent} from "./TeamComponent.tsx";

export function TeamPage() {
    const team = useLoaderData<TeamPageData>();

    return (
        <ActionItemsContextProvider teamId={team.id} actionItems={team.actionItems}>
            <TeamComponent id={team.id} name={team.name} invites={team.invites} retros={team.retros} templates={team.templates} />
        </ActionItemsContextProvider>
    )
}
