import {fireEvent, render, screen, within, act} from "@testing-library/react";
import {ThoughtCard} from "./ThoughtCard.tsx";
import {Thought} from "../../../../services/retro-service/RetroService.ts";
import {ThoughtService} from "../../../../services/thought-service/ThoughtService.ts";
import {DateTime} from "luxon";
import { vi, describe, it, beforeEach, expect } from 'vitest';

vi.mock("../../../../services/thought-service/ThoughtService.ts");

const currentTime = DateTime.now();

describe('ThoughtCard', () => {
    const teamId = 'teamId';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const thought: Thought = {
        id: 'thoughtId',
        message: 'This is a test thought',
        votes: 0,
        completed: false,
        category: 'category1',
        retroId: 'retroId',
        createdAt: currentTime
    }

    it('should display the message of the thought', () => {
        render(<ThoughtCard teamId={teamId} thought={thought}/>);
        expect(screen.getByText('This is a test thought')).toBeInTheDocument();
    });

    it('should display number of votes on a thought', () => {
        const thoughtWithVotes: Thought = {
            ...thought,
            votes: 10,
        }
        render(<ThoughtCard teamId={teamId} thought={thoughtWithVotes}/>);

        expect(within(screen.getByLabelText('vote')).getByText('10')).toBeInTheDocument();
    });

    it('should call the ThoughtService when vote is pressed', () => {
        render(<ThoughtCard teamId={teamId} thought={thought} />);

        fireEvent.click(screen.getByLabelText('vote'));
        expect(ThoughtService.vote).toHaveBeenCalledWith(
            teamId,
            thought.retroId,
            thought.id
        );
    });

    it('should display "Incomplete" when thought is not completed', () => {
        const incompleteThought: Thought = {
            ...thought,
            completed: false,
        }
        render(<ThoughtCard teamId={teamId} thought={incompleteThought}/>);

        expect(screen.getByLabelText('mark complete')).toHaveTextContent('Incomplete');
    });

    it('should display "Complete" when thought is completed', () => {
        const completeThought: Thought = {
           ...thought,
            completed: true,
        }
        render(<ThoughtCard teamId={teamId} thought={completeThought}/>);

        expect(screen.getByLabelText('mark complete')).toHaveTextContent('Complete');
    });

    it('should call ThoughtService.setCompleted with inverse of completed when mark complete button is clicked', () => {
        ThoughtService.setCompleted = vi.fn().mockResolvedValue(undefined);
        render(<ThoughtCard teamId={teamId} thought={thought}/>);

        fireEvent.click(screen.getByLabelText('mark complete'));

        expect(ThoughtService.setCompleted).toHaveBeenCalledWith(
            teamId,
            thought.retroId,
            thought.id,
            !thought.completed
        );
    });

    describe('Edit functionality', () => {
        beforeEach(() => {
            ThoughtService.setMessage = vi.fn().mockResolvedValue(undefined);
        });

        it('should display paragraph element when not in edit mode', () => {
            render(<ThoughtCard teamId={teamId} thought={thought}/>);
            
            const messageElement = screen.getByText('This is a test thought');
            expect(messageElement.tagName).toBe('P');
            expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        });

        it('should switch from paragraph to textarea when edit button is clicked', () => {
            render(<ThoughtCard teamId={teamId} thought={thought}/>);

            fireEvent.click(screen.getByLabelText('edit'));

            const messageElement = screen.getByText('This is a test thought');
            expect(messageElement.tagName).toBe('TEXTAREA');
            expect(screen.queryByText('This is a test thought', { selector: 'p' })).not.toBeInTheDocument();
        });

        it('should update textarea value when user types', () => {
            render(<ThoughtCard teamId={teamId} thought={thought}/>);
            
            fireEvent.click(screen.getByLabelText('edit'));
            
            const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
            fireEvent.change(textarea, { target: { value: 'Updated thought message' } });
            
            expect(textarea.value).toBe('Updated thought message');
        });

        it('should call ThoughtService.setMessage and exit edit mode when Enter is pressed without Shift', async () => {
            render(<ThoughtCard teamId={teamId} thought={thought}/>);
            
            fireEvent.click(screen.getByLabelText('edit'));
            
            const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
            fireEvent.change(textarea, { target: { value: 'Updated message' } });

            await act(async () => {
                fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
                await Promise.resolve();
            });
            
            expect(ThoughtService.setMessage).toHaveBeenCalledWith(
                teamId,
                thought.retroId,
                thought.id,
                'Updated message'
            );
        });

        it('should NOT call ThoughtService.setMessage when Enter is pressed WITH Shift', () => {
            render(<ThoughtCard teamId={teamId} thought={thought}/>);
            
            fireEvent.click(screen.getByLabelText('edit'));
            
            const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
            fireEvent.change(textarea, { target: { value: 'Updated message' } });
            fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });
            
            expect(ThoughtService.setMessage).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox')).toBeInTheDocument();
        });

        it('should exit edit mode and revert to original message when edit button is clicked again without submitting', () => {
            render(<ThoughtCard teamId={teamId} thought={thought}/>);

            fireEvent.click(screen.getByLabelText('edit'));
            
            const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
            fireEvent.change(textarea, { target: { value: 'Changed but not submitted' } });
            fireEvent.click(screen.getByLabelText('edit'));

            expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
            expect(screen.getByText('This is a test thought')).toBeInTheDocument();
            expect(screen.getByText('This is a test thought').tagName).toBe('P');
            expect(ThoughtService.setMessage).not.toHaveBeenCalled();
        });

        it('should reset textarea value to original message when re-entering edit mode after canceling', () => {
            render(<ThoughtCard teamId={teamId} thought={thought}/>);

            fireEvent.click(screen.getByLabelText('edit'));
            
            let textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
            fireEvent.change(textarea, { target: { value: 'Changed but not submitted' } });
            fireEvent.click(screen.getByLabelText('edit')); // Exit edit mode without submitting
            fireEvent.click(screen.getByLabelText('edit')); // Re-enter edit mode
            
            textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
            expect(textarea.value).toBe('This is a test thought');
        });

        it('should update the displayed message after successful submission', async () => {
            const updatedThought: Thought = {
                ...thought,
                message: 'Updated message from server'
            };
            
            const { rerender } = render(<ThoughtCard teamId={teamId} thought={thought}/>);
            
            fireEvent.click(screen.getByLabelText('edit'));
            const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
            fireEvent.change(textarea, { target: { value: 'Updated message from server' } });
            
            await act(async () => {
                fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
                await Promise.resolve();
            });
            
            // Simulate the component receiving updated thought from parent
            rerender(<ThoughtCard teamId={teamId} thought={updatedThought}/>);
            
            expect(screen.getByText('Updated message from server')).toBeInTheDocument();
        });
    });

    describe('Delete thought', () => {
        beforeEach(() => {
            ThoughtService.deleteThought = vi.fn().mockResolvedValue(undefined);
        });

        it('should show confirmation UI when delete button is clicked', () => {
            render(<ThoughtCard teamId={teamId} thought={thought}/>);

            fireEvent.click(screen.getByLabelText('delete'));

            expect(screen.getByText('Are you sure you want to delete this thought?')).toBeInTheDocument();
            expect(screen.getByText('Confirm')).toBeInTheDocument();
            expect(screen.getByText('Cancel')).toBeInTheDocument();
            
            // Verify original message and action buttons are hidden
            expect(screen.queryByText('This is a test thought')).not.toBeInTheDocument();
            expect(screen.queryByLabelText('vote')).not.toBeInTheDocument();
            expect(screen.queryByLabelText('edit')).not.toBeInTheDocument();
            expect(screen.queryByLabelText('mark complete')).not.toBeInTheDocument();
        });

        it('should return to normal view when cancel is clicked', () => {
            render(<ThoughtCard teamId={teamId} thought={thought}/>);

            fireEvent.click(screen.getByLabelText('delete'));
            fireEvent.click(screen.getByText('Cancel'));

            // Verify normal view is restored
            expect(screen.getByText('This is a test thought')).toBeInTheDocument();
            expect(screen.getByLabelText('vote')).toBeInTheDocument();
            expect(screen.getByLabelText('edit')).toBeInTheDocument();
            expect(screen.getByLabelText('delete')).toBeInTheDocument();
            expect(screen.getByLabelText('mark complete')).toBeInTheDocument();
            
            // Verify confirmation UI is gone
            expect(screen.queryByText('Are you sure you want to delete this thought?')).not.toBeInTheDocument();
            expect(screen.queryByText('Confirm')).not.toBeInTheDocument();
            expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
        });

        it('should call ThoughtService.deleteThought when confirm is clicked', () => {
            render(<ThoughtCard teamId={teamId} thought={thought}/>);

            fireEvent.click(screen.getByLabelText('delete'));
            fireEvent.click(screen.getByText('Confirm'));

            expect(ThoughtService.deleteThought).toHaveBeenCalledWith(
                teamId,
                thought.retroId,
                thought.id
            );
        });

        it('should exit edit mode when delete is clicked and return to normal view when canceled', () => {
            render(<ThoughtCard teamId={teamId} thought={thought}/>);

            // Enter edit mode
            fireEvent.click(screen.getByLabelText('edit'));
            expect(screen.getByRole('textbox')).toBeInTheDocument();

            // Click delete - should show confirmation and exit edit mode
            fireEvent.click(screen.getByLabelText('delete'));
            expect(screen.getByText('Are you sure you want to delete this thought?')).toBeInTheDocument();
            expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

            // Click cancel - should return to normal view (not edit mode)
            fireEvent.click(screen.getByText('Cancel'));
            expect(screen.getByText('This is a test thought')).toBeInTheDocument();
            expect(screen.getByText('This is a test thought').tagName).toBe('P');
            expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        });
    });
});
