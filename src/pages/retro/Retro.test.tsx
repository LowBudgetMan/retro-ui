import {render, screen} from '@testing-library/react';
import {RetroComponent} from './Retro.tsx';
import {useRetro} from './RetroContext.tsx';
import '@testing-library/jest-dom';
import {RetroColumn} from "./components/retro-column/RetroColumn.tsx";

import {PropsWithChildren} from "react";

jest.mock('react-router-dom', () => ({
  useLoaderData: jest.fn(),
  Link: ({ to, children, ...props }: PropsWithChildren<{to: string}>) => (
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

jest.mock('./components/retro-column/RetroColumn.tsx', () => ({
    RetroColumn: jest.fn(() => null),
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
      createdAt: new Date('2025-01-02'),
    };
    const thought2 = {
      id: 'thought-2',
      message: 'Test thought 2',
      votes: 0,
      completed: false,
      category: 'Went Well',
      retroId: 'retro-123',
      createdAt: new Date('2025-01-01'),
    };
    (useRetro as jest.Mock).mockReturnValue({
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
});
