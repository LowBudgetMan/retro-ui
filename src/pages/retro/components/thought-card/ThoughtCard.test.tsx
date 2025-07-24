import {render, screen, within, fireEvent} from "@testing-library/react";
import {ThoughtCard} from "./ThoughtCard.tsx";
import {Thought} from "../../../../services/RetroService.ts";
import {ThoughtService} from "../../../../services/thought-service/ThoughtService.ts";

jest.mock("../../../../services/thought-service/ThoughtService.ts");
const mockedThoughtService = ThoughtService as jest.Mocked<typeof ThoughtService>;

const currentTime = new Date();

describe('ThoughtCard', () => {
    const teamId = 'teamId';

    beforeEach(() => {
        jest.clearAllMocks();
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

        const voteButton = within(screen.getByLabelText('vote'));
        expect(voteButton.getByText('10')).toBeInTheDocument();
    });

    it('should display "N" when thought is not completed', () => {
        const incompleteThought: Thought = {
            ...thought,
            completed: false,
        }
        render(<ThoughtCard teamId={teamId} thought={incompleteThought}/>);

        const markCompleteButton = screen.getByLabelText('mark complete');
        expect(markCompleteButton).toHaveTextContent('N');
    });

    it('should display "C" when thought is completed', () => {
        const completeThought: Thought = {
           ...thought,
            completed: true,
        }
        render(<ThoughtCard teamId={teamId} thought={completeThought}/>);

        const markCompleteButton = screen.getByLabelText('mark complete');
        expect(markCompleteButton).toHaveTextContent('C');
    });

    it('should call ThoughtService.setCompleted with inverse of completed when mark complete button is clicked', () => {
        mockedThoughtService.setCompleted = jest.fn().mockResolvedValue(undefined);
        render(<ThoughtCard teamId={teamId} thought={thought}/>);

        const markCompleteButton = screen.getByLabelText('mark complete');
        fireEvent.click(markCompleteButton);

        expect(mockedThoughtService.setCompleted).toHaveBeenCalledWith(
            teamId,
            thought.retroId,
            thought.id,
            !thought.completed
        );
    });
});
