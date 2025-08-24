import {ActionItem} from "../../../../../services/action-items-service/ActionItemsService.ts";
import styles from './ActionItemCard.module.css';

export interface ActionItemCardProps {
    actionItem: ActionItem;
}

export function ActionItemCard({actionItem}: ActionItemCardProps) {
    return (
        <div id={actionItem.id} className={styles.card}>
            <div>
                <p>{actionItem.action}</p>
                <p>{actionItem.assignee}</p>
            </div>
            <div className={styles.cardBottom}>
                <p>{actionItem.createdAt.toLocaleString()}</p>
                <button>E</button>
                <button>D</button>
                <button>{actionItem.completed ? 'C' : 'N'}</button>
            </div>
        </div>
    )
}