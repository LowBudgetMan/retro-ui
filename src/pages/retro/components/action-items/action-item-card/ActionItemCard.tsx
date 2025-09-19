import {ActionItem, ActionItemsService} from "../../../../../services/action-items-service/ActionItemsService.ts";
import styles from './ActionItemCard.module.css';
import {useCallback, useEffect, KeyboardEvent, useState} from "react";
import {onKeys} from "../../../../../services/key-event-handler/KeyEventHandler.ts";
import {AssigneeInput} from "../AssigneeInput/AssigneeInput.tsx";

export interface ActionItemCardProps {
    actionItem: ActionItem;
}

export function ActionItemCard({actionItem}: ActionItemCardProps) {
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [editing, setEditing] = useState<boolean>(false);
    const [editValue, setEditValue] = useState(actionItem.action ?? '');

    function handleKeyPress(event: KeyboardEvent<HTMLTextAreaElement>) {
        if (!event.shiftKey) ActionItemsService.setAction(actionItem.teamId, actionItem.id, editValue).then(() => setEditing(false));
    }

    useEffect(() => {
        setEditValue(actionItem.action ?? '');
    }, [actionItem, editing])

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
        setEditing(false);
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
                        {editing ? (
                            <textarea
                                value={editValue}
                                onChange={(event) => {setEditValue(event.target.value);}}
                                onKeyDown={onKeys(['Enter'], handleKeyPress)}
                            >{actionItem.action}</textarea>
                        ) : (
                            <p>{actionItem.action}</p>
                        )}
                        <AssigneeInput actionItem={actionItem} />
                    </div>
                    <div className={styles.cardBottom}>
                        <p>{actionItem.createdAt.toLocaleString()}</p>
                        <button onClick={() => setEditing(!editing)}>E</button>
                        <button onClick={handleDeleteClick}>D</button>
                        <button onClick={handleCompleteClicked}>{actionItem.completed ? 'C' : 'N'}</button>
                    </div>
                </>
            )}
        </div>
    )
}
