import styles from './ActionItemsTab.module.css';
import {FormEvent, useEffect, useState} from "react";
import {onKeys} from "../../../../services/key-event-handler/KeyEventHandler.ts";
import {useActionItems} from "../../../../context/hooks.tsx";
import {ActionItemCard} from "./action-item-card/ActionItemCard.tsx";
import {ActionItemsService} from "../../../../services/action-items-service/ActionItemsService.ts";

export function ActionItemsTab() {
    const {teamId, actionItems} = useActionItems();
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const toggleActionItemsPane = () => setIsOpen(!isOpen);

    useEffect(() => {
        const handleKeyDown = onKeys<KeyboardEvent>(['Escape'], () => setIsOpen(false));

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const actionItem = form.elements.namedItem('actionItem') as HTMLInputElement;
        const assignee = form.elements.namedItem('assignee') as HTMLInputElement;
        ActionItemsService.createActionItem(teamId, actionItem.value, assignee.value)
            .then(() => {
                actionItem.value = '';
                assignee.value = '';
            })
            .catch((error) => console.error('Error creating team:', error));
    };

    return (
        <div className={`${styles.container} ${isOpen ? styles.containerOpen : styles.containerClosed}`}>
            <button className={styles.tab} onClick={toggleActionItemsPane}>Action Items</button>
            <div className={styles.content}>
                <h2 className={styles.paneHeader}>Action Items</h2>
                <form className={styles.actionItemForm} onSubmit={handleSubmit}>
                    <input type={'text'} name={'actionItem'} placeholder={'Enter Action Item'} required={true}/>
                    <input type={'text'} name={'assignee'} placeholder={'Enter Assignee'} required={true}/>
                    <button type={'submit'}>Add</button>
                </form>
                <ol className={styles.list}>
                    {actionItems.map(item => (<li className={styles.listItem} key={item.id} ><ActionItemCard actionItem={item}/></li>))}
                </ol>
            </div>
        </div>
    )
}
