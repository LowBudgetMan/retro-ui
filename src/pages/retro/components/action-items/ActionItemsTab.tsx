import styles from './ActionItemsTab.module.css';
import {useEffect, useState} from "react";
import {onKeys} from "../../../../services/key-event-handler/KeyEventHandler.ts";

export function ActionItemsTab() {
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
                <ol>
                    <li>thing1</li>
                    <li>thing1</li>
                    <li>thing1</li>
                    <li>thing1</li>
                    <li>thing1</li>
                    <li>thing1</li>
                    <li>thing1</li>
                    <li>thing1</li>
                    <li>thing1</li>
                    <li>thing1</li>
                    <li>thing1</li>
                    <li>thing1</li>
                    <li>thing1</li>
                    <li>thing1</li>
                    <li>thing1</li>
                </ol>
            </div>
        </div>
    )
}
