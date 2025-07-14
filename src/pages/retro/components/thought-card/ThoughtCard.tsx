import {Thought} from "../../../../services/RetroService.ts";
import styles from './ThoughtCard.module.css';

interface Props {
    thought: Thought;
}

export function ThoughtCard({thought}: Props) {
    return (
        <div className={styles.card}>
            <p className={styles.message}>{thought.message}</p>
            <div className={styles.actionsContainer}>
                <button className={styles.action} name='vote' aria-label={'vote'}>{thought.votes}</button>
                <button className={styles.action} name='edit' aria-label={'edit'}>E</button>
                <button className={styles.action} name='delete' aria-label={'delete'}>D</button>
                <button className={styles.action} name='mark complete' aria-label={'mark complete'}>C</button>
            </div>
        </div>
    )
}