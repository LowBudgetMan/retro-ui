import { render, screen, fireEvent } from '@testing-library/react';
import { UserPage } from './UserPage';
import { useLoaderData } from 'react-router-dom';
import { CreateTeamModal } from './components/CreateTeamModal';
import { TeamCard } from '../../components/TeamCard';
import '@testing-library/jest-dom';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useLoaderData: jest.fn(),
}));

// Mock the CreateTeamModal component
jest.mock('./components/CreateTeamModal', () => ({
  CreateTeamModal: jest.fn(({ isOpen, setIsOpen }) => (
    isOpen ? (
      <div data-testid="mock-create-team-modal">
        <button onClick={() => setIsOpen(false)}>Close Modal</button>
      </div>
    ) : null
  )),
}));

// Mock the TeamCard component
jest.mock('../../components/TeamCard', () => ({
  TeamCard: jest.fn(({ team }) => (
    <div data-testid={`team-card-${team.id}`}>
      {team.name}
    </div>
  )),
}));

// Mock the CSS module
jest.mock('./UserPage.module.css', () => ({
  userPage: 'mock-user-page-class',
  teamsTitle: 'mock-teams-title-class',
  teamsList: 'mock-teams-list-class',
  teamItem: 'mock-team-item-class',
  createNewTeamButton: 'mock-create-new-team-button-class',
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
    jest.clearAllMocks();
    (useLoaderData as jest.Mock).mockReturnValue(mockUser);
  });

  describe('Rendering', () => {
    it('should render the user page with correct user name', () => {
      render(<UserPage />);
      
      expect(screen.getByText('Welcome, Test User')).toBeInTheDocument();
      expect(screen.getByText('Teams')).toBeInTheDocument();
    });

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
      (useLoaderData as jest.Mock).mockReturnValue({
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
    it('should initially render with modal closed', () => {
      render(<UserPage />);
      
      expect(screen.queryByTestId('mock-create-team-modal')).not.toBeInTheDocument();
    });

    it('should open the modal when create team button is clicked', () => {
      render(<UserPage />);
      
      fireEvent.click(screen.getByText('+'));
      
      expect(screen.getByTestId('mock-create-team-modal')).toBeInTheDocument();
    });

    it('should close the modal when close button is clicked', () => {
      render(<UserPage />);
      
      // Open the modal
      fireEvent.click(screen.getByText('+'));
      expect(screen.getByTestId('mock-create-team-modal')).toBeInTheDocument();
      
      // Close the modal
      fireEvent.click(screen.getByText('Close Modal'));
      expect(screen.queryByTestId('mock-create-team-modal')).not.toBeInTheDocument();
    });
  });

  describe('Integration with components', () => {
    it('should pass correct props to CreateTeamModal', () => {
      render(<UserPage />);
      
      // Initially not called with isOpen=true
      expect(CreateTeamModal).toHaveBeenCalledWith(
        expect.objectContaining({ isOpen: false }),
        expect.anything()
      );
      
      // Open the modal
      fireEvent.click(screen.getByText('+'));
      
      // Should be called with isOpen=true
      expect(CreateTeamModal).toHaveBeenCalledWith(
        expect.objectContaining({ isOpen: true }),
        expect.anything()
      );
    });

    it('should pass correct props to TeamCard components', () => {
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
