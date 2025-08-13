import '@jest/globals';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { ActionItemsService } from './ActionItemsService';

const mock = new MockAdapter(axios);

describe('ActionItemsService', () => {
    const baseUrl = 'http://localhost:8080/api';
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

            mock.onGet(`${baseUrl}/teams/${teamId}/action-items`).reply(200, mockActionItems);

            const actionItems = await ActionItemsService.getActionItems(teamId);

            expect(actionItems).toHaveLength(2);
            expect(actionItems[0].action).toBe('Action 1');
            expect(actionItems[0].createdAt).toEqual(new Date('2023-01-01T00:00:00.000Z'));
            expect(actionItems[1].action).toBe('Action 2');
            expect(actionItems[1].createdAt).toEqual(new Date('2023-01-02T00:00:00.000Z'));
        });

        it('should throw an error if the API call fails', async () => {
            mock.onGet(`${baseUrl}/teams/${teamId}/action-items`).reply(500);

            await expect(ActionItemsService.getActionItems(teamId)).rejects.toThrow();
        });
    });
});
