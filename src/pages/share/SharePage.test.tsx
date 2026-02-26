import {render, screen, waitFor} from '@testing-library/react';
import {SharePage} from './SharePage.tsx';
import '@testing-library/jest-dom';
import {Mock} from 'vitest';
import {useNavigate, useParams} from 'react-router-dom';
import {ShareLinkService} from '../../services/share-link-service/ShareLinkService.ts';
import {setShareToken} from '../../services/anonymous-auth/AnonymousAuthService.ts';

vi.mock('react-router-dom', () => ({
    useParams: vi.fn(),
    useNavigate: vi.fn(),
}));

vi.mock('../../services/share-link-service/ShareLinkService.ts', () => ({
    ShareLinkService: {
        validateShareLink: vi.fn(),
    },
}));

vi.mock('../../services/anonymous-auth/AnonymousAuthService.ts', () => ({
    setShareToken: vi.fn(),
}));

describe('SharePage', () => {
    const mockNavigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useNavigate as Mock).mockReturnValue(mockNavigate);
    });

    it('should validate token and redirect to retro page on success', async () => {
        (useParams as Mock).mockReturnValue({token: 'valid-token'});
        (ShareLinkService.validateShareLink as Mock).mockResolvedValue({
            teamId: 'team-123',
            retroId: 'retro-456',
        });

        render(<SharePage/>);

        await waitFor(() => {
            expect(ShareLinkService.validateShareLink).toHaveBeenCalledWith('valid-token');
            expect(setShareToken).toHaveBeenCalledWith('valid-token');
            expect(mockNavigate).toHaveBeenCalledWith('/teams/team-123/retros/retro-456', {replace: true});
        });
    });

    it('should show error message when token is invalid', async () => {
        (useParams as Mock).mockReturnValue({token: 'invalid-token'});
        (ShareLinkService.validateShareLink as Mock).mockRejectedValue(new Error('Not found'));

        render(<SharePage/>);

        await waitFor(() => {
            expect(screen.getByText('This share link is invalid or has expired.')).toBeInTheDocument();
        });
    });

    it('should show error message when token is missing', () => {
        (useParams as Mock).mockReturnValue({token: undefined});

        render(<SharePage/>);

        expect(screen.getByText('Invalid share link.')).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
        (useParams as Mock).mockReturnValue({token: 'some-token'});
        (ShareLinkService.validateShareLink as Mock).mockReturnValue(new Promise(() => {}));

        render(<SharePage/>);

        expect(screen.getByText('Joining retro...')).toBeInTheDocument();
    });
});
