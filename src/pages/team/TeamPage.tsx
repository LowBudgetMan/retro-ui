import {Link, useLoaderData} from "react-router-dom";
import {TeamPageData} from "./teamLoader.ts";
import {RetroCard} from "../../components/retro-card/RetroCard.tsx";
import teamStyles from "./TeamPage.module.css";
import "../../styles/global.css";
import {CreateRetroButton} from "./components/CreateRetroButton.tsx";
import {notFoundTemplate} from "../../services/RetroService.ts";

export function TeamPage() {
    const team = useLoaderData() as TeamPageData;
    return (
        <main className={teamStyles.teamPage}>

            {/* This probably needs to not be directly in the h1 tag for accessibility reasons */}
            <h1><Link to={'/user'} className={'breadcrumb'}>&lt;</Link> {team.name}</h1>
            <ol className={teamStyles.retrosList}>
                <li className={teamStyles.retroListItem}><CreateRetroButton /></li>
                {team.retros.map(retro => <li key={retro.id+retro.teamId} className={teamStyles.retroListItem}>
                    <RetroCard retro={retro} template={team.templates.find((template) => template.id === retro.templateId) || notFoundTemplate}/>
                </li>)}
            </ol>
        </main>
    )
}