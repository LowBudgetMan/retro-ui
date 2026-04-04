import { vi } from 'vitest';
import { fetchClient } from '../../config/FetchClient';
import { ActionItemsService } from './ActionItemsService';
import { DateTime } from 'luxon';

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

describe('ActionItemsService', () => {
    const teamId = 'team-123';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getActionItems', () => {
        it('should fetch and transform action items from the API', async () => {
            const mockActionItems = [
                { id: '1', teamId, action: 'Action 1', assignee: 'User 1', completed: false, createdAt: '2023-01-01T00:00:00.000Z' },
                { id: '2', teamId, action: 'Action 2', assignee: 'User 2', completed: true, createdAt: '2023-01-02T00:00:00.000Z' },
            ];

            vi.mocked(fetchClient.get).mockResolvedValue({data: mockActionItems, status: 200, headers: new Headers()});

            const actionItems = await ActionItemsService.getActionItems(teamId);

            expect(fetchClient.get).toHaveBeenCalledWith(
                `http://localhost:8080/api/teams/${teamId}/action-items`
            );
            expect(actionItems).toHaveLength(2);
            expect(actionItems[0].action).toBe('Action 1');
            expect(actionItems[0].createdAt).toEqual(DateTime.fromISO('2023-01-01T00:00:00.000Z'));
            expect(actionItems[1].action).toBe('Action 2');
            expect(actionItems[1].createdAt).toEqual(DateTime.fromISO('2023-01-02T00:00:00.000Z'));
        });

        it('should throw an error if the API call fails', async () => {
            vi.mocked(fetchClient.get).mockRejectedValue(new Error('Request failed'));

            await expect(ActionItemsService.getActionItems(teamId)).rejects.toThrow();
        });
    });

    describe('setCompleted', () => {
        const actionItemId = 'action-item-123';

        it('should set completed as passed value', async () => {
            const completed = true;

            vi.mocked(fetchClient.put).mockResolvedValue({data: null, status: 204, headers: new Headers()});

            const actual = await ActionItemsService.setCompleted(teamId, actionItemId, completed);
            expect(actual.status).toBe(204);
            expect(fetchClient.put).toHaveBeenCalledWith(
                `http://localhost:8080/api/teams/${teamId}/action-items/${actionItemId}/completed`,
                {completed}
            );
        });

        it('should throw when status is not 204', async () => {
            vi.mocked(fetchClient.put).mockRejectedValue(new Error('Request failed'));
            await expect(ActionItemsService.setCompleted(teamId, actionItemId, true)).rejects.toThrow();
        });
    });

    describe('createActionItem', () => {
        const action = 'New Action Item';
        const assignee = 'User 3';

        it('should post to the correct endpoint with the correct payload', async () => {
            vi.mocked(fetchClient.post).mockResolvedValue({data: null, status: 201, headers: new Headers()});

            const result = await ActionItemsService.createActionItem(teamId, action, assignee);
            expect(result.status).toBe(201);
            expect(fetchClient.post).toHaveBeenCalledWith(
                `http://localhost:8080/api/teams/${teamId}/action-items`,
                {action, assignee}
            );
        });

        it('should throw an error if the API call fails', async () => {
            vi.mocked(fetchClient.post).mockRejectedValue(new Error('Request failed'));

            await expect(ActionItemsService.createActionItem(teamId, action, assignee)).rejects.toThrow();
        });
    });

    describe('deleteActionItem', () => {
        const actionItemId = 'action-item-456';

        it('should send a delete request to the correct endpoint', async () => {
            vi.mocked(fetchClient.delete).mockResolvedValue({data: null, status: 204, headers: new Headers()});

            const result = await ActionItemsService.deleteActionItem(teamId, actionItemId);
            expect(result.status).toBe(204);
            expect(fetchClient.delete).toHaveBeenCalledWith(
                `http://localhost:8080/api/teams/${teamId}/action-items/${actionItemId}`
            );
        });

        it('should throw an error if the API call fails', async () => {
            vi.mocked(fetchClient.delete).mockRejectedValue(new Error('Request failed'));

            await expect(ActionItemsService.deleteActionItem(teamId, actionItemId)).rejects.toThrow();
        });
    });

    describe('setAction', () => {
        const actionItemId = 'action-item-789';
        const action = 'Updated Action';

        it('should send a put request to the correct endpoint with the correct payload', async () => {
            vi.mocked(fetchClient.put).mockResolvedValue({data: null, status: 204, headers: new Headers()});

            const result = await ActionItemsService.setAction(teamId, actionItemId, action);
            expect(result.status).toBe(204);
            expect(fetchClient.put).toHaveBeenCalledWith(
                `http://localhost:8080/api/teams/${teamId}/action-items/${actionItemId}/action`,
                {action}
            );
        });

        it('should throw an error if the API call fails', async () => {
            vi.mocked(fetchClient.put).mockRejectedValue(new Error('Request failed'));

            await expect(ActionItemsService.setAction(teamId, actionItemId, action)).rejects.toThrow();
        });
    });

    describe('setAssignee', () => {
        const actionItemId = 'action-item-789';
        const assignee = 'New Assignee';

        it('should send a put request to the correct endpoint with the correct payload', async () => {
            vi.mocked(fetchClient.put).mockResolvedValue({data: null, status: 204, headers: new Headers()});

            const result = await ActionItemsService.setAssignee(teamId, actionItemId, assignee);
            expect(result.status).toBe(204);
            expect(fetchClient.put).toHaveBeenCalledWith(
                `http://localhost:8080/api/teams/${teamId}/action-items/${actionItemId}/assignee`,
                {assignee}
            );
        });

        it('should throw an error if the API call fails', async () => {
            vi.mocked(fetchClient.put).mockRejectedValue(new Error('Request failed'));

            await expect(ActionItemsService.setAssignee(teamId, actionItemId, assignee)).rejects.toThrow();
        });
    });
});
