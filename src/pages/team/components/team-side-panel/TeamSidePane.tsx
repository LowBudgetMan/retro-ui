import {Invite} from "../../../../services/team-service/TeamService.ts";
import styles from './TeamSidePane.module.css';
import {InviteDetails} from "./invite-details/InviteDetails.tsx";
import {ActionItemDetails} from "./action-item-details/ActionItemDetails.tsx";

interface Props {
    id: string;
    name: string;
    invites: Invite[];
}

export function TeamSidePane({id, name, invites}: Props) {
    return (
        <aside className={styles.sidePane}>
            <InviteDetails id={id} name={name} invites={invites} />
            <ActionItemDetails />
        </aside>
    )
}