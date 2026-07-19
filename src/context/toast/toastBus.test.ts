import {vi, describe, it, expect, beforeEach} from 'vitest';
import {notifyToast, registerToastHandler, unregisterToastHandler} from './toastBus.ts';
import {ToastType} from './ToastContextTypes.ts';

describe('toastBus', () => {
    beforeEach(() => {
        unregisterToastHandler();
    });

    it('should be a no-op when notifyToast is called before any handler is registered', () => {
        expect(() => {
            notifyToast({message: 'ignored', type: ToastType.INFO});
        }).not.toThrow();
    });

    it('should forward a toast to the registered handler', () => {
        const handler = vi.fn();
        registerToastHandler(handler);

        notifyToast({message: 'hello', type: ToastType.FAILURE});

        expect(handler).toHaveBeenCalledWith({message: 'hello', type: ToastType.FAILURE});
    });

    it('should stop forwarding toasts once unregistered', () => {
        const handler = vi.fn();
        registerToastHandler(handler);
        unregisterToastHandler();

        notifyToast({message: 'ignored', type: ToastType.INFO});

        expect(handler).not.toHaveBeenCalled();
    });

    it('should only forward to the most recently registered handler', () => {
        const first = vi.fn();
        const second = vi.fn();
        registerToastHandler(first);
        registerToastHandler(second);

        notifyToast({message: 'hello', type: ToastType.SUCCESS});

        expect(first).not.toHaveBeenCalled();
        expect(second).toHaveBeenCalledWith({message: 'hello', type: ToastType.SUCCESS});
    });
});