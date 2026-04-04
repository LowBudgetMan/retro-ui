import { vi } from 'vitest';
import { fetchClient } from '../../config/FetchClient';
import {ThoughtService} from './ThoughtService';

vi.mock('../../config/FetchClient', () => ({
    fetchClient: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    }
}));

vi.mock('../../config/ApiConfig.ts', () => ({
    ApiConfig: {
        baseApiUrl: () => 'http://localhost:8080',
        websocketUrl: () => 'ws://localhost:8080/websocket/websocket'
    }
}));

describe('ThoughtService', () => {
    const teamId = 'team-123';
    const retroId = 'retro-123';
    const thoughtId = 'thought-123';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('setCompleted', () => {
        it('should set completed as passed value', async () => {
            const completed = true;
            const mockResponse = { success: true };

            vi.mocked(fetchClient.put).mockResolvedValue({data: mockResponse, status: 200, headers: new Headers()});

            const result = await ThoughtService.setCompleted(teamId, retroId, thoughtId, completed);
            expect(result.data).toEqual(mockResponse);
            expect(result.status).toBe(200);
            expect(fetchClient.put).toHaveBeenCalledWith(
                `http://localhost:8080/api/teams/${teamId}/retros/${retroId}/thoughts/${thoughtId}/completed`,
                {completed}
            );
        });

        it('should throw when status is not 204', async () => {
            vi.mocked(fetchClient.put).mockRejectedValue(new Error('Request failed'));
            await expect(ThoughtService.setCompleted(teamId, retroId, thoughtId, true)).rejects.toThrow();
        });
    });
    describe('vote', () => {
        it('should call vote endpoint', async () => {
            vi.mocked(fetchClient.put).mockResolvedValue({data: null, status: 204, headers: new Headers()});
            const result = await ThoughtService.vote(teamId, retroId, thoughtId);
            expect(result.status).toBe(204);
            expect(fetchClient.put).toHaveBeenCalledWith(
                `http://localhost:8080/api/teams/${teamId}/retros/${retroId}/thoughts/${thoughtId}/votes`
            );
        });

        it('should throw when status is not 204', async () => {
            vi.mocked(fetchClient.put).mockRejectedValue(new Error('Request failed'));
            await expect(ThoughtService.vote(teamId, retroId, thoughtId)).rejects.toThrow();
        });
    });

    describe('setMessage', () => {
        it('should set message with correct endpoint and payload', async () => {
            const message = 'Updated thought message';

            vi.mocked(fetchClient.put).mockResolvedValue({data: null, status: 204, headers: new Headers()});

            const result = await ThoughtService.setMessage(teamId, retroId, thoughtId, message);
            expect(result.status).toBe(204);
            expect(fetchClient.put).toHaveBeenCalledWith(
                `http://localhost:8080/api/teams/${teamId}/retros/${retroId}/thoughts/${thoughtId}/message`,
                {message}
            );
        });

        it('should throw when status is not 204', async () => {
            const message = 'Test message';
            vi.mocked(fetchClient.put).mockRejectedValue(new Error('Request failed'));
            await expect(ThoughtService.setMessage(teamId, retroId, thoughtId, message)).rejects.toThrow();
        });
    });

    describe('deleteThought', () => {
        it('should call vote endpoint', async () => {
            vi.mocked(fetchClient.delete).mockResolvedValue({data: null, status: 204, headers: new Headers()});
            const result = await ThoughtService.deleteThought(teamId, retroId, thoughtId);
            expect(result.status).toBe(204);
            expect(fetchClient.delete).toHaveBeenCalledWith(
                `http://localhost:8080/api/teams/${teamId}/retros/${retroId}/thoughts/${thoughtId}`
            );
        });

        it('should throw when status is not 204', async () => {
            vi.mocked(fetchClient.delete).mockRejectedValue(new Error('Request failed'));
            await expect(ThoughtService.deleteThought(teamId, retroId, thoughtId)).rejects.toThrow();
        });
    });
});
