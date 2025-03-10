import '@jest/globals';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { RetroService, Retro, Thought, Column } from './RetroService';

const mock = new MockAdapter(axios);

describe('RetroService', () => {
    const baseUrl = 'http://localhost:8080/api';
    const teamId = 'team-123';
    const retroId = 456;
    const testDate = new Date('2024-01-01T00:00:00.000Z');

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
                    template: {
                        id: 'template-1',
                        name: 'Basic Retro',
                        description: 'A basic retro template',
                        categories: [
                            {
                                name: 'What went well',
                                position: 0,
                                lightBackgroundColor: '#e3f2fd',
                                lightTextColor: '#1976d2',
                                darkBackgroundColor: '#1976d2',
                                darkTextColor: '#ffffff'
                            }
                        ]
                    },
                    thoughts: [],
                    dateCreated: testDate.toISOString()
                }
            ];

            const expectedRetros: Retro[] = [
                {
                    ...mockRetroResponse[0],
                    dateCreated: testDate
                }
            ];

            mock.onGet(`${baseUrl}/teams/${teamId}/retros`).reply(200, mockRetroResponse);

            const result = await RetroService.getRetrosForTeam(teamId);
            expect(result).toEqual(expectedRetros);
        });

        it('should handle errors when fetching retros', async () => {
            mock.onGet(`${baseUrl}/teams/${teamId}/retros`).reply(500);

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
                dateCreated: testDate.toISOString()
            };

            const expectedRetro: Retro = {
                ...mockRetroResponse,
                dateCreated: testDate
            };

            mock.onGet(`${baseUrl}/teams/${teamId}/retros/${retroId}`).reply(200, mockRetroResponse);

            const result = await RetroService.getRetro(teamId, retroId);
            expect(result).toEqual(expectedRetro);
        });

        it('should handle errors when fetching a specific retro', async () => {
            mock.onGet(`${baseUrl}/teams/${teamId}/retros/${retroId}`).reply(404);

            await expect(RetroService.getRetro(teamId, retroId)).rejects.toThrow();
        });
    });

    describe('createRetro', () => {
        it('should create a new retro', async () => {
            const retroTemplateId = 'template-123';
            const mockResponse = { id: 'new-retro-id' };

            mock.onPost(`${baseUrl}/teams/${teamId}/retros`, { retroTemplateId })
                .reply(201, mockResponse);

            const result = await RetroService.createRetro(teamId, retroTemplateId);
            expect(result.data).toEqual(mockResponse);
        });

        it('should handle errors when creating a retro', async () => {
            const retroTemplateId = 'invalid-template';
            mock.onPost(`${baseUrl}/teams/${teamId}/retros`).reply(400);

            await expect(RetroService.createRetro(teamId, retroTemplateId)).rejects.toThrow();
        });
    });

    describe('createThought', () => {
        it('should create a new thought', async () => {
            const message = 'Test thought';
            const columnId = 1;
            const mockResponse = { id: 'new-thought-id' };

            mock.onPost(`${baseUrl}/teams/${teamId}/thoughts`, { message, columnId })
                .reply(201, mockResponse);

            const result = await RetroService.createThought(teamId, message, columnId);
            expect(result.data).toEqual(mockResponse);
        });

        it('should handle errors when creating a thought', async () => {
            mock.onPost(`${baseUrl}/teams/${teamId}/thoughts`).reply(400);

            await expect(RetroService.createThought(teamId, '', 1)).rejects.toThrow();
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
                    createdAt: testDate.toISOString()
                }
            ];

            const expectedThoughts: Thought[] = [
                {
                    ...mockThoughtResponse[0],
                    createdAt: testDate
                }
            ];

            mock.onGet(`${baseUrl}/team/${teamId}/thoughts`).reply(200, mockThoughtResponse);

            const result = await RetroService.getThoughts(teamId);
            expect(result).toEqual(expectedThoughts);
        });

        it('should handle errors when fetching thoughts', async () => {
            mock.onGet(`${baseUrl}/team/${teamId}/thoughts`).reply(500);

            await expect(RetroService.getThoughts(teamId)).rejects.toThrow();
        });
    });

    describe('getColumns', () => {
        it('should fetch columns for a team', async () => {
            const mockColumns: Column[] = [
                {
                    id: 1,
                    topic: 'Sprint Review',
                    title: 'What went well',
                    teamId
                }
            ];

            mock.onGet(`${baseUrl}/team/${teamId}/columns`).reply(200, mockColumns);

            const result = await RetroService.getColumns(teamId);
            expect(result).toEqual(mockColumns);
        });

        it('should handle errors when fetching columns', async () => {
            mock.onGet(`${baseUrl}/team/${teamId}/columns`).reply(500);

            await expect(RetroService.getColumns(teamId)).rejects.toThrow();
        });
    });
}); 