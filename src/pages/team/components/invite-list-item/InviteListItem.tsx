import {Invite} from "../../../../services/team-service/TeamService.ts";
import {InvitePackage} from "../../../invite/inviteLoader.ts";

interface Props {
    invite: Invite;
    teamId: string;
    teamName: string;
}

export function InviteListItem({ invite, teamId, teamName }: Props) {

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

    return (
        <div>
            <span>{invite.id}</span>
            <span>{invite.createdAt.toISOString()}</span>
            <span><button onClick={() => handleCopy(invite.id)}>copy</button></span>
        </div>
    )
}