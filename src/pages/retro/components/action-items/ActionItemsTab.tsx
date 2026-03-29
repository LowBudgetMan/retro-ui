import styles from './ActionItemsTab.module.css';
import {FormEvent, useEffect, useState} from "react";
import {onKeys} from "../../../../services/key-event-handler/KeyEventHandler.ts";
import {useActionItems} from "../../../../context/hooks.tsx";
import {ActionItemsService} from "../../../../services/action-items-service/ActionItemsService.ts";
import {CountSeparator} from "../count-separator/CountSeparator.tsx";
import {ActionItemsList} from "./action-items-list/ActionItemsList.tsx";
import {useIsMobile} from "../../../../hooks/useIsMobile.ts";

export function ActionItemsTab() {
    const {teamId, actionItems} = useActionItems();
    const mobile = useIsMobile();
    const [isOpen, setIsOpen] = useState<boolean>(true);

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

    const containerClass = mobile
        ? styles.mobileContainer
        : `${styles.container} ${isOpen ? styles.containerOpen : styles.containerClosed}`;

    return (
        <div className={containerClass}>
            {!mobile && <button className={styles.tab} onClick={toggleActionItemsPane}>Action Items</button>}
            <div className={mobile ? '' : styles.content}>
                <h2 className={styles.paneHeader}>Action Items</h2>
                <form className={styles.actionItemForm} onSubmit={handleSubmit}>
                    <input type={'text'} name={'actionItem'} placeholder={'Enter Action Item'} required={true} className={styles.itemInput}/>
                    <input type={'text'} name={'assignee'} placeholder={'Enter Assignee'} required={true} className={styles.assignInput}/>
                    <button type={'submit'} className={styles.addButton}>Add</button>
                </form>
                <CountSeparator count={actionItems.length} />
                <ActionItemsList actionItems={actionItems} />
            </div>
        </div>
    )
}
