import {fireEvent, render, screen} from '@testing-library/react';
import {ShareButton} from './ShareButton.tsx';
import '@testing-library/jest-dom';
import axios from 'axios';
import {Mock} from 'vitest';

vi.mock('axios');

vi.mock('../../../../config/ApiConfig.ts', () => ({
    ApiConfig: {
        baseApiUrl: () => 'http://localhost:8080',
    },
}));

describe('ShareButton', () => {
    const teamId = 'team-123';
    const retroId = 'retro-456';

    beforeEach(() => {
        vi.clearAllMocks();
        Object.defineProperty(window.navigator, 'clipboard', {
            value: {
                writeText: vi.fn().mockResolvedValue(undefined),
            },
            configurable: true,
        });
    });

    it('should render with "Share" text', () => {
        render(<ShareButton teamId={teamId} retroId={retroId}/>);
        expect(screen.getByText('Share')).toBeInTheDocument();
    });

    it('should create share token and copy link to clipboard on click', async () => {
        const clipboardSpy = vi.spyOn(window.navigator.clipboard, 'writeText');
        (axios.post as Mock).mockResolvedValue({
            data: {token: 'generated-token'},
        });

        render(<ShareButton teamId={teamId} retroId={retroId}/>);
        fireEvent.click(screen.getByText('Share'));

        await new Promise(resolve => setTimeout(resolve, 0));

        expect(axios.post).toHaveBeenCalledWith(
            `http://localhost:8080/api/teams/${teamId}/retros/${retroId}/share-tokens`
        );
        expect(clipboardSpy).toHaveBeenCalledWith(
            `http://localhost:3000/share/generated-token`
        );
    });

    it('should show "Copied!" text after clicking', async () => {
        (axios.post as Mock).mockResolvedValue({
            data: {token: 'generated-token'},
        });

        render(<ShareButton teamId={teamId} retroId={retroId}/>);
        fireEvent.click(screen.getByText('Share'));

        await new Promise(resolve => setTimeout(resolve, 0));

        expect(screen.getByText('Copied!')).toBeInTheDocument();
    });

    it('should handle clipboard errors gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const clipboardError = new Error('Clipboard failed');
        vi.spyOn(window.navigator.clipboard, 'writeText').mockRejectedValue(clipboardError);
        (axios.post as Mock).mockResolvedValue({
            data: {token: 'generated-token'},
        });

        render(<ShareButton teamId={teamId} retroId={retroId}/>);
        fireEvent.click(screen.getByText('Share'));

        await new Promise(resolve => setTimeout(resolve, 0));

        expect(consoleSpy).toHaveBeenCalledWith('Failed to copy share link: ', clipboardError);
        expect(screen.getByText('Share')).toBeInTheDocument();
        consoleSpy.mockRestore();
    });
});
