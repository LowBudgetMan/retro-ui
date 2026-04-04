import {vi} from 'vitest';
import { fetchClient } from '../../config/FetchClient';
import {Retro, RetroListItem, RetroService, Thought} from './RetroService.ts';
import {DateTime} from 'luxon';

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

describe('RetroService', () => {
    const teamId = 'team-123';
    const retroId = 'retro-123';
    const testDate = DateTime.fromISO('2024-01-01T00:00:00.000Z');

    beforeEach(() => {
        vi.clearAllMocks();
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

            vi.mocked(fetchClient.get).mockResolvedValue({data: mockRetroResponse, status: 200, headers: new Headers()});

            const result = await RetroService.getRetrosForTeam(teamId);
            expect(fetchClient.get).toHaveBeenCalledWith(
                `http://localhost:8080/api/teams/${teamId}/retros`
            );
            expect(result).toEqual(expectedRetros);
        });

        it('should handle errors when fetching retros', async () => {
            vi.mocked(fetchClient.get).mockRejectedValue(new Error('Request failed'));

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

            vi.mocked(fetchClient.get).mockResolvedValue({data: mockRetroResponse, status: 200, headers: new Headers()});

            const result = await RetroService.getRetro(teamId, retroId);
            expect(fetchClient.get).toHaveBeenCalledWith(
                `http://localhost:8080/api/teams/${teamId}/retros/${retroId}`
            );
            expect(result).toEqual(expectedRetro);
        });

        it('should handle errors when fetching a specific retro', async () => {
            vi.mocked(fetchClient.get).mockRejectedValue(new Error('Request failed'));

            await expect(RetroService.getRetro(teamId, retroId)).rejects.toThrow();
        });
    });

    describe('createRetro', () => {
        it('should create a new retro', async () => {
            const retroTemplateId = 'template-123';
            const mockResponse = {id: 'new-retro-id'};

            vi.mocked(fetchClient.post).mockResolvedValue({data: mockResponse, status: 201, headers: new Headers()});

            const result = await RetroService.createRetro(teamId, retroTemplateId);
            expect(result.data).toEqual(mockResponse);
            expect(fetchClient.post).toHaveBeenCalledWith(
                `http://localhost:8080/api/teams/${teamId}/retros`,
                {retroTemplateId}
            );
        });

        it('should handle errors when creating a retro', async () => {
            vi.mocked(fetchClient.post).mockRejectedValue(new Error('Request failed'));

            await expect(RetroService.createRetro(teamId, 'invalid-template')).rejects.toThrow();
        });
    });

    describe('setFinished', () => {
        it('should update the finished state of a retro', async () => {
            vi.mocked(fetchClient.put).mockResolvedValue({data: null, status: 204, headers: new Headers()});

            const result = await RetroService.setFinished(teamId, retroId, true);
            expect(result.status).toEqual(204);
            expect(fetchClient.put).toHaveBeenCalledWith(
                `http://localhost:8080/api/teams/${teamId}/retros/${retroId}/finished`,
                {finished: true}
            );
        });

        it('should handle errors when updating the finished state of a retro', async () => {
            vi.mocked(fetchClient.put).mockRejectedValue(new Error('Request failed'));

            await expect(RetroService.setFinished(teamId, retroId, true)).rejects.toThrow();
        });
    });

    describe('createThought', () => {
        it('should create a new thought', async () => {
            const message = 'Test thought';
            const category = 'happy';
            const mockResponse = {id: 'new-thought-id'};

            vi.mocked(fetchClient.post).mockResolvedValue({data: mockResponse, status: 201, headers: new Headers()});

            const result = await RetroService.createThought(teamId, retroId, message, category);
            expect(result.data).toEqual(mockResponse);
            expect(fetchClient.post).toHaveBeenCalledWith(
                `http://localhost:8080/api/teams/${teamId}/retros/${retroId}/thoughts`,
                {message, category}
            );
        });

        it('should handle errors when creating a thought', async () => {
            vi.mocked(fetchClient.post).mockRejectedValue(new Error('Request failed'));

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

            vi.mocked(fetchClient.get).mockResolvedValue({data: mockThoughtResponse, status: 200, headers: new Headers()});

            const result = await RetroService.getThoughts(teamId, retroId);
            expect(fetchClient.get).toHaveBeenCalledWith(
                `http://localhost:8080/api/teams/${teamId}/retros/${retroId}/thoughts`
            );
            expect(result).toEqual(expectedThoughts);
        });

        it('should handle errors when fetching thoughts', async () => {
            vi.mocked(fetchClient.get).mockRejectedValue(new Error('Request failed'));

            await expect(RetroService.getThoughts(teamId, retroId.toString())).rejects.toThrow();
        });
    });
});
