import '@jest/globals';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { ThoughtService } from './ThoughtService';

const mock = new MockAdapter(axios);

describe('ThoughtService', () => {
    const baseUrl = 'http://localhost:8080/api';
    const teamId = 'team-123';
    const retroId = 'retro-123';
    const thoughtId = 'thought-123';

    beforeEach(() => {
        mock.reset();
    });

    describe('setCompleted', () => {
        it('should set completed as passed value', async () => {
            const completed = true;
            const mockResponse = { success: true };

            mock.onPut(`${baseUrl}/teams/${teamId}/retros/${retroId}/thoughts/${thoughtId}/completed`, {
                completed
            }).reply(200, mockResponse);

            const result = await ThoughtService.setCompleted(teamId, retroId, thoughtId, completed);
            expect(result.data).toEqual(mockResponse);
            expect(result.status).toBe(200);
        });

        it('should throw when status is not 204', async () => {
            const completed = true;
            mock.onPut(`${baseUrl}/teams/${teamId}/retros/${retroId}/thoughts/${thoughtId}/completed`).reply(500);

            await expect(ThoughtService.setCompleted(teamId, retroId, thoughtId, completed)).rejects.toThrow();
        });
    });
});
