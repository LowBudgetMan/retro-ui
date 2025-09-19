import {ActionItem, ActionItemsService} from "../../../../../services/action-items-service/ActionItemsService.ts";
import {KeyboardEvent, useState} from "react";
import {onKeys} from "../../../../../services/key-event-handler/KeyEventHandler.ts";

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
        <label>Assigned to
            <input
                type="text"
                value={assignee}
                onChange={(event) => setAssignee(event.target.value)}
                onKeyDown={onKeys(['Enter'], handleKeyPress)}
                onBlur={handleUpdate}
            />
        </label>
    );
}
