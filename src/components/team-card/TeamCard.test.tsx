import { render, screen } from '@testing-library/react';
import { TeamCard } from './TeamCard';
import { TeamListItem } from '../../services/team-service/TeamService.ts';
import '@testing-library/jest-dom';

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, className, ...props }: any) => (
    <a href={to} className={className} {...props}>
      {children}
    </a>
  ),
}));

jest.mock('./TeamCard.module.css', () => ({
  link: 'mock-link-class',
  teamCard: 'mock-team-card-class',
  teamName: 'mock-team-name-class',
  teamCreatedDate: 'mock-team-created-date-class',
}));

describe('TeamCard', () => {
  const mockTeam: TeamListItem = {
    id: 'team-123',
    name: 'Test Team',
    createdAt: new Date('2023-01-15T10:30:00Z')
  };

  describe('Rendering', () => {
    it('should render the team card as a link', () => {
      render(<TeamCard team={mockTeam} />);
      
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/teams/team-123');
    });

    it('should render the team name', () => {
      render(<TeamCard team={mockTeam} />);
      expect(screen.getByText('Test Team')).toBeInTheDocument();
    });

    it('should render the formatted creation date', () => {
      render(<TeamCard team={mockTeam} />);
      expect(screen.getByText('1/15/2023')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible text content', () => {
      render(<TeamCard team={mockTeam} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveTextContent('Test Team');
      expect(link).toHaveTextContent('1/15/2023');
    });
  });
});
