const SHARE_TOKEN_KEY = 'share_token';

export function setShareToken(token: string) {
    sessionStorage.setItem(SHARE_TOKEN_KEY, token);
}

export function getShareToken(): string | null {
    return sessionStorage.getItem(SHARE_TOKEN_KEY);
}

export function clearShareToken() {
    sessionStorage.removeItem(SHARE_TOKEN_KEY);
}

export function isAnonymousMode(): boolean {
    return getShareToken() !== null;
}
