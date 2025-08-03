import '@jest/globals';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {ThoughtService} from './ThoughtService';

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
            mock.onPut(`${baseUrl}/teams/${teamId}/retros/${retroId}/thoughts/${thoughtId}/completed`).reply(500);
            await expect(ThoughtService.setCompleted(teamId, retroId, thoughtId, true)).rejects.toThrow();
        });
    });
    describe('vote', () => {
        it('should call vote endpoint', async () => {
            mock.onPut(`${baseUrl}/teams/${teamId}/retros/${retroId}/thoughts/${thoughtId}/votes`).reply(204);
            const result = await ThoughtService.vote(teamId, retroId, thoughtId);
            expect(result.status).toBe(204);
        });

        it('should throw when status is not 204', async () => {
            mock.onPut(`${baseUrl}/teams/${teamId}/retros/${retroId}/thoughts/${thoughtId}/votes`).reply(500);
            await expect(ThoughtService.vote(teamId, retroId, thoughtId)).rejects.toThrow();
        });
    });

    describe('setMessage', () => {
        it('should set message with correct endpoint and payload', async () => {
            const message = 'Updated thought message';

            mock.onPut(`${baseUrl}/teams/${teamId}/retros/${retroId}/thoughts/${thoughtId}/message`, {
                message
            }).reply(204);

            const result = await ThoughtService.setMessage(teamId, retroId, thoughtId, message);
            expect(result.status).toBe(204);
        });

        it('should throw when status is not 204', async () => {
            const message = 'Test message';
            mock.onPut(`${baseUrl}/teams/${teamId}/retros/${retroId}/thoughts/${thoughtId}/message`).reply(500);
            await expect(ThoughtService.setMessage(teamId, retroId, thoughtId, message)).rejects.toThrow();
        });
    });

    describe('deleteThought', () => {
        it('should call vote endpoint', async () => {
            mock.onDelete(`${baseUrl}/teams/${teamId}/retros/${retroId}/thoughts/${thoughtId}`).reply(204);
            const result = await ThoughtService.deleteThought(teamId, retroId, thoughtId);
            expect(result.status).toBe(204);
        });

        it('should throw when status is not 204', async () => {
            mock.onDelete(`${baseUrl}/teams/${teamId}/retros/${retroId}/thoughts/${thoughtId}`).reply(403);
            await expect(ThoughtService.deleteThought(teamId, retroId, thoughtId)).rejects.toThrow();
        });
    });
});
