import {ActionItem, ActionItemsService} from "../../../../../services/action-items-service/ActionItemsService.ts";
import styles from './ActionItemCard.module.css';
import {useCallback, useEffect, KeyboardEvent, useState} from "react";
import {onKeys} from "../../../../../services/key-event-handler/KeyEventHandler.ts";
import {AssigneeInput} from "../AssigneeInput/AssigneeInput.tsx";
import {FaEdit, FaRegTrashAlt} from "react-icons/fa";
import {ImCheckboxChecked, ImCheckboxUnchecked} from "react-icons/im";
import {DateTime} from "luxon";

function nthCalculator(dateTime: DateTime): string {
    const dayOfMonth = dateTime.day;
    const suffixMap: Record<Intl.LDMLPluralRule, string> = { one: 'st', two: 'nd', few: 'rd', other: 'th', many: 'th', zero: 'th' };
    const locale = 'en-US';

    const ordinal = new Intl.PluralRules(locale, { type: 'ordinal' }).select(dayOfMonth);
    return suffixMap[ordinal];
}

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
                    <p className={styles.content}>Are you sure you want to delete this action item?</p>
                    <div className={styles.cardBottom}>
                        <button className={`${styles.bottomItem} ${styles.bottomButton} ${styles.confirmDelete}`} onClick={handleDeleteConfirm}>Confirm</button>
                        <button className={`${styles.bottomItem} ${styles.bottomButton} ${styles.cancelDelete}`} onClick={handleDeleteCancel}>Cancel</button>
                    </div>
                </div>
            ) : (
                <>
                    <div className={styles.content}>
                        {editing ? (
                            <textarea
                                value={editValue}
                                onChange={(event) => {setEditValue(event.target.value);}}
                                onKeyDown={onKeys(['Enter'], handleKeyPress)}
                            >{actionItem.action}</textarea>
                        ) : (
                            <p className={styles.action}>{actionItem.action}</p>
                        )}
                        <AssigneeInput actionItem={actionItem} />
                    </div>
                    <div className={styles.cardBottom}>
                        <p className={`${styles.bottomItem} ${styles.createdDate}`}>
                            <span style={{fontWeight: 'bold'}}>Created</span>
                            <span>{actionItem.createdAt.toFormat('MMM dd')}{nthCalculator(actionItem.createdAt)}</span>
                        </p>
                        <button className={`${styles.bottomItem} ${styles.bottomButton}`} aria-label={'edit'} onClick={() => setEditing(!editing)}>
                            <FaEdit title={'Edit'} fontSize={'1rem'}/>
                        </button>
                        <button className={`${styles.bottomItem} ${styles.bottomButton}`} aria-label={'delete'} onClick={handleDeleteClick}>
                            <FaRegTrashAlt title={'Delete'} fontSize={'1rem'}/>
                        </button>
                        <button className={`${styles.bottomItem} ${styles.bottomButton}`} aria-label={'mark complete'} onClick={handleCompleteClicked}>
                            {actionItem.completed ? <ImCheckboxChecked title={'Completed'} fontSize={'1rem'}/> : <ImCheckboxUnchecked title={'Incomplete'} fontSize={'1rem'}/>}
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
