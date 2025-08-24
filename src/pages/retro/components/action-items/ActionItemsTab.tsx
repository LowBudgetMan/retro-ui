import styles from './ActionItemsTab.module.css';
import {useEffect, useState} from "react";
import {onKeys} from "../../../../services/key-event-handler/KeyEventHandler.ts";
import {useActionItems} from "../../../../context/hooks.tsx";
import {ActionItemCard} from "./action-item-card/ActionItemCard.tsx";

export function ActionItemsTab() {
    const {actionItems} = useActionItems();
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const toggleActionItemsPane = () => setIsOpen(!isOpen);

    useEffect(() => {
        const handleKeyDown = onKeys<KeyboardEvent>(['Escape'], () => setIsOpen(false));

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <div className={`${styles.container} ${isOpen ? styles.containerOpen : styles.containerClosed}`}>
            <button className={styles.tab} onClick={toggleActionItemsPane}>Action Items</button>
            <div className={styles.content}>
                <ol className={styles.list}>
                    {actionItems.map(item => (<li className={styles.listItem} key={item.id} ><ActionItemCard actionItem={item}/></li>))}
                </ol>
            </div>
        </div>
    )
}
