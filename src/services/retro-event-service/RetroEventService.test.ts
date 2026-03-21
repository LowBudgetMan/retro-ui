import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { RetroEventService } from './RetroEventService';

vi.mock('axios');
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
        await RetroEventService.focus('teamId', 'retroId', 'thoughtId');
        expect(axios.post).toHaveBeenCalledWith(
            'http://localhost/api/teams/teamId/retros/retroId/events/focus',
            { thoughtId: 'thoughtId' }
        );
    });

    it('should POST to focus-clear endpoint', async () => {
        await RetroEventService.clearFocus('teamId', 'retroId');
        expect(axios.post).toHaveBeenCalledWith(
            'http://localhost/api/teams/teamId/retros/retroId/events/focus-clear'
        );
    });
});
