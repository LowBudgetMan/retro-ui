import {EndRetroButton} from "./EndRetroButton.tsx";
import {fireEvent, render, screen} from "@testing-library/react";
import {RetroService} from "../../../../services/retro-service/RetroService";
import {beforeEach, Mock} from "vitest";
import {useNavigate} from "react-router-dom";

vi.mock('../../../../services/retro-service/RetroService');

vi.mock('react-router-dom', () => ({
    useLoaderData: vi.fn(),
    useNavigate: vi.fn(),
}));

const mockNavigate = vi.fn();

describe('End Retro Button', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    })

    it('should call setFinished with true when clicked', () => {
        const teamId = 'teamId';
        const retroId = 'retroId';
        (RetroService.setFinished as Mock).mockResolvedValue({});
        render(<EndRetroButton teamId={teamId} retroId={retroId}/>);
        fireEvent.click(screen.getByRole('button', { name: 'End Retro' }));
        expect((RetroService.setFinished as Mock)).toHaveBeenCalledWith(teamId, retroId, true);
    });

    it('should redirect to Team page on success', async () => {
        (RetroService.setFinished as Mock).mockResolvedValue({});
        render(<EndRetroButton teamId={'teamId'} retroId={'retroId'}/>);
        fireEvent.click(screen.getByRole('button', { name: 'End Retro' }));

        await vi.waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/teams/teamId');
        })
    });
});