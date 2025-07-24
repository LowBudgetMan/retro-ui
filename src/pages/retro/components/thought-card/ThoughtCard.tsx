import {Thought} from "../../../../services/RetroService.ts";
import styles from './ThoughtCard.module.css';
import {useCallback} from "react";
import {ThoughtService} from "../../../../services/thought-service/ThoughtService.ts";

interface Props {
    teamId: string;
    thought: Thought;
}

export function ThoughtCard({teamId, thought}: Props) {

    const handleCompleteClicked = useCallback(async () => {
        await ThoughtService.setCompleted(teamId, thought.retroId, thought.id, !thought.completed);
    }, [teamId, thought])

    const handleVote = useCallback(async () => {
        await ThoughtService.vote(teamId, thought.retroId, thought.id);
    }, [teamId, thought])

    return (
        <div className={styles.card}>
            <p className={styles.message}>{thought.message}</p>
            <div className={styles.actionsContainer}>
                <button className={styles.action} name='vote' aria-label={'vote'} onClick={handleVote}>{thought.votes}</button>
                <button className={styles.action} name='edit' aria-label={'edit'}>E</button>
                <button className={styles.action} name='delete' aria-label={'delete'}>D</button>
                <button className={styles.action} name='mark complete' aria-label={'mark complete'} onClick={handleCompleteClicked}>{thought.completed ? 'C' : 'N'}</button>
            </div>
        </div>
    )
}