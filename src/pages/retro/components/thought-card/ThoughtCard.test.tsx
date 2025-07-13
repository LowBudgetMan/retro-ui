import {render, screen, within} from "@testing-library/react";
import {ThoughtCard} from "./ThoughtCard.tsx";
import {Thought} from "../../../../services/RetroService.ts";

const currentTime = new Date();

describe('ThoughtCard', () => {
    it('should display the message of the thought', () => {
        const thought: Thought = {
            id: 'thoughtId',
            message: 'This is a test thought',
            votes: 0,
            completed: false,
            category: 'category1',
            retroId: 'retroId',
            createdAt: currentTime
        }
        render(<ThoughtCard thought={thought}/>);

        expect(screen.getByText('This is a test thought')).toBeInTheDocument();
    });

    it('should display number of votes on a thought', () => {
        const thought: Thought = {
            id: 'thoughtId',
            message: 'This is a test thought',
            votes: 10,
            completed: false,
            category: 'category1',
            retroId: 'retroId',
            createdAt: currentTime
        }
        render(<ThoughtCard thought={thought}/>);

        const voteButton = within(screen.getByLabelText('vote'));
        expect(voteButton.getByText('10')).toBeInTheDocument();
    });
});