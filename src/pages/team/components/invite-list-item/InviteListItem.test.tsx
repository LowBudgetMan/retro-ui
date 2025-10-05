import {InviteListItem} from "./InviteListItem.tsx";
import {fireEvent, render, screen} from "@testing-library/react";
import {Invite} from "../../../../services/team-service/TeamService.ts";
import SpyInstance = jest.SpyInstance;



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
});
