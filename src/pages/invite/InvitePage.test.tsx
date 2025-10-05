import { render, screen, fireEvent } from '@testing-library/react';
import { InvitePage } from './InvitePage';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { TeamService } from '../../services/team-service/TeamService';
import { InvitePageData } from './inviteLoader';
import '@testing-library/jest-dom';

jest.mock('react-router-dom', () => ({
  useLoaderData: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock('../../services/team-service/TeamService');

const mockNavigate = jest.fn();
const mockAddUserToTeam = jest.fn();

describe('InvitePage', () => {
    const mockInviteData: InvitePageData = {
        teamId: 'team-123',
        teamName: 'Test Team',
        inviteId: 'invite-456'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useLoaderData as jest.Mock).mockReturnValue(mockInviteData);
        (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
        (TeamService.addUserToTeam as jest.Mock).mockImplementation(mockAddUserToTeam);
    });

    it('should display the team name', () => {
        render(<InvitePage />);

        expect(screen.getByText(/You've been invited to join/)).toBeInTheDocument();
        expect(screen.getByText('Test Team')).toBeInTheDocument();
    });

    it('should render the accept button', () => {
        render(<InvitePage />);

        const acceptButton = screen.getByRole('button', { name: 'Accept' });
        expect(acceptButton).toBeInTheDocument();
    });

    describe('Accept button', () => {
        it('should call TeamService.addUserToTeam with correct parameters when accept button is clicked', async () => {
            render(<InvitePage />);

            const acceptButton = screen.getByRole('button', { name: 'Accept' });
            fireEvent.click(acceptButton);

            expect(mockAddUserToTeam).toHaveBeenCalledWith('team-123', 'invite-456');
            expect(mockAddUserToTeam).toHaveBeenCalledTimes(1);
        });

        it('should navigate to the correct team page after acceptance', async () => {
            mockAddUserToTeam.mockResolvedValue(undefined);

            render(<InvitePage />);

            const acceptButton = screen.getByRole('button', { name: 'Accept' });

            fireEvent.click(acceptButton);
            await new Promise(resolve => setTimeout(resolve, 0));

            expect(mockNavigate).toHaveBeenCalledWith('/teams/team-123');
            expect(mockNavigate).toHaveBeenCalledTimes(1);
        });
    });
});
