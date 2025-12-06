import {fireEvent, render, screen} from '@testing-library/react';
import {RetroColumn} from './RetroColumn.tsx';
import '@testing-library/jest-dom';
import {DateTime} from 'luxon';
import {Thought} from "../../../../services/retro-service/RetroService.ts";

describe('RetroColumn', () => {
  const mockCategory = {
    name: 'Went Well',
    position: 0,
    lightBackgroundColor: '#e6ffed',
    lightTextColor: '#000',
    darkBackgroundColor: '#0e4429',
    darkTextColor: '#fff',
  };
  
  const mockThoughts = [
    {
      id: 'thought-1',
      message: 'Test thought 1',
      votes: 0,
      completed: false,
      category: 'Went Well',
      retroId: 'retro-123',
      createdAt: DateTime.now(),
    },
  ];

  test('renders column with correct title and thoughts', () => {
    render(
      <RetroColumn
        teamId="team-456"
        retroId="retro-123"
        category={mockCategory}
        thoughts={mockThoughts}
      />
    );
    
    expect(screen.getByText('Went Well')).toBeInTheDocument();
    expect(screen.getByText('Test thought 1')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Add a thought...')).toBeInTheDocument();
  });

  test('sorts thoughts with incomplete first', () => {
    const mixedThoughts = [
      { ...mockThoughts[0], id: 'thought-1', completed: true, message: 'Completed Thought' },
      { ...mockThoughts[0], id: 'thought-2', completed: false, message: 'Incomplete Thought' },
    ];

    render(
        <RetroColumn
            teamId="team-456"
            retroId="retro-123"
            category={mockCategory}
            thoughts={mixedThoughts}
        />
    );

    const thoughtElements = screen.getAllByRole('listitem');
    expect(thoughtElements[0]).toHaveTextContent('Incomplete Thought');
    expect(thoughtElements[1]).toHaveTextContent('Completed Thought');
  });

    describe('Sorting by likes', () => {
        const thoughtsWithVotes: Thought[] = [
            { id: 'thought-1', completed: false, message: 'Low votes', votes: 1 } as unknown as Thought,
            { id: 'thought-2', completed: false, message: 'High votes', votes: 5 } as unknown as Thought,
            { id: 'thought-4', completed: true, message: 'Completed low votes', votes: 2 } as unknown as Thought,
            { id: 'thought-5', completed: true, message: 'Completed high votes', votes: 4 } as unknown as Thought,
        ];

        test('does not sort thoughts by votes when sorting is disabled', () => {
            render(<RetroColumn teamId="team-456" retroId="retro-123" category={mockCategory} thoughts={thoughtsWithVotes}/>);
            const thoughtElements = screen.getAllByRole('listitem');

            expect(thoughtElements[0]).toHaveTextContent('Low votes');
            expect(thoughtElements[1]).toHaveTextContent('High votes');
            expect(thoughtElements[2]).toHaveTextContent('Completed low votes');
            expect(thoughtElements[3]).toHaveTextContent('Completed high votes');
        });

        test('sorts thoughts by votes when sorting is enabled', () => {
            render(<RetroColumn teamId="team-456" retroId="retro-123" category={mockCategory} thoughts={thoughtsWithVotes}/>);
            fireEvent.click(screen.getByRole('button', {name: /sort went well by votes/i}));
            const thoughtElements = screen.getAllByRole('listitem');

            expect(thoughtElements[0]).toHaveTextContent('High votes');
            expect(thoughtElements[1]).toHaveTextContent('Low votes');
            expect(thoughtElements[2]).toHaveTextContent('Completed high votes');
            expect(thoughtElements[3]).toHaveTextContent('Completed low votes');
        });

        test('should toggle sort when sort button clicked', () => {
            render(<RetroColumn teamId="team-456" retroId="retro-123" category={mockCategory} thoughts={thoughtsWithVotes}/>);
            fireEvent.click(screen.getByRole('button', {name: /sort went well by votes/i}));
            expect(screen.queryByRole('button', {name: /sort went well by time/i})).not.toBeNull();
            fireEvent.click(screen.getByRole('button', {name: /sort went well by time/i}));
            expect(screen.queryByRole('button', {name: /sort went well by votes/i})).not.toBeNull();
        });
    });
});
