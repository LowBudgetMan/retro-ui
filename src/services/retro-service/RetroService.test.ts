import '@jest/globals';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { RetroService, Retro, Thought, RetroListItem } from './RetroService.ts';
import { DateTime } from 'luxon';
import {ApiConfig} from '../../config/ApiConfig.ts';

const mock = new MockAdapter(axios);

jest.mock('../../config/ApiConfig.ts', () => ({
    ApiConfig: {
        baseApiUrl: 'http://localhost:8080',
        websocketUrl: 'ws://localhost:8080/websocket/websocket'
    }
}));

describe('RetroService', () => {
    const teamId = 'team-123';
    const retroId = 'retro-123';
    const testDate = DateTime.fromISO('2024-01-01T00:00:00.000Z');

    beforeEach(() => {
        mock.reset();
    });

    describe('getRetrosForTeam', () => {
        it('should fetch retros for a team', async () => {
            const mockRetroResponse = [
                {
                    id: '1',
                    teamId,
                    finished: false,
                    templateId: 'template-1',
                    createdAt: testDate.toISO()
                }
            ];

            const expectedRetros: RetroListItem[] = [
                {
                    ...mockRetroResponse[0],
                    createdAt: testDate,
                }
            ];

            mock.onGet(`${ApiConfig.baseApiUrl}/api/teams/${teamId}/retros`).reply(200, mockRetroResponse);

            const result = await RetroService.getRetrosForTeam(teamId);
            expect(result).toEqual(expectedRetros);
        });

        it('should handle errors when fetching retros', async () => {
            mock.onGet(`${ApiConfig.baseApiUrl}/api/teams/${teamId}/retros`).reply(500);

            await expect(RetroService.getRetrosForTeam(teamId)).rejects.toThrow();
        });
    });

    describe('getRetro', () => {
        it('should fetch a specific retro', async () => {
            const mockRetroResponse = {
                id: retroId.toString(),
                teamId,
                finished: false,
                template: {
                    id: 'template-1',
                    name: 'Basic Retro',
                    description: 'A basic retro template',
                    categories: []
                },
                thoughts: [],
                createdAt: testDate.toISO()
            };

            const expectedRetro: Retro = {
                ...mockRetroResponse,
                createdAt: testDate,
            };

            mock.onGet(`${ApiConfig.baseApiUrl}/api/teams/${teamId}/retros/${retroId}`).reply(200, mockRetroResponse);

            const result = await RetroService.getRetro(teamId, retroId);
            expect(result).toEqual(expectedRetro);
        });

        it('should handle errors when fetching a specific retro', async () => {
            mock.onGet(`${ApiConfig.baseApiUrl}/api/teams/${teamId}/retros/${retroId}`).reply(404);

            await expect(RetroService.getRetro(teamId, retroId)).rejects.toThrow();
        });
    });

    describe('createRetro', () => {
        it('should create a new retro', async () => {
            const retroTemplateId = 'template-123';
            const mockResponse = { id: 'new-retro-id' };

            mock.onPost(`${ApiConfig.baseApiUrl}/api/teams/${teamId}/retros`, { retroTemplateId })
                .reply(201, mockResponse);

            const result = await RetroService.createRetro(teamId, retroTemplateId);
            expect(result.data).toEqual(mockResponse);
        });

        it('should handle errors when creating a retro', async () => {
            const retroTemplateId = 'invalid-template';
            mock.onPost(`${ApiConfig.baseApiUrl}/api/teams/${teamId}/retros`).reply(400);

            await expect(RetroService.createRetro(teamId, retroTemplateId)).rejects.toThrow();
        });
    });

    describe('createThought', () => {
        it('should create a new thought', async () => {
            const message = 'Test thought';
            const category = 'happy';
            const mockResponse = { id: 'new-thought-id' };

            mock.onPost(`${ApiConfig.baseApiUrl}/api/teams/${teamId}/retros/${retroId}/thoughts`, { message, category })
                .reply(201, mockResponse);

            const result = await RetroService.createThought(teamId, retroId, message, category);
            expect(result.data).toEqual(mockResponse);
        });

        it('should handle errors when creating a thought', async () => {
            mock.onPost(`${ApiConfig.baseApiUrl}/api/teams/${teamId}/thoughts`).reply(400);

            await expect(RetroService.createThought(teamId, retroId, '', 'happy')).rejects.toThrow();
        });
    });

    describe('getThoughts', () => {
        it('should fetch thoughts for a team', async () => {
            const mockThoughtResponse = [
                {
                    id: 'thought-1',
                    message: 'Test thought',
                    votes: 0,
                    completed: false,
                    category: 'What went well',
                    retroId: retroId.toString(),
                    createdAt: testDate.toISO()
                }
            ];

            const expectedThoughts: Thought[] = [
                {
                    ...mockThoughtResponse[0],
                    createdAt: testDate,
                }
            ];

            mock.onGet(`${ApiConfig.baseApiUrl}/api/team/${teamId}/retros/${retroId}/thoughts`).reply(200, mockThoughtResponse);

            const result = await RetroService.getThoughts(teamId, retroId);
            expect(result).toEqual(expectedThoughts);
        });

        it('should handle errors when fetching thoughts', async () => {
            mock.onGet(`${ApiConfig.baseApiUrl}/api/team/${teamId}/retros/${retroId}/thoughts`).reply(500);

            await expect(RetroService.getThoughts(teamId, retroId.toString())).rejects.toThrow();
        });
    });
});
