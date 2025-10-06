import {Invite, TeamService} from "../../../../services/team-service/TeamService.ts";
import {InvitePackage} from "../../../invite/inviteLoader.ts";
import {useRevalidator} from "react-router-dom";

interface Props {
    invite: Invite;
    teamId: string;
    teamName: string;
}

export function InviteListItem({ invite, teamId, teamName }: Props) {
    const revalidator = useRevalidator();

    const handleCopy = async (inviteId: string): Promise<void> => {
        const invitePackage = btoa(JSON.stringify({
            inviteId,
            teamId,
            teamName
        } as InvitePackage));
        const inviteLink = `http://localhost:3000/invite?package=${invitePackage}`;
        try {
            await navigator.clipboard.writeText(inviteLink);
            // TODO: Add toast pop-up
        } catch (err) {
            console.error('Failed to copy text: ', err);
            // TODO: Add toast pop-up
        }
    }

    const handleDelete = async (teamId: string, inviteId: string) => {
        await TeamService.deleteInvite(teamId, inviteId)
            .then(() => {revalidator.revalidate()})
            .catch((err) => {console.error('Delete failed:', err)});
    }

    return (
        <div>
            <span>{invite.id}</span>
            <span>{invite.createdAt.toISOString()}</span>
            <span><button onClick={() => handleCopy(invite.id)}>copy</button></span>
            <span><button onClick={() => handleDelete(teamId, invite.id)}>delete</button></span>
        </div>
    )
}
