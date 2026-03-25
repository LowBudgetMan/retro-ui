import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from './useIsMobile';

describe('useIsMobile', () => {
    let listeners: Record<string, () => void>;

    beforeEach(() => {
        listeners = {};
        window.matchMedia = vi.fn().mockImplementation((query: string) => ({
            matches: query === '(max-width: 767px)' && window.innerWidth < 768,
            media: query,
            addEventListener: (_event: string, handler: () => void) => {
                listeners['change'] = handler;
            },
            removeEventListener: vi.fn(),
        }));
    });

    it('returns true when viewport is below 768px', () => {
        Object.defineProperty(window, 'innerWidth', { value: 500, writable: true });
        window.matchMedia = vi.fn().mockImplementation((query: string) => ({
            matches: true,
            media: query,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        }));

        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(true);
    });

    it('returns false when viewport is at or above 768px', () => {
        Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
        window.matchMedia = vi.fn().mockImplementation((query: string) => ({
            matches: false,
            media: query,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        }));

        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(false);
    });

    it('updates when media query changes', () => {
        let changeHandler: (() => void) | null = null;
        const mockMediaQueryList = {
            matches: false,
            media: '(max-width: 767px)',
            addEventListener: (_event: string, handler: () => void) => {
                changeHandler = handler;
            },
            removeEventListener: vi.fn(),
        };
        window.matchMedia = vi.fn().mockReturnValue(mockMediaQueryList);

        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(false);

        act(() => {
            mockMediaQueryList.matches = true;
            changeHandler!();
        });

        expect(result.current).toBe(true);
    });

    it('cleans up event listener on unmount', () => {
        const removeEventListener = vi.fn();
        window.matchMedia = vi.fn().mockReturnValue({
            matches: false,
            media: '(max-width: 767px)',
            addEventListener: vi.fn(),
            removeEventListener,
        });

        const { unmount } = renderHook(() => useIsMobile());
        unmount();

        expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });
});
