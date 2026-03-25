import {Thought} from "../../../../services/retro-service/RetroService.ts";
import styles from './ThoughtCard.module.css';
import {useCallback, useRef, useState, KeyboardEvent, useEffect} from "react";
import {ThoughtService} from "../../../../services/thought-service/ThoughtService.ts";
import {RetroEventService} from "../../../../services/retro-event-service/RetroEventService.ts";
import {onKeys} from "../../../../services/key-event-handler/KeyEventHandler.ts";
import { FaEdit, FaRegTrashAlt } from "react-icons/fa";
import { ImCheckboxChecked, ImCheckboxUnchecked } from "react-icons/im";
import {VoteCount} from "./vote-count/VoteCount.tsx";

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

    const handleFocusClick = useCallback(async () => {
        if (thought.completed) return;
        await RetroEventService.focus(teamId, thought.retroId, thought.id);
    }, [teamId, thought]);

    const [editing, setEditing] = useState<boolean>(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);
    const editRef = useRef<HTMLTextAreaElement>(null);

    const [editValue, setEditValue] = useState(thought.message ?? '');

    function handleKeyPress(event: KeyboardEvent<HTMLTextAreaElement>) {
        if (!event.shiftKey) ThoughtService.setMessage(teamId, thought.retroId, thought.id, editValue).then(() => setEditing(false));
    }

    useEffect(() => {
        setEditValue(thought.message ?? '');
    }, [thought, editing])

    useEffect(() => {
        if (editing && editRef.current) {
            const el = editRef.current;
            el.focus();
            el.setSelectionRange(el.value.length, el.value.length);
        }
    }, [editing]);

    return (
        <div className={`${styles.card} ${thought.completed ? styles.completed : ''}`}>
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
                            ref={editRef}
                            value={editValue}
                            className={styles.editThoughtInput}
                            onChange={(event) => {setEditValue(event.target.value);}}
                            onKeyDown={onKeys(['Enter'], handleKeyPress)}
                        />
                    ) : (
                        <p className={styles.message} onClick={handleFocusClick}>{thought.message}</p>
                    )}
                    <div className={styles.actionsContainer}>
                        <button className={styles.action} name='vote' aria-label={'vote'} onClick={handleVote} disabled={thought.completed}>
                            <VoteCount votes={thought.votes} />
                        </button>
                        <button className={styles.action} name='edit' aria-label={'edit'} onClick={() => setEditing(!editing)} disabled={thought.completed}>
                            <FaEdit title={'Edit'} fontSize={'1rem'}/>
                        </button>
                        <button className={styles.action} name='delete' aria-label={'delete'} onClick={handleDeleteClick} disabled={thought.completed}>
                            <FaRegTrashAlt title={'Delete'} fontSize={'1rem'}/>
                        </button>
                        <button className={styles.action} name='mark complete' aria-label={'mark complete'} style={{cursor: 'pointer'}} onClick={handleCompleteClicked}>
                            {thought.completed ? <ImCheckboxChecked title={'Completed'} fontSize={'1rem'}/> : <ImCheckboxUnchecked title={'Incomplete'} fontSize={'1rem'}/>}
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
