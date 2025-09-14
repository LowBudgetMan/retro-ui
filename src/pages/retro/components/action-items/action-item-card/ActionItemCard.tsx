import {ActionItem, ActionItemsService} from "../../../../../services/action-items-service/ActionItemsService.ts";
import styles from './ActionItemCard.module.css';
import {useCallback, useState} from "react";

export interface ActionItemCardProps {
    actionItem: ActionItem;
}

export function ActionItemCard({actionItem}: ActionItemCardProps) {
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    const handleCompleteClicked = useCallback(async () => {
        await ActionItemsService.setCompleted(actionItem.teamId, actionItem.id, !actionItem.completed);
    }, [actionItem]);

    const handleDeleteConfirm = useCallback(async () => {
        await ActionItemsService.deleteActionItem(actionItem.teamId, actionItem.id);
        setShowDeleteConfirmation(false);
    }, [actionItem]);

    const handleDeleteCancel = useCallback(() => {
        setShowDeleteConfirmation(false);
    }, [])

    const handleDeleteClick = useCallback(() => {
        setShowDeleteConfirmation(true);
    }, [])

    return (
        <div id={actionItem.id} className={styles.card}>
            {showDeleteConfirmation ? (
                <div>
                    <p>Are you sure you want to delete this action item?</p>
                    <div className={styles.cardBottom}>
                        <button onClick={handleDeleteConfirm}>Confirm</button>
                        <button onClick={handleDeleteCancel}>Cancel</button>
                    </div>
                </div>
            ) : (
                <>
                    <div>
                        <p>{actionItem.action}</p>
                        <p>{actionItem.assignee}</p>
                    </div>
                    <div className={styles.cardBottom}>
                        <p>{actionItem.createdAt.toLocaleString()}</p>
                        <button>E</button>
                        <button onClick={handleDeleteClick}>D</button>
                        <button onClick={handleCompleteClicked}>{actionItem.completed ? 'C' : 'N'}</button>
                    </div>
                </>
            )}
        </div>
    )
}
