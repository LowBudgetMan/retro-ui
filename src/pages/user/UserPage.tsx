import {useLoaderData} from "react-router-dom";
import {UserPageData} from "./userLoader.ts";
import {TeamCard} from "../../components/team-card/TeamCard.tsx";
import pageStyles from "./UserPage.module.css";
import {CreateTeamButton} from "./components/CreateTeamButton.tsx";

export function UserPage() {
    const data = useLoaderData() as UserPageData;

    return (
        <main className={pageStyles.userPage}>
            <h2 className={pageStyles.teamsTitle}>Teams</h2>
            <ol className={pageStyles.teamsList}>
                <li className={`${pageStyles.teamItem}`} key={'createTeam'}><CreateTeamButton /></li>
                {data.teams.map(team => <li key={team.id} className={pageStyles.teamItem}><TeamCard team={team}/></li>)}
            </ol>
        </main>
    );
}
