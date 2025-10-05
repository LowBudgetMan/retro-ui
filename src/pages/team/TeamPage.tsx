import {Link, useLoaderData, useRevalidator} from "react-router-dom";
import {TeamPageData} from "./teamLoader.ts";
import {RetroCard} from "../../components/retro-card/RetroCard.tsx";
import teamStyles from "./TeamPage.module.css";
import "../../styles/global.css";
import {CreateRetroButton} from "./components/CreateRetroButton.tsx";
import {notFoundTemplate} from "../../services/retro-service/RetroService.ts";
import {TeamService} from "../../services/team-service/TeamService.ts";
import {InviteListItem} from "./components/invite-list-item/InviteListItem.tsx";

export function TeamPage() {
    const team = useLoaderData() as TeamPageData;
    const revalidator = useRevalidator();

    const handleCreateInvite = async () => {
        await TeamService.createInvite(team.id).then(() => revalidator.revalidate());
    }

    return (
        <main className={teamStyles.teamPage}>
            {/* This probably needs to not be directly in the h1 tag for accessibility reasons */}
            <h1><Link to={'/user'} className={'breadcrumb'} aria-label={"Back to user home"}>&lt;</Link> {team.name}</h1>
            <div>
                <h2>Invites</h2>
                <button onClick={handleCreateInvite}>Create invite link</button>
                <ol>
                    {team.invites.map((invite) => (<li  key={invite.id}><InviteListItem invite={invite} teamId={team.id} teamName={team.name} /></li>))}
                </ol>
            </div>
            <ol className={teamStyles.retrosList} data-testid="retros-list">
                <li className={teamStyles.retroListItem}><CreateRetroButton /></li>
                {team.retros.map(retro => <li key={retro.id+retro.teamId} className={teamStyles.retroListItem}>
                    <RetroCard retro={retro} template={team.templates.find((template) => template.id === retro.templateId) || notFoundTemplate}/>
                </li>)}
            </ol>
        </main>
    )
}
