import {TeamListItem} from "../../services/team-service/TeamService.ts";
import {Link} from "react-router-dom";
import cardStyle from "./TeamCard.module.css";

interface TeamCardProps {
    team: TeamListItem
}

export function TeamCard({team}: TeamCardProps) {
    return (
        <Link className={cardStyle.link} to={`/teams/${team.id}`}>
            <div className={cardStyle.teamCard}>
                <p className={cardStyle.teamName}>{team.name}</p>
                <p className={cardStyle.teamCreatedDate}>{new Intl.DateTimeFormat("en-US").format(team.createdAt)}</p>
            </div>
        </Link>
    )
}