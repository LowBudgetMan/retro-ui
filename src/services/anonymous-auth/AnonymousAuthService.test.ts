import {describe, it, expect, beforeEach} from 'vitest';
import {setShareToken, getShareToken, clearShareToken, isAnonymousMode} from './AnonymousAuthService';

describe('AnonymousAuthService', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    describe('setShareToken', () => {
        it('should store the token in sessionStorage', () => {
            setShareToken('test-token');
            expect(sessionStorage.getItem('share_token')).toBe('test-token');
        });
    });

    describe('getShareToken', () => {
        it('should return the token from sessionStorage', () => {
            sessionStorage.setItem('share_token', 'my-token');
            expect(getShareToken()).toBe('my-token');
        });

        it('should return null when no token is stored', () => {
            expect(getShareToken()).toBeNull();
        });
    });

    describe('clearShareToken', () => {
        it('should remove the token from sessionStorage', () => {
            sessionStorage.setItem('share_token', 'my-token');
            clearShareToken();
            expect(sessionStorage.getItem('share_token')).toBeNull();
        });
    });

    describe('isAnonymousMode', () => {
        it('should return true when a share token is stored', () => {
            sessionStorage.setItem('share_token', 'my-token');
            expect(isAnonymousMode()).toBe(true);
        });

        it('should return false when no share token is stored', () => {
            expect(isAnonymousMode()).toBe(false);
        });
    });
});
