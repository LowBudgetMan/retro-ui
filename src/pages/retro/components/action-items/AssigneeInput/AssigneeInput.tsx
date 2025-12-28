import {ActionItem, ActionItemsService} from "../../../../../services/action-items-service/ActionItemsService.ts";
import {KeyboardEvent, useState} from "react";
import {onKeys} from "../../../../../services/key-event-handler/KeyEventHandler.ts";
import styles from './AssigneeInput.module.css';

export interface AssigneeInputProps {
    actionItem: ActionItem;
}

export function AssigneeInput({actionItem}: AssigneeInputProps) {
    const [assignee, setAssignee] = useState(actionItem.assignee);

    const handleUpdate = async () => {
        if (assignee) {
            await ActionItemsService.setAssignee(actionItem.teamId, actionItem.id, assignee);
        } else {
            setAssignee(actionItem.assignee);
        }
    };

    const handleKeyPress = async (event: KeyboardEvent<HTMLInputElement>) => {
        if (!event.shiftKey) {
            await handleUpdate();
        }
    };

    return (
        <label className={styles.inputContainer}>
            <span className={styles.assigneeLabel}>Assigned to</span>
            <input
                className={styles.assignee}
                type="text"
                value={assignee}
                onChange={(event) => setAssignee(event.target.value)}
                onKeyDown={onKeys(['Enter'], handleKeyPress)}
                onBlur={handleUpdate}
            />
        </label>
    );
}
