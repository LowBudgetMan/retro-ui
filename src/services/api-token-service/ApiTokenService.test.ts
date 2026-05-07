import {beforeEach, describe, expect, it, vi} from 'vitest';
import {fetchClient, FetchResponse} from '../../config/FetchClient';
import {ApiTokenService} from './ApiTokenService';

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

describe('ApiTokenService', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('getTokens', () => {
        it('returns transformed list with parsed dates', async () => {
            mockSuccess('get', [{
                id: 'tok-1',
                name: 'Slack',
                tokenPrefix: 'retro_pat_abcd',
                scopes: ['read'],
                createdAt: '2026-04-27T00:00:00Z',
                expiresAt: null,
                lastUsedAt: null,
            }]);

            const result = await ApiTokenService.getTokens(teamId);

            expect(fetchClient.get).toHaveBeenCalledWith(`http://localhost:8080/api/teams/${teamId}/api-tokens`);
            expect(result[0].id).toBe('tok-1');
            expect(result[0].createdAt).toBeInstanceOf(Date);
            expect(result[0].expiresAt).toBeNull();
            expect(result[0].lastUsedAt).toBeNull();
        });

        it('parses expiresAt and lastUsedAt when present', async () => {
            mockSuccess('get', [{
                id: 'tok-1',
                name: 'Slack',
                tokenPrefix: 'retro_pat_abcd',
                scopes: ['read'],
                createdAt: '2026-04-27T00:00:00Z',
                expiresAt: '2027-04-27T00:00:00Z',
                lastUsedAt: '2026-04-28T00:00:00Z',
            }]);

            const result = await ApiTokenService.getTokens(teamId);

            expect(result[0].expiresAt).toBeInstanceOf(Date);
            expect(result[0].lastUsedAt).toBeInstanceOf(Date);
        });
    });

    describe('createToken', () => {
        it('posts and returns the response with the plaintext token', async () => {
            mockSuccess('post', {
                id: 'tok-1', name: 'Slack', scopes: ['read'], expiresAt: null,
                tokenPrefix: 'retro_pat_abcd', token: 'retro_pat_fullsecretvalue',
            }, 201);

            const result = await ApiTokenService.createToken(teamId, {name: 'Slack', scopes: ['read']});

            expect(fetchClient.post).toHaveBeenCalledWith(
                `http://localhost:8080/api/teams/${teamId}/api-tokens`,
                {name: 'Slack', scopes: ['read']}
            );
            expect(result.token).toBe('retro_pat_fullsecretvalue');
            expect(result.tokenPrefix).toBe('retro_pat_abcd');
        });
    });

    describe('deleteToken', () => {
        it('sends DELETE to the right URL', async () => {
            mockSuccess('delete', null, 204);

            await ApiTokenService.deleteToken(teamId, 'tok-1');

            expect(fetchClient.delete).toHaveBeenCalledWith(
                `http://localhost:8080/api/teams/${teamId}/api-tokens/tok-1`
            );
        });
    });
});
