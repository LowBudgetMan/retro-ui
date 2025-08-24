import {Thought} from "../../../../services/retro-service/RetroService.ts";
import styles from './ThoughtCard.module.css';
import {useCallback, useState, KeyboardEvent, useEffect} from "react";
import {ThoughtService} from "../../../../services/thought-service/ThoughtService.ts";
import {onKeys} from "../../../../services/key-event-handler/KeyEventHandler.ts";

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

    const handleDeleteConfirm = useCallback(async () => {
        await ThoughtService.deleteThought(teamId, thought.retroId, thought.id);
    }, [teamId, thought])

    const handleDeleteCancel = useCallback(() => {
        setShowDeleteConfirmation(false);
    }, [])

    const handleDeleteClick = useCallback(() => {
        setEditing(false);
        setShowDeleteConfirmation(true);
    }, [])

    const [editing, setEditing] = useState<boolean>(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);

    const [editValue, setEditValue] = useState(thought.message ?? '');

    function handleKeyPress(event: KeyboardEvent<HTMLTextAreaElement>) {
        if (!event.shiftKey) ThoughtService.setMessage(teamId, thought.retroId, thought.id, editValue).then(() => setEditing(false));
    }

    useEffect(() => {
        setEditValue(thought.message ?? '');
    }, [thought, editing])

    return (
        <div className={styles.card}>
            {showDeleteConfirmation ? (
                <div>
                    <p className={styles.message}>Are you sure you want to delete this thought?</p>
                    <div className={styles.actionsContainer}>
                        <button className={styles.action} onClick={handleDeleteConfirm}>Confirm</button>
                        <button className={styles.action} onClick={handleDeleteCancel}>Cancel</button>
                    </div>
                </div>
            ) : (
                <>
                    {editing ? (
                        <textarea
                            value={editValue}
                            onChange={(event) => {setEditValue(event.target.value);}}
                            onKeyDown={onKeys(['Enter'], handleKeyPress)}
                        >{thought.message}</textarea>
                    ) : (
                        <p className={styles.message}>{thought.message}</p>
                    )}
                    <div className={styles.actionsContainer}>
                        <button className={styles.action} name='vote' aria-label={'vote'} onClick={handleVote}>{thought.votes}</button>
                        <button className={styles.action} name='edit' aria-label={'edit'} onClick={() => setEditing(!editing)}>E</button>
                        <button className={styles.action} name='delete' aria-label={'delete'} onClick={handleDeleteClick}>D</button>
                        <button className={styles.action} name='mark complete' aria-label={'mark complete'} onClick={handleCompleteClicked}>{thought.completed ? 'C' : 'N'}</button>
                    </div>
                </>
            )}
        </div>
    )
}
