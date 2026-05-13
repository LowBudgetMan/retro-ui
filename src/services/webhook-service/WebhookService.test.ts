import {beforeEach, describe, expect, it, vi} from 'vitest';
import {DateTime} from 'luxon';
import {fetchClient, FetchResponse} from '../../config/FetchClient';
import {WebhookService} from './WebhookService';

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
    }
}));

const teamId = 'team-1';

function mockSuccess<T>(method: 'get' | 'post' | 'put' | 'delete', data: T, status = 200, headers = new Headers()) {
    vi.mocked(fetchClient[method]).mockResolvedValue({data, status, headers} as FetchResponse);
}

describe('WebhookService', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('getWebhooks', () => {
        it('returns transformed list with parsed dates', async () => {
            mockSuccess('get', [{
                id: 'wh-1',
                name: 'Slack',
                url: 'https://hooks.slack.com',
                eventTypes: ['action_item.created'],
                enabled: true,
                consecutiveFailures: 0,
                lastDeliveryAt: '2026-04-27T10:00:00Z',
                lastFailureAt: null,
                lastFailureReason: null,
                createdAt: '2026-04-27T09:00:00Z',
            }]);

            const result = await WebhookService.getWebhooks(teamId);

            expect(fetchClient.get).toHaveBeenCalledWith(`http://localhost:8080/api/teams/${teamId}/webhooks`);
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Slack');
            expect(result[0].createdAt).toBeInstanceOf(DateTime);
            expect(result[0].lastDeliveryAt).toBeInstanceOf(DateTime);
            expect(result[0].lastFailureAt).toBeNull();
        });

        it('handles null dates', async () => {
            mockSuccess('get', [{
                id: 'wh-1',
                name: 'Hook',
                url: 'https://example.com',
                eventTypes: ['retro.finished'],
                enabled: true,
                consecutiveFailures: 0,
                lastDeliveryAt: null,
                lastFailureAt: null,
                lastFailureReason: null,
                createdAt: '2026-04-27T09:00:00Z',
            }]);

            const result = await WebhookService.getWebhooks(teamId);

            expect(result[0].lastDeliveryAt).toBeNull();
            expect(result[0].lastFailureAt).toBeNull();
        });
    });

    describe('createWebhook', () => {
        it('posts and returns the response with the secret', async () => {
            mockSuccess('post', {
                id: 'wh-1', name: 'Slack', url: 'https://hooks.slack.com',
                eventTypes: ['action_item.created'], enabled: true, secret: 'abc123',
            }, 201);

            const result = await WebhookService.createWebhook(teamId, {name: 'Slack', url: 'https://hooks.slack.com', eventTypes: ['action_item.created']});

            expect(fetchClient.post).toHaveBeenCalledWith(
                `http://localhost:8080/api/teams/${teamId}/webhooks`,
                {name: 'Slack', url: 'https://hooks.slack.com', eventTypes: ['action_item.created']}
            );
            expect(result.secret).toBe('abc123');
        });
    });

    describe('deleteWebhook', () => {
        it('sends DELETE to the right URL', async () => {
            mockSuccess('delete', null, 204);

            await WebhookService.deleteWebhook(teamId, 'wh-1');

            expect(fetchClient.delete).toHaveBeenCalledWith(
                `http://localhost:8080/api/teams/${teamId}/webhooks/wh-1`
            );
        });
    });
});
