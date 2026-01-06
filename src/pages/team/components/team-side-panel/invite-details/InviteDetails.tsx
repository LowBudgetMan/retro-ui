import {InviteListItem} from "../../invite-list-item/InviteListItem.tsx";
import {Invite, TeamService} from "../../../../../services/team-service/TeamService.ts";
import {useRevalidator} from "react-router-dom";
import accordionStyles from '../Accordion.module.css';

interface Props {
    id: string;
    name: string;
    invites: Invite[];
}

export function InviteDetails({id, name, invites}: Props) {
    const revalidator = useRevalidator();

    const handleCreateInvite = async () => {
        await TeamService.createInvite(id).then(() => revalidator.revalidate());
    }

    return (
        <details className={accordionStyles.sidePaneAccordion}>
            <summary className={accordionStyles.sidePaneAccordionHeader}>
                <h2 className={accordionStyles.sidePaneAccordionHeaderTitle}>Invites</h2>
            </summary>
            <div className={accordionStyles.sidePaneAccordionContent}>
                <button onClick={handleCreateInvite}>Create invite link</button>
                <ol>
                    {invites.map((invite) => (
                        <li key={invite.id}>
                            <InviteListItem invite={invite} teamId={id} teamName={name}/>
                        </li>
                    ))}
                </ol>
            </div>
        </details>
    )
}