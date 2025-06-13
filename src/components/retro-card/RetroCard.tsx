import {RetroListItem, Template} from "../../services/RetroService.ts";
import {Link} from "react-router-dom";
import cardStyles from "./RetroCard.module.css";

interface RetroCardProps {
    retro: RetroListItem;
    template: Template
}

export function RetroCard({retro, template}: RetroCardProps) {
    return (
        <Link className={cardStyles.link} to={`/teams/${retro.teamId}/retros/${retro.id}`}>
            <div className={cardStyles.retroCard}>
                <p className={cardStyles.retroName}>{template.name}</p>
                <p className={cardStyles.retroCreatedDate}>{new Intl.DateTimeFormat("en-US").format(retro.createdAt)}</p>
            </div>
        </Link>
    )
}