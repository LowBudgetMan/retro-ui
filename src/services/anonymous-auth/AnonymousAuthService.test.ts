import {describe, it, expect, beforeEach} from 'vitest';
import {
    setShareToken,
    getShareToken,
    clearShareToken,
    hasShareToken,
    getShareTokenForUrl,
    hasAnyShareTokens,
} from './AnonymousAuthService';

describe('AnonymousAuthService', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    describe('setShareToken', () => {
        it('should store the token scoped by retro ID', () => {
            setShareToken('retro-123', 'test-token');
            expect(sessionStorage.getItem('share_token:retro-123')).toBe('test-token');
        });

        it('should store multiple tokens for different retros', () => {
            setShareToken('retro-1', 'token-1');
            setShareToken('retro-2', 'token-2');
            expect(sessionStorage.getItem('share_token:retro-1')).toBe('token-1');
            expect(sessionStorage.getItem('share_token:retro-2')).toBe('token-2');
        });
    });

    describe('getShareToken', () => {
        it('should return the token for the given retro ID', () => {
            sessionStorage.setItem('share_token:retro-123', 'my-token');
            expect(getShareToken('retro-123')).toBe('my-token');
        });

        it('should return null when no token is stored for the retro ID', () => {
            expect(getShareToken('retro-123')).toBeNull();
        });
    });

    describe('clearShareToken', () => {
        it('should remove the token for the given retro ID', () => {
            sessionStorage.setItem('share_token:retro-123', 'my-token');
            clearShareToken('retro-123');
            expect(sessionStorage.getItem('share_token:retro-123')).toBeNull();
        });

        it('should not affect tokens for other retro IDs', () => {
            sessionStorage.setItem('share_token:retro-1', 'token-1');
            sessionStorage.setItem('share_token:retro-2', 'token-2');
            clearShareToken('retro-1');
            expect(sessionStorage.getItem('share_token:retro-2')).toBe('token-2');
        });
    });

    describe('hasShareToken', () => {
        it('should return true when a share token is stored for the retro ID', () => {
            sessionStorage.setItem('share_token:retro-123', 'my-token');
            expect(hasShareToken('retro-123')).toBe(true);
        });

        it('should return false when no share token is stored for the retro ID', () => {
            expect(hasShareToken('retro-123')).toBe(false);
        });
    });

    describe('getShareTokenForUrl', () => {
        it('should extract retro ID from URL and return the token', () => {
            sessionStorage.setItem('share_token:abc-def-123', 'url-token');
            expect(getShareTokenForUrl('/teams/team-1/retros/abc-def-123')).toBe('url-token');
        });

        it('should return null when URL does not match retro pattern', () => {
            expect(getShareTokenForUrl('/teams/team-1')).toBeNull();
        });

        it('should return null when no token exists for the retro in the URL', () => {
            expect(getShareTokenForUrl('/teams/team-1/retros/no-token-retro')).toBeNull();
        });

        it('should handle URLs with query params and fragments', () => {
            sessionStorage.setItem('share_token:retro-789', 'query-token');
            expect(getShareTokenForUrl('/teams/t/retros/retro-789?foo=bar')).toBe('query-token');
        });

        it('should return null for undefined URL', () => {
            expect(getShareTokenForUrl(undefined)).toBeNull();
        });
    });

    describe('hasAnyShareTokens', () => {
        it('should return true if any share tokens exist', () => {
            sessionStorage.setItem('share_token:retro-1', 'token-1');
            expect(hasAnyShareTokens()).toBe(true);
        });

        it('should return false if no share tokens exist', () => {
            expect(hasAnyShareTokens()).toBe(false);
        });

        it('should not be fooled by non-share-token session storage items', () => {
            sessionStorage.setItem('other_key', 'value');
            expect(hasAnyShareTokens()).toBe(false);
        });
    });
});
