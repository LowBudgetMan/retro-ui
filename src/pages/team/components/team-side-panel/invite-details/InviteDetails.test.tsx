import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {Invite, TeamService} from "../../../../../services/team-service/TeamService.ts";
import {Mock} from "vitest";
import {useRevalidator} from "react-router-dom";
import {InviteDetails} from "./InviteDetails.tsx";
import {ToastContext} from "../../../../../context/toast/ToastContext.tsx";
import {ToastType} from "../../../../../context/toast/ToastContextTypes.ts";
import {PropsWithChildren} from "react";

vi.mock('react-router-dom', () => ({
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

const teamId = 'team-123';
const teamName = 'Team Name';
const mockInvites: Invite[] = [
    {
        id: 'inviteId1',
        teamId: 'teamId1',
        createdAt: new Date('2023-01-01T00:00:00Z'),
    },
    {
        id: 'inviteId2',
        teamId: 'teamId1',
        createdAt: new Date('2023-01-02T00:00:00Z'),
    }
];

vi.mock('../../../../../services/team-service/TeamService.ts', () => ({
    TeamService: {
        createInvite: vi.fn(),
    },
}));

describe('Invites', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useRevalidator as Mock).mockReturnValue({
            revalidate: vi.fn().mockResolvedValue(undefined),
            state: 'idle'
        } as const);
    });

    it('should render the invites section with heading', () => {
        renderWithToastContext(<InviteDetails id={teamId} name={teamName} invites={mockInvites} />);

        expect(screen.getByText('Invites')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: 'Create invite link'})).toBeInTheDocument();
    });

    it('should pass correct props to InviteListItem components', () => {
        renderWithToastContext(<InviteDetails id={teamId} name={teamName} invites={mockInvites} />);
        expect(screen.getByText('inviteId1')).toBeInTheDocument();
        expect(screen.getByText('inviteId2')).toBeInTheDocument();
    });

    describe('Create invite button', () => {
        it('should call TeamService.createInvite with correct team id when create button is clicked', async () => {
            const user = userEvent.setup();
            (TeamService.createInvite as Mock).mockResolvedValue('new-invite-id');

            renderWithToastContext(<InviteDetails id={teamId} name={teamName} invites={mockInvites} />);

            const createButton = screen.getByRole('button', {name: 'Create invite link'});
            await user.click(createButton);

            expect(TeamService.createInvite).toHaveBeenCalledWith('team-123');
            expect(TeamService.createInvite).toHaveBeenCalledTimes(1);
        });

        it('should call revalidator.revalidate when createInvite is successful', async () => {
            const user = userEvent.setup();
            const mockRevalidate = vi.fn().mockResolvedValue(undefined);
            (useRevalidator as Mock).mockReturnValue({
                revalidate: mockRevalidate,
                state: 'idle'
            });
            (TeamService.createInvite as Mock).mockResolvedValue('new-invite-id');

            renderWithToastContext(<InviteDetails id={teamId} name={teamName} invites={mockInvites} />);

            const createButton = screen.getByRole('button', {name: 'Create invite link'});
            await user.click(createButton);

            expect(mockRevalidate).toHaveBeenCalledTimes(1);
        });

        it('should queue a failure toast and not revalidate when createInvite rejects', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const user = userEvent.setup();
            const mockRevalidate = vi.fn().mockResolvedValue(undefined);
            (useRevalidator as Mock).mockReturnValue({
                revalidate: mockRevalidate,
                state: 'idle'
            });
            const error = new Error('Missing "location" header in createInvite response');
            (TeamService.createInvite as Mock).mockRejectedValue(error);

            renderWithToastContext(<InviteDetails id={teamId} name={teamName} invites={mockInvites} />);

            const createButton = screen.getByRole('button', {name: 'Create invite link'});
            await user.click(createButton);

            expect(queueToast).toHaveBeenCalledWith({
                message: "Couldn't create an invite link. Please try again.",
                type: ToastType.FAILURE,
            });
            expect(consoleSpy).toHaveBeenCalledWith('Failed to create invite:', error);
            expect(mockRevalidate).not.toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });
});