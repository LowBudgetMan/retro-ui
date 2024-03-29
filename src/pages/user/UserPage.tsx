import {Link, useLoaderData} from "react-router-dom";
import {User} from "./userLoader.ts";
import {TeamService} from "../../services/TeamService.ts";

export function UserPage() {
    const user = useLoaderData() as User;
    return (
        <main>
            <h1>Welcome, {user.name}</h1>
            <h2>Teams:</h2>
            <ol>
                {user.teams.map(team => <li className="team" key={team.id}><Link to={`/teams/${team.id}`} >{team.name}</Link></li>)}
            </ol>
            <button onClick={() => TeamService.createTeam((Math.random() + 1).toString(36).substring(7))}>Create Team</button>
        </main>
    );
}