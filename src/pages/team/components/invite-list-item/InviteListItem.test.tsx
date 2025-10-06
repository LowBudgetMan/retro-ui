import {InviteListItem} from "./InviteListItem.tsx";
import {fireEvent, render, screen} from "@testing-library/react";
import {Invite, TeamService} from "../../../../services/team-service/TeamService.ts";
import {useRevalidator} from "react-router-dom";
import SpyInstance = jest.SpyInstance;

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useRevalidator: jest.fn(),
}));


describe('InviteListItem', () => {
    const teamId = 'teamId';
    const teamName = 'Team Name';
    const invite: Invite = {id: 'inviteId', teamId: teamId, createdAt: new Date()};

    it('should show inviteId', () => {
        render(<InviteListItem invite={invite} teamId={teamId} teamName={teamName} />);
        expect(screen.getByText('inviteId')).toBeInTheDocument();
    });

    it('should show created DateTime', () => {
        render(<InviteListItem invite={invite} teamId={teamId} teamName={teamName} />);
        expect(screen.getByText(invite.createdAt.toISOString())).toBeInTheDocument();
    });

    describe('copy invite button', () => {
        let clipboardSpy: SpyInstance<Promise<void>>;

        beforeEach(() => {
            Object.defineProperty(window.navigator, 'clipboard', {
                value: {
                    writeText: jest.fn().mockResolvedValue(undefined),
                },
                configurable: true,
            });
            clipboardSpy = jest.spyOn(window.navigator.clipboard, 'writeText');
        })

        it('should copy the invite as a url to the clipboard', async () => {
            const invitePackage = btoa(JSON.stringify({
                inviteId: invite.id,
                teamId,
                teamName
            }));
            const expectedInviteLink = `http://localhost:3000/invite?package=${invitePackage}`;
            render(<InviteListItem invite={invite} teamId={teamId} teamName={teamName} />);
            fireEvent.click(screen.getByText('copy'));

            expect(clipboardSpy).toHaveBeenCalledWith(expectedInviteLink);
        });
    });

    describe('delete invite button', () => {
        let deleteInviteSpy: SpyInstance<Promise<void>>;
        let mockRevalidator: { revalidate: jest.Mock };

        beforeEach(() => {
            deleteInviteSpy = jest.spyOn(TeamService, 'deleteInvite').mockResolvedValue(undefined);
            mockRevalidator = {
                revalidate: jest.fn().mockResolvedValue(undefined),
            };

            (useRevalidator as jest.Mock).mockReturnValue(mockRevalidator);
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should call deleteInvite and revalidate on successful deletion', async () => {
            render(<InviteListItem invite={invite} teamId={teamId} teamName={teamName} />);
            fireEvent.click(screen.getByText('delete'));

            await new Promise(resolve => setTimeout(resolve, 0));

            expect(deleteInviteSpy).toHaveBeenCalledWith(teamId, invite.id);
            expect(mockRevalidator.revalidate).toHaveBeenCalled();
        });

        it('should handle delete errors gracefully', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            const error = new Error('Delete failed');
            deleteInviteSpy.mockRejectedValue(error);

            render(<InviteListItem invite={invite} teamId={teamId} teamName={teamName} />);
            fireEvent.click(screen.getByText('delete'));

            await new Promise(resolve => setTimeout(resolve, 0));

            expect(deleteInviteSpy).toHaveBeenCalledWith(teamId, invite.id);
            expect(consoleSpy).toHaveBeenCalledWith('Delete failed:', error);

            consoleSpy.mockRestore();
        });
    });
});
