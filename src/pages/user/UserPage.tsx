import {useLoaderData} from "react-router-dom";
import {UserPageData} from "./userLoader.ts";
import {TeamCard} from "../../components/TeamCard.tsx";
import pageStyles from "./UserPage.module.css";
import {CreateTeamModal} from "./components/CreateTeamModal.tsx";
import {useState} from "react";

function CreateTeamButton() {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    return <>
        <CreateTeamModal isOpen={isOpen} setIsOpen={setIsOpen}/>
        <button className={pageStyles.createNewTeamButton} onClick={() => setIsOpen(true)}>
            <p>+</p>
        </button>
    </>;
}

export function UserPage() {
    const user = useLoaderData() as UserPageData;

    return (
        <main className={pageStyles.userPage}>
            <p>Welcome, {user.name}</p>
            <h2 className={pageStyles.teamsTitle}>Teams</h2>
            <ol className={pageStyles.teamsList}>
                <li className={`${pageStyles.teamItem}`} key={'createTeam'}><CreateTeamButton /></li>
                {user.teams.map(team => <li key={team.id} className={pageStyles.teamItem}><TeamCard team={team}/></li>)}
            </ol>
        </main>
    );
}