import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchClient } from '../../config/FetchClient';
import { RetroEventService } from './RetroEventService';

vi.mock('../../config/FetchClient', () => ({
    fetchClient: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    }
}));

vi.mock('../../config/ApiConfig', () => ({
    ApiConfig: {
        baseApiUrl: () => 'http://localhost'
    }
}));

describe('RetroEventService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should POST to focus endpoint with thoughtId', async () => {
        vi.mocked(fetchClient.post).mockResolvedValue({data: null, status: 200, headers: new Headers()});
        await RetroEventService.focus('teamId', 'retroId', 'thoughtId');
        expect(fetchClient.post).toHaveBeenCalledWith(
            'http://localhost/api/teams/teamId/retros/retroId/events/focus',
            { thoughtId: 'thoughtId' }
        );
    });

    it('should POST to focus-clear endpoint', async () => {
        vi.mocked(fetchClient.post).mockResolvedValue({data: null, status: 200, headers: new Headers()});
        await RetroEventService.clearFocus('teamId', 'retroId');
        expect(fetchClient.post).toHaveBeenCalledWith(
            'http://localhost/api/teams/teamId/retros/retroId/events/focus-clear'
        );
    });
});
