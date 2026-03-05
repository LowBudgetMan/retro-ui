const SHARE_TOKEN_PREFIX = 'share_token:';

export function setShareToken(retroId: string, token: string) {
    sessionStorage.setItem(SHARE_TOKEN_PREFIX + retroId, token);
}

export function getShareToken(retroId: string): string | null {
    return sessionStorage.getItem(SHARE_TOKEN_PREFIX + retroId);
}

export function clearShareToken(retroId: string) {
    sessionStorage.removeItem(SHARE_TOKEN_PREFIX + retroId);
}

export function hasShareToken(retroId: string): boolean {
    return getShareToken(retroId) !== null;
}

export function getShareTokenForUrl(url: string | undefined): string | null {
    if (!url) return null;
    const match = url.match(/\/retros\/([^/?#]+)/);
    if (!match) return null;
    return getShareToken(match[1]);
}

export function hasAnyShareTokens(): boolean {
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith(SHARE_TOKEN_PREFIX)) {
            return true;
        }
    }
    return false;
}
