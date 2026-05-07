import {Invite} from "../../../../services/team-service/TeamService.ts";
import {ApiToken} from "../../../../services/api-token-service/ApiTokenService.ts";
import styles from './TeamSidePane.module.css';
import {InviteDetails} from "./invite-details/InviteDetails.tsx";
import {ActionItemDetails} from "./action-item-details/ActionItemDetails.tsx";
import {ApiTokensPanel} from "./api-tokens/ApiTokensPanel.tsx";

interface Props {
    id: string;
    name: string;
    invites: Invite[];
    apiTokens: ApiToken[];
}

export function TeamSidePane({id, name, invites, apiTokens}: Props) {
    return (
        <aside className={styles.sidePane}>
            <InviteDetails id={id} name={name} invites={invites} />
            <ActionItemDetails />
            <ApiTokensPanel teamId={id} tokens={apiTokens} />
        </aside>
    )
}
