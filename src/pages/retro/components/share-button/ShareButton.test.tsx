import {fireEvent, render, screen} from '@testing-library/react';
import {ShareButton} from './ShareButton.tsx';
import '@testing-library/jest-dom';
import { fetchClient } from '../../../../config/FetchClient';
import {ToastContext} from '../../../../context/toast/ToastContext.tsx';
import {ToastType} from '../../../../context/toast/ToastContextTypes.ts';
import {PropsWithChildren} from 'react';

vi.mock('../../../../config/FetchClient', () => ({
    fetchClient: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    }
}));

vi.mock('../../../../config/ApiConfig.ts', () => ({
    ApiConfig: {
        baseApiUrl: () => 'http://localhost:8080',
    },
}));

describe('ShareButton', () => {
    const teamId = 'team-123';
    const retroId = 'retro-456';
    const queueToast = vi.fn();

    function renderWithToastContext(ui: React.ReactElement) {
        const Wrapper = ({children}: PropsWithChildren) => (
            <ToastContext.Provider value={{toasts: [], queueToast}}>
                {children}
            </ToastContext.Provider>
        );
        return render(ui, {wrapper: Wrapper});
    }

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
        renderWithToastContext(<ShareButton teamId={teamId} retroId={retroId}/>);
        expect(screen.getByText('Share')).toBeInTheDocument();
    });

    it('should create share token and copy link to clipboard on click', async () => {
        const clipboardSpy = vi.spyOn(window.navigator.clipboard, 'writeText');
        vi.mocked(fetchClient.post).mockResolvedValue({
            data: {token: 'generated-token'},
            status: 201,
            headers: new Headers(),
        });

        renderWithToastContext(<ShareButton teamId={teamId} retroId={retroId}/>);
        fireEvent.click(screen.getByText('Share'));

        await new Promise(resolve => setTimeout(resolve, 0));

        expect(fetchClient.post).toHaveBeenCalledWith(
            `http://localhost:8080/api/teams/${teamId}/retros/${retroId}/share-tokens`
        );
        expect(clipboardSpy).toHaveBeenCalledWith(
            `http://localhost:3000/share/generated-token`
        );
    });

    it('should queue a success toast after copying link to clipboard', async () => {
        vi.mocked(fetchClient.post).mockResolvedValue({
            data: {token: 'generated-token'},
            status: 201,
            headers: new Headers(),
        });

        renderWithToastContext(<ShareButton teamId={teamId} retroId={retroId}/>);
        fireEvent.click(screen.getByText('Share'));

        await new Promise(resolve => setTimeout(resolve, 0));

        expect(queueToast).toHaveBeenCalledWith({
            message: 'Copied share link to clipboard',
            type: ToastType.SUCCESS,
        });
    });

    it('should queue a failure toast and log when the clipboard write fails', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const clipboardError = new Error('Clipboard failed');
        vi.spyOn(window.navigator.clipboard, 'writeText').mockRejectedValue(clipboardError);
        vi.mocked(fetchClient.post).mockResolvedValue({
            data: {token: 'generated-token'},
            status: 201,
            headers: new Headers(),
        });

        renderWithToastContext(<ShareButton teamId={teamId} retroId={retroId}/>);
        fireEvent.click(screen.getByText('Share'));

        await new Promise(resolve => setTimeout(resolve, 0));

        expect(queueToast).toHaveBeenCalledWith({
            message: 'Failed to copy share link',
            type: ToastType.FAILURE,
        });
        expect(consoleSpy).toHaveBeenCalledWith('Failed to copy share link: ', clipboardError);
        expect(screen.getByText('Share')).toBeInTheDocument();
        consoleSpy.mockRestore();
    });
});
