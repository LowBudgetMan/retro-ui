import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RetroComponent, RetroColumn, CreateThought } from './Retro.tsx';
import { useRetro } from './RetroContext.tsx';
import { RetroService } from '../../services/RetroService.ts';
import '@testing-library/jest-dom';

jest.mock('react-router-dom', () => ({
  useLoaderData: jest.fn(),
  Link: ({ to, children, ...props }: any) => (
      <a href={to} {...props}>
        {children}
      </a>
  ),
}));

jest.mock('./RetroPage.module.css', () => ({
  retroColumns: 'mock-retro-columns-class',
}));

jest.mock('./RetroContext.tsx', () => ({
  useRetro: jest.fn(),
}));

jest.mock('../../services/RetroService.ts', () => ({
  RetroService: {
    createThought: jest.fn(),
  },
}));

describe('RetroComponent', () => {
  const mockRetro = {
    id: 'retro-123',
    teamId: 'team-456',
    finished: false,
    dateCreated: new Date(),
    thoughts: [
      {
        id: 'thought-1',
        message: 'Test thought 1',
        votes: 0,
        completed: false,
        category: 'Went Well',
        retroId: 'retro-123',
        createdAt: new Date(),
      },
      {
        id: 'thought-2',
        message: 'Test thought 2',
        votes: 0,
        completed: false,
        category: 'Needs Improvement',
        retroId: 'retro-123',
        createdAt: new Date(),
      },
    ],
    template: {
      id: 'template-1',
      name: 'Basic Retro',
      description: 'A basic retrospective template',
      categories: [
        {
          name: 'Went Well',
          position: 0,
          lightBackgroundColor: '#e6ffed',
          lightTextColor: '#000',
          darkBackgroundColor: '#0e4429',
          darkTextColor: '#fff',
        },
        {
          name: 'Needs Improvement',
          position: 1,
          lightBackgroundColor: '#ffeef0',
          lightTextColor: '#000',
          darkBackgroundColor: '#86181d',
          darkTextColor: '#fff',
        },
      ],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRetro as jest.Mock).mockReturnValue({ retro: mockRetro });
  });

  test('renders retro component with correct categories', () => {
    render(<RetroComponent />);
    
    expect(screen.getByText(/Basic Retro/)).toBeInTheDocument();
    expect(screen.getByText('Went Well')).toBeInTheDocument();
    expect(screen.getByText('Needs Improvement')).toBeInTheDocument();
    expect(screen.getByText('Test thought 1')).toBeInTheDocument();
    expect(screen.getByText('Test thought 2')).toBeInTheDocument();
  });
});

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
});

describe('CreateThought', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (RetroService.createThought as jest.Mock).mockResolvedValue({});
  });

  test('creates a thought when input loses focus with content', async () => {
    render(
      <CreateThought
        teamId="team-456"
        retroId="retro-123"
        category="Went Well"
      />
    );
    
    const input = screen.getByPlaceholderText('Add a thought...');
    fireEvent.change(input, { target: { value: 'New thought' } });
    fireEvent.blur(input);
    await waitFor(() => {
      expect(RetroService.createThought).toHaveBeenCalledWith(
        'team-456',
        'retro-123',
        'New thought',
        'Went Well'
      );
    });
    
    expect(input).toHaveValue('');
  });

  test('creates a thought when Enter key is pressed', async () => {
    render(
      <CreateThought
        teamId="team-456"
        retroId="retro-123"
        category="Went Well"
      />
    );
    
    const input = screen.getByPlaceholderText('Add a thought...');
    fireEvent.change(input, { target: { value: 'New thought' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    await waitFor(() => {
      expect(RetroService.createThought).toHaveBeenCalledWith(
        'team-456',
        'retro-123',
        'New thought',
        'Went Well'
      );
    });
    
    expect(input).toHaveValue('');
  });

  test('does not create a thought when input is empty', async () => {
    render(
      <CreateThought
        teamId="team-456"
        retroId="retro-123"
        category="Went Well"
      />
    );
    
    const input = screen.getByPlaceholderText('Add a thought...');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);

    expect(RetroService.createThought).not.toHaveBeenCalled();
  });

  test('handles error when creating thought fails', async () => {
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    (RetroService.createThought as jest.Mock).mockRejectedValue(new Error('API error'));
    
    render(
      <CreateThought
        teamId="team-456"
        retroId="retro-123"
        category="Went Well"
      />
    );
    
    const input = screen.getByPlaceholderText('Add a thought...');
    
    fireEvent.change(input, { target: { value: 'New thought' } });
    fireEvent.blur(input);
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
    
    console.error = originalConsoleError;
  });
}); 