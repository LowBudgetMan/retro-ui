import {ActionItem} from "../../../../../services/action-items-service/ActionItemsService.ts";
import {ActionItemCard} from "../action-item-card/ActionItemCard.tsx";
import styles from './ActionItemsList.module.css';

interface Props {
    actionItems: ActionItem[];
}

export function ActionItemsList({actionItems}: Props) {
    return (
        <ol className={styles.list}>
            {actionItems.map(item => (<li key={item.id} ><ActionItemCard actionItem={item}/></li>))}
        </ol>
    );
}