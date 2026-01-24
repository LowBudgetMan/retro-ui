import {render, screen} from '@testing-library/react';
import {RetroComponent} from './Retro.tsx';
import '@testing-library/jest-dom';
import {RetroColumn} from "./components/retro-column/RetroColumn.tsx";
import { DateTime } from "luxon";
import {PropsWithChildren} from "react";
import {useActionItems, useRetro} from "../../context/hooks.tsx";
import {Mock} from "vitest";

vi.mock('react-router-dom', () => ({
  useLoaderData: vi.fn(),
  useNavigate: vi.fn(),
  Link: ({ to, children, ...props }: PropsWithChildren<{to: string}>) => (
      <a href={to} {...props}>
        {children}
      </a>
  ),
}));

vi.mock('./RetroPage.module.css', () => ({
  default: {
    retroColumns: 'mock-retro-columns-class',
  },
  retroColumns: 'mock-retro-columns-class',
}));

vi.mock('../../context/hooks.tsx', () => ({
  useRetro: vi.fn(),
  useActionItems: vi.fn(),
}));

vi.mock('./components/retro-column/RetroColumn.tsx', () => ({
    RetroColumn: vi.fn(() => null),
}));

// vi.mock('react-router-dom', async (importOriginal) => ({
//     ...(await importOriginal()),
//     useLoaderData: vi.fn(),
//     useNavigate: vi.fn(),
// }));

describe('RetroComponent', () => {
  const mockRetro = {
    id: 'retro-123',
    teamId: 'team-456',
    finished: false,
    createdAt: DateTime.now(),
    thoughts: [
      {
        id: 'thought-1',
        message: 'Test thought 1',
        votes: 0,
        completed: false,
        category: 'Went Well',
        retroId: 'retro-123',
        createdAt: DateTime.now(),
      },
      {
        id: 'thought-2',
        message: 'Test thought 2',
        votes: 0,
        completed: false,
        category: 'Needs Improvement',
        retroId: 'retro-123',
        createdAt: DateTime.now(),
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
    vi.clearAllMocks();
    (useRetro as Mock).mockReturnValue({ retro: mockRetro });
    (useActionItems as Mock).mockReturnValue({ actionItems: [] });
  });

  it('renders retro component with correct categories', () => {
    render(<RetroComponent />);

    expect(screen.getByText(/Basic Retro/)).toBeInTheDocument();
    expect(RetroColumn).toHaveBeenCalledWith(expect.objectContaining({ category: mockRetro.template.categories[0] }), {});
    expect(RetroColumn).toHaveBeenCalledWith(expect.objectContaining({ category: mockRetro.template.categories[1] }), {});
  });

  it('sorts thoughts by createdAt before passing to RetroColumn', () => {
    const thought1 = {
      id: 'thought-1',
      message: 'Test thought 1',
      votes: 0,
      completed: false,
      category: 'Went Well',
      retroId: 'retro-123',
      createdAt: DateTime.fromISO('2025-01-02'),
    };
    const thought2 = {
      id: 'thought-2',
      message: 'Test thought 2',
      votes: 0,
      completed: false,
      category: 'Went Well',
      retroId: 'retro-123',
      createdAt: DateTime.fromISO('2025-01-01'),
    };
    (useRetro as Mock).mockReturnValue({
      retro: {
        ...mockRetro,
        thoughts: [thought1, thought2],
      },
    });

    render(<RetroComponent />);

    expect(RetroColumn).toHaveBeenCalledWith(
        expect.objectContaining({
          thoughts: [thought2, thought1],
        }),
        {}
    );
  });

    it('should display the end retro button', () => {
        render(<RetroComponent />);
        expect(screen.getByText('End Retro')).toBeInTheDocument();
    });
});
