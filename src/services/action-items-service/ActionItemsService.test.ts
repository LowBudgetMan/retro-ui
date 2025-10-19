import '@jest/globals';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { ActionItemsService } from './ActionItemsService';
import { DateTime } from 'luxon';
import {ApiConfig} from '../../config/ApiConfig.ts';

const mock = new MockAdapter(axios);

jest.mock('../../config/ApiConfig.ts', () => ({
    ApiConfig: {
        baseApiUrl: () => 'http://localhost:8080',
        websocketUrl: () => 'ws://localhost:8080/websocket/websocket'
    }
}));

describe('ActionItemsService', () => {
    const teamId = 'team-123';

    beforeEach(() => {
        mock.reset();
    });

    describe('getActionItems', () => {
        it('should fetch and transform action items from the API', async () => {
            const mockActionItems = [
                { id: '1', teamId, action: 'Action 1', assignee: 'User 1', completed: false, createdAt: '2023-01-01T00:00:00.000Z' },
                { id: '2', teamId, action: 'Action 2', assignee: 'User 2', completed: true, createdAt: '2023-01-02T00:00:00.000Z' },
            ];

            mock.onGet(`${ApiConfig.baseApiUrl()}/api/teams/${teamId}/action-items`).reply(200, mockActionItems);

            const actionItems = await ActionItemsService.getActionItems(teamId);

            expect(actionItems).toHaveLength(2);
            expect(actionItems[0].action).toBe('Action 1');
            expect(actionItems[0].createdAt).toEqual(DateTime.fromISO('2023-01-01T00:00:00.000Z'));
            expect(actionItems[1].action).toBe('Action 2');
            expect(actionItems[1].createdAt).toEqual(DateTime.fromISO('2023-01-02T00:00:00.000Z'));
        });

        it('should throw an error if the API call fails', async () => {
            mock.onGet(`${ApiConfig.baseApiUrl()}/api/teams/${teamId}/action-items`).reply(500);

            await expect(ActionItemsService.getActionItems(teamId)).rejects.toThrow();
        });
    });

    describe('setCompleted', () => {
        const actionItemId = 'action-item-123';

        it('should set completed as passed value', async () => {
            const completed = true;

            mock.onPut(`${ApiConfig.baseApiUrl()}/api/teams/${teamId}/action-items/${actionItemId}/completed`, {
                completed
            }).reply(204);

            const actual = await ActionItemsService.setCompleted(teamId, actionItemId, completed);
            expect(actual.status).toBe(204);
        });

        it('should throw when status is not 204', async () => {
            mock.onPut(`${ApiConfig.baseApiUrl()}/api/teams/${teamId}/action-items/${actionItemId}/completed`).reply(500);
            await expect(ActionItemsService.setCompleted(teamId, actionItemId, true)).rejects.toThrow();
        });
    });

    describe('createActionItem', () => {
        const action = 'New Action Item';
        const assignee = 'User 3';

        it('should post to the correct endpoint with the correct payload', async () => {
            mock.onPost(`${ApiConfig.baseApiUrl()}/api/teams/${teamId}/action-items`, {
                action,
                assignee
            }).reply(201);

            const result = await ActionItemsService.createActionItem(teamId, action, assignee);
            expect(result.status).toBe(201);
        });

        it('should throw an error if the API call fails', async () => {
            mock.onPost(`${ApiConfig.baseApiUrl()}/api/teams/${teamId}/action-items`).reply(500);

            await expect(ActionItemsService.createActionItem(teamId, action, assignee)).rejects.toThrow();
        });
    });

    describe('deleteActionItem', () => {
        const actionItemId = 'action-item-456';

        it('should send a delete request to the correct endpoint', async () => {
            mock.onDelete(`${ApiConfig.baseApiUrl()}/api/teams/${teamId}/action-items/${actionItemId}`).reply(204);

            const result = await ActionItemsService.deleteActionItem(teamId, actionItemId);
            expect(result.status).toBe(204);
        });

        it('should throw an error if the API call fails', async () => {
            mock.onDelete(`${ApiConfig.baseApiUrl()}/api/teams/${teamId}/action-items/${actionItemId}`).reply(500);

            await expect(ActionItemsService.deleteActionItem(teamId, actionItemId)).rejects.toThrow();
        });
    });

    describe('setAction', () => {
        const actionItemId = 'action-item-789';
        const action = 'Updated Action';

        it('should send a put request to the correct endpoint with the correct payload', async () => {
            mock.onPut(`${ApiConfig.baseApiUrl()}/api/teams/${teamId}/action-items/${actionItemId}/action`, {
                action
            }).reply(204);

            const result = await ActionItemsService.setAction(teamId, actionItemId, action);
            expect(result.status).toBe(204);
        });

        it('should throw an error if the API call fails', async () => {
            mock.onPut(`${ApiConfig.baseApiUrl()}/api/teams/${teamId}/action-items/${actionItemId}/action`).reply(500);

            await expect(ActionItemsService.setAction(teamId, actionItemId, action)).rejects.toThrow();
        });
    });

    describe('setAssignee', () => {
        const actionItemId = 'action-item-789';
        const assignee = 'New Assignee';

        it('should send a put request to the correct endpoint with the correct payload', async () => {
            mock.onPut(`${ApiConfig.baseApiUrl()}/api/teams/${teamId}/action-items/${actionItemId}/assignee`, {
                assignee
            }).reply(204);

            const result = await ActionItemsService.setAssignee(teamId, actionItemId, assignee);
            expect(result.status).toBe(204);
        });

        it('should throw an error if the API call fails', async () => {
            mock.onPut(`${ApiConfig.baseApiUrl()}/api/teams/${teamId}/action-items/${actionItemId}/action`).reply(500);

            await expect(ActionItemsService.setAssignee(teamId, actionItemId, assignee)).rejects.toThrow();
        });
    });
});
