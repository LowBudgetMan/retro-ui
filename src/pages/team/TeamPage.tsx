import {Link, useLoaderData} from "react-router-dom";
import {TeamPageData} from "./teamLoader.ts";
import {RetroCard} from "../../components/retro-card/RetroCard.tsx";
import teamStyles from "./TeamPage.module.css";
import {CreateRetroButton} from "./components/CreateRetroButton.tsx";

export function TeamPage() {
    const team = useLoaderData() as TeamPageData;
    return (
        <main>
            <Link to={'/user'}>Home</Link>
            <h1>{team.name}</h1>
            <ul className={teamStyles.retrosList}>
                <li><CreateRetroButton /></li>
                {team.retros.map(retro => <li key={retro.id+retro.teamId}><RetroCard retro={retro} /></li>)}
            </ul>
        </main>
    )
}