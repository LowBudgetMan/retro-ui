import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FocusThoughtModal } from "./FocusThoughtModal";
import { WebsocketService } from "../../../../services/websocket/WebsocketService";
import { RetroEventService } from "../../../../services/retro-event-service/RetroEventService";
import { ThoughtService } from "../../../../services/thought-service/ThoughtService";
import { Thought } from "../../../../services/retro-service/RetroService";
import { DateTime } from "luxon";
import { RetroEventTypes } from "../../../../services/websocket/EventTypes";

vi.mock("../../../../services/websocket/WebsocketService");
vi.mock("../../../../services/retro-event-service/RetroEventService");
vi.mock("../../../../services/thought-service/ThoughtService");

const currentTime = DateTime.now();

describe('FocusThoughtModal', () => {
    const teamId = 'teamId';
    const retroId = 'retroId';

    const thoughts: Thought[] = [
        {
            id: 'thought1',
            message: 'First thought',
            votes: 3,
            completed: false,
            category: 'category1',
            retroId: retroId,
            createdAt: currentTime,
        },
        {
            id: 'thought2',
            message: 'Second thought',
            votes: 5,
            completed: true,
            category: 'category1',
            retroId: retroId,
            createdAt: currentTime,
        },
    ];

    let capturedHandlers: Record<string, (payload?: unknown) => void> = {};

    beforeEach(() => {
        vi.clearAllMocks();
        capturedHandlers = {};
        vi.mocked(WebsocketService.subscribe).mockImplementation((_dest, handlerMap) => {
            Object.entries(handlerMap).forEach(([key, handler]) => {
                if (typeof handler === 'function') {
                    capturedHandlers[key] = handler;
                }
            });
            return vi.fn();
        });
        vi.mocked(ThoughtService.setCompleted).mockResolvedValue(undefined as never);
        vi.mocked(RetroEventService.clearFocus).mockResolvedValue(undefined as never);
    });

    it('should not display modal when no thought is focused', () => {
        render(<FocusThoughtModal teamId={teamId} retroId={retroId} thoughts={thoughts} />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should display modal with thought content when FOCUS event is received', () => {
        render(<FocusThoughtModal teamId={teamId} retroId={retroId} thoughts={thoughts} />);

        act(() => {
            capturedHandlers[RetroEventTypes.FOCUS]('thought1');
        });

        expect(screen.getByText('First thought')).toBeInTheDocument();
    });

    it('should display vote count when thought is focused', () => {
        render(<FocusThoughtModal teamId={teamId} retroId={retroId} thoughts={thoughts} />);

        act(() => {
            capturedHandlers[RetroEventTypes.FOCUS]('thought1');
        });

        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should close modal when FOCUS_CLEAR event is received', () => {
        render(<FocusThoughtModal teamId={teamId} retroId={retroId} thoughts={thoughts} />);

        act(() => {
            capturedHandlers[RetroEventTypes.FOCUS]('thought1');
        });
        expect(screen.getByText('First thought')).toBeInTheDocument();

        act(() => {
            capturedHandlers[RetroEventTypes.FOCUS_CLEAR]();
        });
        expect(screen.queryByText('First thought')).not.toBeInTheDocument();
    });

    it('should call clearFocus when x button is clicked', () => {
        render(<FocusThoughtModal teamId={teamId} retroId={retroId} thoughts={thoughts} />);

        act(() => {
            capturedHandlers[RetroEventTypes.FOCUS]('thought1');
        });

        fireEvent.click(screen.getByLabelText('Close modal'));
        expect(RetroEventService.clearFocus).toHaveBeenCalledWith(teamId, retroId);
    });

    it('should call clearFocus when background is clicked', () => {
        render(<FocusThoughtModal teamId={teamId} retroId={retroId} thoughts={thoughts} />);

        act(() => {
            capturedHandlers[RetroEventTypes.FOCUS]('thought1');
        });

        fireEvent.click(screen.getByLabelText('Close focused thought'));
        expect(RetroEventService.clearFocus).toHaveBeenCalledWith(teamId, retroId);
    });

    it('should call clearFocus when Escape key is pressed', () => {
        render(<FocusThoughtModal teamId={teamId} retroId={retroId} thoughts={thoughts} />);

        act(() => {
            capturedHandlers[RetroEventTypes.FOCUS]('thought1');
        });

        fireEvent.keyDown(document, { key: 'Escape' });
        expect(RetroEventService.clearFocus).toHaveBeenCalledWith(teamId, retroId);
    });

    it('should mark thought as complete and clear focus when complete button is clicked', async () => {
        render(<FocusThoughtModal teamId={teamId} retroId={retroId} thoughts={thoughts} />);

        act(() => {
            capturedHandlers[RetroEventTypes.FOCUS]('thought1');
        });

        await act(async () => {
            fireEvent.click(screen.getByLabelText('mark complete'));
        });

        expect(ThoughtService.setCompleted).toHaveBeenCalledWith(teamId, retroId, 'thought1', true);
        expect(RetroEventService.clearFocus).toHaveBeenCalledWith(teamId, retroId);
    });

    it('should close modal when focused thought is not found in thoughts list', () => {
        render(<FocusThoughtModal teamId={teamId} retroId={retroId} thoughts={thoughts} />);

        act(() => {
            capturedHandlers[RetroEventTypes.FOCUS]('nonexistent');
        });

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should close modal when focused thought becomes completed', () => {
        const { rerender } = render(<FocusThoughtModal teamId={teamId} retroId={retroId} thoughts={thoughts} />);

        act(() => {
            capturedHandlers[RetroEventTypes.FOCUS]('thought1');
        });
        expect(screen.getByText('First thought')).toBeInTheDocument();

        const updatedThoughts = thoughts.map(t =>
            t.id === 'thought1' ? { ...t, completed: true } : t
        );
        rerender(<FocusThoughtModal teamId={teamId} retroId={retroId} thoughts={updatedThoughts} />);

        expect(screen.queryByText('First thought')).not.toBeInTheDocument();
    });

    it('should switch to new thought when a second FOCUS event is received', () => {
        const allIncompleteThoughts: Thought[] = [
            ...thoughts.map(t => ({ ...t, completed: false })),
            {
                id: 'thought3',
                message: 'Third thought',
                votes: 7,
                completed: false,
                category: 'category1',
                retroId: retroId,
                createdAt: currentTime,
            },
        ];

        render(<FocusThoughtModal teamId={teamId} retroId={retroId} thoughts={allIncompleteThoughts} />);

        act(() => {
            capturedHandlers[RetroEventTypes.FOCUS]('thought1');
        });
        expect(screen.getByText('First thought')).toBeInTheDocument();

        act(() => {
            capturedHandlers[RetroEventTypes.FOCUS]('thought3');
        });
        expect(screen.queryByText('First thought')).not.toBeInTheDocument();
        expect(screen.getByText('Third thought')).toBeInTheDocument();
        expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('should unsubscribe from websocket on unmount', () => {
        const unsubscribe = vi.fn();
        vi.mocked(WebsocketService.subscribe).mockReturnValue(unsubscribe);

        const { unmount } = render(<FocusThoughtModal teamId={teamId} retroId={retroId} thoughts={thoughts} />);
        unmount();

        expect(unsubscribe).toHaveBeenCalled();
    });
});
