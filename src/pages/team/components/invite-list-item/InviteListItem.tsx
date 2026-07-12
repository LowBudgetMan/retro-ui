import {Invite, TeamService} from "../../../../services/team-service/TeamService.ts";
import {InvitePackage} from "../../../invite/inviteLoader.ts";
import {useRevalidator} from "react-router-dom";
import {useToasts} from "../../../../context/hooks.tsx";
import {ToastType} from "../../../../context/toast/ToastContextTypes.ts";

interface Props {
    invite: Invite;
    teamId: string;
    teamName: string;
}

export function InviteListItem({ invite, teamId, teamName }: Props) {
    const revalidator = useRevalidator();
    const {queueToast} = useToasts();

    const handleCopy = async (inviteId: string): Promise<void> => {
        const invitePackage = btoa(JSON.stringify({
            inviteId,
            teamId,
            teamName
        } as InvitePackage));
        const inviteLink = `${window.location.origin}/invite?package=${invitePackage}`;
        try {
            await navigator.clipboard.writeText(inviteLink);
            queueToast({message: "Copied invite link to clipboard", type: ToastType.SUCCESS});
        } catch (err) {
            queueToast({message: "Failed to copy invite link", type: ToastType.FAILURE});
            console.error('Failed to copy text: ', err);
        }
    }

    const handleDelete = async (teamId: string, inviteId: string) => {
        await TeamService.deleteInvite(teamId, inviteId)
            .then(() => {revalidator.revalidate()})
            .catch((err) => {
                queueToast({message: "Couldn't delete invite. Please try again.", type: ToastType.FAILURE});
                console.error('Delete failed:', err);
            });
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
