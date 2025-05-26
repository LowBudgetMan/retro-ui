import {RetroListItem} from "../../services/RetroService.ts";
import {Link} from "react-router-dom";
import cardStyles from "./RetroCard.module.css";

interface RetroCardProps {
    retro: RetroListItem;
}

export function RetroCard({retro}: RetroCardProps) {
    return (
        <Link className={cardStyles.link} to={`/teams/${retro.teamId}/retros/${retro.id}`}>
            <div>
                <p>{retro.templateId}</p>
                <p>{new Intl.DateTimeFormat("en-US").format(retro.createdAt)}</p>
            </div>
        </Link>
    )
}