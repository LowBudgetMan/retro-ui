import {useLoaderData, useNavigate} from "react-router-dom";
import {TeamService} from "../../services/team-service/TeamService.ts";
import {InvitePageData} from "./inviteLoader.ts";

export function InvitePage() {
    const {teamId, teamName, inviteId} = useLoaderData() as InvitePageData;
    const navigate = useNavigate();

    const handleAcceptance = async function handleAcceptance() {
        await TeamService.addUserToTeam(teamId, inviteId);
        navigate(`/teams/${teamId}`);
    }

    return (
        <main>
            <h1>You&apos;ve been invited to join <strong>{teamName}</strong>!</h1>
            <button onClick={handleAcceptance}>Accept</button>
        </main>
    )
}