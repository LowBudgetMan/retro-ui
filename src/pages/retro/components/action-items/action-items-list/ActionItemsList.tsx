import {ActionItem} from "../../../../../services/action-items-service/ActionItemsService.ts";
import {ActionItemCard} from "../action-item-card/ActionItemCard.tsx";
import styles from './ActionItemsList.module.css';

interface Props {
    actionItems: ActionItem[];
}

function sort(actionItems: ActionItem[]): ActionItem[] {
    const complete: ActionItem[] = [];
    const incomplete: ActionItem[] = [];
    actionItems.forEach(actionItem => {
        actionItem.completed ?  complete.push(actionItem) : incomplete.push(actionItem);
    });

    incomplete.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
    complete.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());

    return [...incomplete, ...complete];
}

export function ActionItemsList({actionItems}: Props) {
    return (
        <ol className={styles.list}>
            {sort(actionItems).map(item => (<li key={item.id} ><ActionItemCard actionItem={item}/></li>))}
        </ol>
    );
}
