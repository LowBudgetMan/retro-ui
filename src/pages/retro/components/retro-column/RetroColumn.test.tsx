import { render, screen } from '@testing-library/react';
import { RetroColumn } from './RetroColumn.tsx';
import '@testing-library/jest-dom';

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
      createdAt: new Date(),
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
});
