import {Link, useLoaderData} from "react-router-dom";
import {Team} from "./teamLoader.ts";
import {RetroService} from "../../services/RetroService.ts";

export function TeamPage() {
    const team = useLoaderData() as Team;
    return (
        <main>
            <Link to={'/user'}>Home</Link>
            <h1>{team.name}</h1>
            <button onClick={() => RetroService.createRetro(team.id, 'happy-confused-sad.yml')}>Create retro</button>
            <ul>
                {team.retros.map(retro => <li key={retro.id+retro.teamId}><Link to={`/teams/${retro.teamId}/retros/${retro.id}`}>{retro.id}</Link></li>)}
            </ul>
        </main>
    )
}