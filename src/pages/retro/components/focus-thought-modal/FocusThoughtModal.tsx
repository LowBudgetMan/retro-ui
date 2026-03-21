import { useCallback, useEffect, useState } from "react";
import { Thought } from "../../../../services/retro-service/RetroService";
import { WebsocketService } from "../../../../services/websocket/WebsocketService";
import { retroDestination } from "../../../../services/websocket/destinations";
import { RetroEventTypes } from "../../../../services/websocket/EventTypes";
import { RetroEventService } from "../../../../services/retro-event-service/RetroEventService";
import { ThoughtService } from "../../../../services/thought-service/ThoughtService";
import { Modal } from "../../../../components/modal/Modal";
import { VoteCount } from "../thought-card/vote-count/VoteCount";
import { ImCheckboxUnchecked } from "react-icons/im";
import styles from "./FocusThoughtModal.module.css";

interface Props {
    teamId: string;
    retroId: string;
    thoughts: Thought[];
}

export function FocusThoughtModal({ teamId, retroId, thoughts }: Props) {
    const [focusedThoughtId, setFocusedThoughtId] = useState<string | null>(null);

    const handleFocus = useCallback((payload: { thoughtId: string }) => {
        setFocusedThoughtId(payload.thoughtId);
    }, []);

    const handleFocusClear = useCallback(() => {
        setFocusedThoughtId(null);
    }, []);

    useEffect(() => {
        const unsubscribe = WebsocketService.subscribe(
            retroDestination(retroId, 'events'),
            {
                [RetroEventTypes.FOCUS]: handleFocus,
                [RetroEventTypes.FOCUS_CLEAR]: handleFocusClear,
            },
            retroId
        );
        return unsubscribe;
    }, [retroId, handleFocus, handleFocusClear]);

    const focusedThought = focusedThoughtId
        ? thoughts.find(t => t.id === focusedThoughtId)
        : null;

    const isOpen = focusedThought !== null && focusedThought !== undefined && !focusedThought.completed;

    useEffect(() => {
        if (focusedThoughtId && !isOpen) {
            setFocusedThoughtId(null);
        }
    }, [focusedThoughtId, isOpen]);

    const handleClose = useCallback(() => {
        setFocusedThoughtId(null);
        RetroEventService.clearFocus(teamId, retroId);
    }, [teamId, retroId]);

    const handleComplete = useCallback(async () => {
        if (!focusedThoughtId) return;
        await ThoughtService.setCompleted(teamId, retroId, focusedThoughtId, true);
        await RetroEventService.clearFocus(teamId, retroId);
    }, [teamId, retroId, focusedThoughtId]);

    return (
        <Modal isOpen={isOpen} setIsOpen={handleClose} backgroundButtonAriaLabel="Close focused thought">
            {focusedThought && (
                <div className={styles.container}>
                    <button className={styles.closeButton} onClick={handleClose} aria-label="Close modal">&times;</button>
                    <p className={styles.message}>{focusedThought.message}</p>
                    <div className={styles.footer}>
                        <VoteCount votes={focusedThought.votes} />
                        <button className={styles.completeButton} onClick={handleComplete} aria-label="mark complete">
                            <ImCheckboxUnchecked title={'Complete'} fontSize={'1rem'} />
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
}
