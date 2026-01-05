import {ActionItemsList} from "../../../../retro/components/action-items/action-items-list/ActionItemsList.tsx";
import {useActionItems} from "../../../../../context/hooks.tsx";

export function ActionItemDetails() {
    const {actionItems} = useActionItems();
    return (
        <details open={true}>
            <summary><h2>Action Items</h2></summary>
            <ActionItemsList actionItems={actionItems} />
        </details>
    )
}