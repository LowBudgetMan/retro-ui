import {vi} from 'vitest';
import {act, render, screen} from '@testing-library/react';
import {useContext} from 'react';
import {ToastContext, ToastProvider} from './ToastContext.tsx';
import {Toast as ToastValue, ToastType} from './ToastContextTypes.ts';
import {useToasts} from '../hooks.tsx';
import * as toastBus from './toastBus.ts';
import {notifyToast} from './toastBus.ts';

vi.mock('./Toast.tsx', () => ({
    Toast: ({content, closeToast}: { content: ToastValue, closeToast: () => void }) => (
        <div data-testid="toast-mock">
            <span data-testid="toast-message">{content.message}</span>
            <span data-testid="toast-type">{content.type}</span>
            <button onClick={closeToast}>close-toast</button>
        </div>
    )
}));

vi.mock('./toastBus.ts', async () => {
    const actual = await vi.importActual<typeof import('./toastBus.ts')>('./toastBus.ts');
    return {
        ...actual,
        registerToastHandler: vi.fn(actual.registerToastHandler),
        unregisterToastHandler: vi.fn(actual.unregisterToastHandler),
    };
});

describe('ToastContext', () => {
    function TestHarness() {
        const {toasts, queueToast} = useToasts();
        return (
            <div>
                <button onClick={() => queueToast({message: 'first', type: ToastType.INFO})}>queue-first</button>
                <button onClick={() => queueToast({message: 'second', type: ToastType.SUCCESS})}>queue-second</button>
                <ul data-testid="toasts-list">
                    {toasts.map((t, i) => <li key={i}>{t.message}</li>)}
                </ul>
            </div>
        );
    }

    it('should provide an empty toasts array by default', () => {
        render(
            <ToastProvider>
                <TestHarness/>
            </ToastProvider>
        );

        expect(screen.getByTestId('toasts-list').children.length).toBe(0);
    });

    it('should not render the Toast component when the queue is empty', () => {
        render(
            <ToastProvider>
                <TestHarness/>
            </ToastProvider>
        );

        expect(screen.queryByTestId('toast-mock')).not.toBeInTheDocument();
    });

    it('should remove the first toast from the queue when closeToast is triggered', () => {
        render(
            <ToastProvider>
                <TestHarness/>
            </ToastProvider>
        );

        act(() => {
            screen.getByText('queue-first').click();
        });
        act(() => {
            screen.getByText('queue-second').click();
        });
        act(() => {
            screen.getByText('close-toast').click();
        });

        const items = screen.getByTestId('toasts-list').children;
        expect(items.length).toBe(1);
        expect(items[0].textContent).toBe('second');
        expect(screen.getByTestId('toast-message').textContent).toBe('second');
    });

    it('should unmount the Toast component once the last toast is closed', () => {
        render(
            <ToastProvider>
                <TestHarness/>
            </ToastProvider>
        );

        act(() => {
            screen.getByText('queue-first').click();
        });
        expect(screen.getByTestId('toast-mock')).toBeInTheDocument();

        act(() => {
            screen.getByText('close-toast').click();
        });

        expect(screen.queryByTestId('toast-mock')).not.toBeInTheDocument();
        expect(screen.getByTestId('toasts-list').children.length).toBe(0);
    });

    it('should append a toast to the queue when queueToast is called', () => {
        render(
            <ToastProvider>
                <TestHarness/>
            </ToastProvider>
        );

        act(() => {
            screen.getByText('queue-first').click();
        });

        const items = screen.getByTestId('toasts-list').children;
        expect(items.length).toBe(1);
        expect(items[0].textContent).toBe('first');
    });

    it('should append multiple toasts in insertion order', () => {
        render(
            <ToastProvider>
                <TestHarness/>
            </ToastProvider>
        );

        act(() => {
            screen.getByText('queue-first').click();
        });
        act(() => {
            screen.getByText('queue-second').click();
        });

        const items = screen.getByTestId('toasts-list').children;
        expect(items.length).toBe(2);
        expect(items[0].textContent).toBe('first');
        expect(items[1].textContent).toBe('second');
    });

    it('should render the Toast component with the first queued toast as content', () => {
        render(
            <ToastProvider>
                <TestHarness/>
            </ToastProvider>
        );

        act(() => {
            screen.getByText('queue-first').click();
        });
        act(() => {
            screen.getByText('queue-second').click();
        });

        expect(screen.getByTestId('toast-message').textContent).toBe('first');
        expect(screen.getByTestId('toast-type').textContent).toBe(ToastType.INFO);
    });

    it('should queue a toast when notifyToast is called from outside the component tree', () => {
        render(
            <ToastProvider>
                <TestHarness/>
            </ToastProvider>
        );

        act(() => {
            notifyToast({message: 'from bus', type: ToastType.WARNING});
        });

        expect(screen.getByTestId('toast-message').textContent).toBe('from bus');
        expect(screen.getByTestId('toast-type').textContent).toBe(ToastType.WARNING);
    });

    it('should register its handler with toastBus on mount and unregister it on unmount', () => {
        vi.mocked(toastBus.registerToastHandler).mockClear();
        vi.mocked(toastBus.unregisterToastHandler).mockClear();

        const {unmount} = render(
            <ToastProvider>
                <TestHarness/>
            </ToastProvider>
        );

        expect(toastBus.registerToastHandler).toHaveBeenCalledTimes(1);
        expect(toastBus.unregisterToastHandler).not.toHaveBeenCalled();

        unmount();

        expect(toastBus.unregisterToastHandler).toHaveBeenCalledTimes(1);
    });

    it('should provide a no-op context value when used outside of a ToastProvider', () => {
        function DefaultConsumer() {
            const {toasts, queueToast} = useContext(ToastContext);
            return (
                <div>
                    <span data-testid="default-count">{toasts.length}</span>
                    <button onClick={() => queueToast({message: 'ignored', type: ToastType.INFO})}>default-queue</button>
                </div>
            );
        }

        render(<DefaultConsumer/>);

        expect(screen.getByTestId('default-count').textContent).toBe('0');
        expect(() => {
            act(() => {
                screen.getByText('default-queue').click();
            });
        }).not.toThrow();
        expect(screen.getByTestId('default-count').textContent).toBe('0');
    });
});
