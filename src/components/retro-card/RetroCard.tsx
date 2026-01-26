import {RetroListItem, Template} from "../../services/retro-service/RetroService.ts";
import {Link} from "react-router-dom";
import cardStyles from "./RetroCard.module.css";

interface RetroCardProps {
    retro: RetroListItem;
    template: Template
}

export function RetroCard({retro, template}: RetroCardProps) {
    function cardContent() {
        return (
            <div className={`${cardStyles.retroCard} ${retro.finished ? cardStyles.finished : ''}`}>
                <p className={cardStyles.retroName}>{template.name}</p>
                <p className={cardStyles.retroCreatedDate}>{retro.createdAt.toLocaleString()}</p>
            </div>
        );
    }

    return (
        <>
            {retro.finished
                ? <div>{cardContent()}</div>
                : <Link className={cardStyles.link} to={`/teams/${retro.teamId}/retros/${retro.id}`}>{cardContent()}</Link>
            }
        </>
    )
}
