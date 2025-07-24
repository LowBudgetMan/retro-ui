import {fireEvent, render, screen, within} from "@testing-library/react";
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

        expect(within(screen.getByLabelText('vote')).getByText('10')).toBeInTheDocument();
    });

    it('should call the ThoughtService when vote is pressed', () => {
        render(<ThoughtCard teamId={teamId} thought={thought} />);

        fireEvent.click(screen.getByLabelText('vote'));
        expect(mockedThoughtService.vote).toHaveBeenCalledWith(
            teamId,
            thought.retroId,
            thought.id
        );
    });

    it('should display "N" when thought is not completed', () => {
        const incompleteThought: Thought = {
            ...thought,
            completed: false,
        }
        render(<ThoughtCard teamId={teamId} thought={incompleteThought}/>);

        expect(screen.getByLabelText('mark complete')).toHaveTextContent('N');
    });

    it('should display "C" when thought is completed', () => {
        const completeThought: Thought = {
           ...thought,
            completed: true,
        }
        render(<ThoughtCard teamId={teamId} thought={completeThought}/>);

        expect(screen.getByLabelText('mark complete')).toHaveTextContent('C');
    });

    it('should call ThoughtService.setCompleted with inverse of completed when mark complete button is clicked', () => {
        mockedThoughtService.setCompleted = jest.fn().mockResolvedValue(undefined);
        render(<ThoughtCard teamId={teamId} thought={thought}/>);

        fireEvent.click(screen.getByLabelText('mark complete'));

        expect(mockedThoughtService.setCompleted).toHaveBeenCalledWith(
            teamId,
            thought.retroId,
            thought.id,
            !thought.completed
        );
    });
});
