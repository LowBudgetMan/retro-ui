import { render, screen } from '@testing-library/react';
import { UserPage } from './UserPage';
import { useLoaderData } from 'react-router-dom';
import { TeamCard } from '../../components/team-card/TeamCard.tsx';
import '@testing-library/jest-dom';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useLoaderData: vi.fn(),
}));

// Mock the CreateTeamButton component
vi.mock('./components/CreateTeamButton', () => ({
  CreateTeamButton: () => (
    <div data-testid="mock-create-team-button">
      <button data-testid="create-button">+</button>
    </div>
  ),
}));

// Mock the team-card component
vi.mock('../../components/team-card/TeamCard.tsx', () => ({
  TeamCard: vi.fn(({ team }: { team: { id: string; name: string; createdAt: Date } }) => (
    <div data-testid={`team-card-${team.id}`}>
      {team.name}
    </div>
  )),
}));

// Mock the CSS module
vi.mock('./UserPage.module.css', () => ({
  default: {
    userPage: 'mock-user-page-class',
    teamsTitle: 'mock-teams-title-class',
    teamsList: 'mock-teams-list-class',
    teamItem: 'mock-team-item-class',
    createNewTeamButton: 'mock-create-new-team-button-class',
  },
}));

describe('UserPage', () => {
  // Mock user data
  const mockUser = {
    name: 'Test User',
    teams: [
      { id: 'team-1', name: 'Team 1', createdAt: new Date('2023-01-01') },
      { id: 'team-2', name: 'Team 2', createdAt: new Date('2023-02-01') },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useLoaderData as ReturnType<typeof vi.fn>).mockReturnValue(mockUser);
  });

  describe('Rendering', () => {
    it('should render the create team button', () => {
      render(<UserPage />);
      
      expect(screen.getByText('+')).toBeInTheDocument();
    });

    it('should render team cards for each team', () => {
      render(<UserPage />);
      
      expect(screen.getByTestId('team-card-team-1')).toBeInTheDocument();
      expect(screen.getByTestId('team-card-team-2')).toBeInTheDocument();
      expect(screen.getByText('Team 1')).toBeInTheDocument();
      expect(screen.getByText('Team 2')).toBeInTheDocument();
    });

    it('should render the correct number of team items', () => {
      render(<UserPage />);
      
      // One for the create button + one for each team
      const teamItems = screen.getAllByRole('listitem');
      expect(teamItems).toHaveLength(3);
    });

    it('should handle empty teams array', () => {
      (useLoaderData as ReturnType<typeof vi.fn>).mockReturnValue({
        name: 'Test User',
        teams: [],
      });
      
      render(<UserPage />);
      
      // Only the create button should be present
      const teamItems = screen.getAllByRole('listitem');
      expect(teamItems).toHaveLength(1);
      expect(screen.queryByTestId(/team-card-/)).not.toBeInTheDocument();
    });
  });

  describe('CreateTeamButton', () => {
    it('should render the create team button', () => {
      render(<UserPage />);
      
      expect(screen.getByTestId('mock-create-team-button')).toBeInTheDocument();
    });
  });

  describe('Integration with components', () => {

    it('should pass correct props to team-card components', () => {
      render(<UserPage />);
      
      expect(TeamCard).toHaveBeenCalledTimes(2);
      expect(TeamCard).toHaveBeenCalledWith(
        { team: mockUser.teams[0] },
        expect.anything()
      );
      expect(TeamCard).toHaveBeenCalledWith(
        { team: mockUser.teams[1] },
        expect.anything()
      );
    });
  });
});
