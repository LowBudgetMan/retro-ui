import {ActionItem, ActionItemsService} from "../../../../../services/action-items-service/ActionItemsService.ts";
import styles from './ActionItemCard.module.css';
import {useCallback} from "react";

export interface ActionItemCardProps {
    actionItem: ActionItem;
}

export function ActionItemCard({actionItem}: ActionItemCardProps) {
    const handleCompleteClicked = useCallback(async () => {
        await ActionItemsService.setCompleted(actionItem.teamId, actionItem.id, !actionItem.completed);
    }, [actionItem])

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
                <button onClick={handleCompleteClicked}>{actionItem.completed ? 'C' : 'N'}</button>
            </div>
        </div>
    )
}