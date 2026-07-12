import {InviteListItem} from "./InviteListItem.tsx";
import {fireEvent, render, screen} from "@testing-library/react";
import {Invite, TeamService} from "../../../../services/team-service/TeamService.ts";
import {RevalidationState, useRevalidator} from "react-router-dom";
import {vi, describe, it, beforeEach, afterEach, expect, Mock} from 'vitest';
import {ToastContext} from "../../../../context/toast/ToastContext.tsx";
import {ToastType} from "../../../../context/toast/ToastContextTypes.ts";
import {PropsWithChildren} from "react";

interface MockRevalidator {
    revalidate: ReturnType<typeof vi.fn>;
    state: RevalidationState;
}

vi.mock('react-router-dom', () => ({
    ...vi.importActual('react-router-dom'),
    useRevalidator: vi.fn(),
}));

const queueToast = vi.fn();

function renderWithToastContext(ui: React.ReactElement) {
    const Wrapper = ({children}: PropsWithChildren) => (
        <ToastContext.Provider value={{toasts: [], queueToast}}>
            {children}
        </ToastContext.Provider>
    );
    return render(ui, {wrapper: Wrapper});
}


describe('InviteListItem', () => {
    const teamId = 'teamId';
    const teamName = 'Team Name';
    const invite: Invite = {id: 'inviteId', teamId: teamId, createdAt: new Date()};

    beforeEach(() => {
        queueToast.mockClear();
    });

    it('should show inviteId', () => {
        renderWithToastContext(<InviteListItem invite={invite} teamId={teamId} teamName={teamName} />);
        expect(screen.getByText('inviteId')).toBeInTheDocument();
    });

    it('should show created DateTime', () => {
        renderWithToastContext(<InviteListItem invite={invite} teamId={teamId} teamName={teamName} />);
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
            renderWithToastContext(<InviteListItem invite={invite} teamId={teamId} teamName={teamName} />);
            fireEvent.click(screen.getByText('copy'));

            expect(clipboardSpy).toHaveBeenCalledWith(expectedInviteLink);
        });

        it('should queue a success toast after copying the invite link', async () => {
            renderWithToastContext(<InviteListItem invite={invite} teamId={teamId} teamName={teamName} />);
            fireEvent.click(screen.getByText('copy'));

            await new Promise(resolve => setTimeout(resolve, 0));

            expect(queueToast).toHaveBeenCalledWith({
                message: 'Copied invite link to clipboard',
                type: ToastType.SUCCESS,
            });
        });

        it('should queue a failure toast and log when the clipboard write fails', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const clipboardError = new Error('Clipboard failed');
            vi.spyOn(window.navigator.clipboard, 'writeText').mockRejectedValue(clipboardError);

            renderWithToastContext(<InviteListItem invite={invite} teamId={teamId} teamName={teamName} />);
            fireEvent.click(screen.getByText('copy'));

            await new Promise(resolve => setTimeout(resolve, 0));

            expect(queueToast).toHaveBeenCalledWith({
                message: 'Failed to copy invite link',
                type: ToastType.FAILURE,
            });
            expect(consoleSpy).toHaveBeenCalledWith('Failed to copy text: ', clipboardError);

            consoleSpy.mockRestore();
        });
    });

    describe('delete invite button', () => {
        let deleteInviteSpy: Mock;
        let mockRevalidator: MockRevalidator;

        beforeEach(() => {
            deleteInviteSpy = vi.spyOn(TeamService, 'deleteInvite').mockResolvedValue({data: null, status: 204, headers: new Headers()});
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
            renderWithToastContext(<InviteListItem invite={invite} teamId={teamId} teamName={teamName} />);
            fireEvent.click(screen.getByText('delete'));

            await new Promise(resolve => setTimeout(resolve, 0));

            expect(deleteInviteSpy).toHaveBeenCalledWith(teamId, invite.id);
            expect(mockRevalidator.revalidate).toHaveBeenCalled();
        });

        it('should handle delete errors gracefully', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const error = new Error('Delete failed');
            deleteInviteSpy.mockRejectedValue(error);

            renderWithToastContext(<InviteListItem invite={invite} teamId={teamId} teamName={teamName} />);
            fireEvent.click(screen.getByText('delete'));

            await new Promise(resolve => setTimeout(resolve, 0));

            expect(deleteInviteSpy).toHaveBeenCalledWith(teamId, invite.id);
            expect(consoleSpy).toHaveBeenCalledWith('Delete failed:', error);

            consoleSpy.mockRestore();
        });

        it('should queue a failure toast when delete rejects', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const error = new Error('Delete failed');
            deleteInviteSpy.mockRejectedValue(error);

            renderWithToastContext(<InviteListItem invite={invite} teamId={teamId} teamName={teamName} />);
            fireEvent.click(screen.getByText('delete'));

            await new Promise(resolve => setTimeout(resolve, 0));

            expect(queueToast).toHaveBeenCalledWith({
                message: "Couldn't delete invite. Please try again.",
                type: ToastType.FAILURE,
            });

            consoleSpy.mockRestore();
        });
    });
});
