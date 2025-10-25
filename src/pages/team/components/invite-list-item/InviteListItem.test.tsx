import {InviteListItem} from "./InviteListItem.tsx";
import {fireEvent, render, screen} from "@testing-library/react";
import {Invite, TeamService} from "../../../../services/team-service/TeamService.ts";
import {RevalidationState, useRevalidator} from "react-router-dom";
import {vi, describe, it, beforeEach, afterEach, expect, Mock} from 'vitest';

interface MockRevalidator {
    revalidate: ReturnType<typeof vi.fn>;
    state: RevalidationState;
}

vi.mock('react-router-dom', () => ({
    ...vi.importActual('react-router-dom'),
    useRevalidator: vi.fn(),
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
        beforeEach(() => {
            Object.defineProperty(window.navigator, 'clipboard', {
                value: {
                    writeText: vi.fn().mockResolvedValue(undefined),
                },
                configurable: true,
            });
        })

        it('should copy the invite as a url to the clipboard', async () => {
            const clipboardSpy = vi.spyOn(window.navigator.clipboard, 'writeText');
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
        let deleteInviteSpy: Mock;
        let mockRevalidator: MockRevalidator;

        beforeEach(() => {
            deleteInviteSpy = vi.spyOn(TeamService, 'deleteInvite').mockResolvedValue(undefined);
            mockRevalidator = {
                revalidate: vi.fn().mockResolvedValue(undefined),
                state: undefined as unknown as RevalidationState,
            };

            vi.mocked(useRevalidator).mockReturnValue(mockRevalidator);
        });

        afterEach(() => {
            vi.clearAllMocks();
        });

        it('should call deleteInvite and revalidate on successful deletion', async () => {
            render(<InviteListItem invite={invite} teamId={teamId} teamName={teamName} />);
            fireEvent.click(screen.getByText('delete'));

            await new Promise(resolve => setTimeout(resolve, 0));

            expect(deleteInviteSpy).toHaveBeenCalledWith(teamId, invite.id);
            expect(mockRevalidator.revalidate).toHaveBeenCalled();
        });

        it('should handle delete errors gracefully', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
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
