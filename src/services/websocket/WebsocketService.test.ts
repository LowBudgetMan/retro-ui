import {describe, it, expect, vi, beforeEach} from 'vitest';
import {notifyToast} from '../../context/toast/toastBus.ts';
import {ToastType} from '../../context/toast/ToastContextTypes.ts';

vi.mock('../../context/toast/toastBus.ts', () => ({
    notifyToast: vi.fn(),
}));

const mockStompUnsubscribe = vi.fn();
const mockSubscribe = vi.fn().mockReturnValue({unsubscribe: mockStompUnsubscribe});
const mockActivate = vi.fn();
const mockDeactivate = vi.fn().mockResolvedValue(undefined);

let mockOnConnect: (() => void) | undefined = undefined;
let mockConnected = false;
let mockActive = false;

vi.mock('@stomp/stompjs', () => ({
    Client: vi.fn().mockImplementation(function () {
        mockActive = true;
        return {
            get connected() { return mockConnected; },
            get active() { return mockActive; },
            set onConnect(fn: (() => void) | undefined) { mockOnConnect = fn; },
            get onConnect(): (() => void) | undefined { return mockOnConnect; },
            subscribe: mockSubscribe,
            activate: mockActivate,
            deactivate: mockDeactivate,
        };
    }),
}));

vi.mock('./WebsocketConfig.ts', () => ({
    getConfig: vi.fn().mockResolvedValue({brokerURL: 'ws://localhost:8080/ws'}),
}));

async function flushPromises() {
    await new Promise(resolve => setTimeout(resolve, 0));
}

function simulateConnect() {
    mockConnected = true;
    mockOnConnect?.();
}

describe('WebsocketService', () => {
    beforeEach(async () => {
        mockConnected = false;
        mockActive = false;
        mockOnConnect = undefined;
        mockSubscribe.mockClear();
        mockSubscribe.mockReturnValue({unsubscribe: mockStompUnsubscribe});
        mockStompUnsubscribe.mockClear();
        mockActivate.mockClear();
        mockDeactivate.mockClear();
        vi.mocked(notifyToast).mockClear();
        vi.mocked((await import('@stomp/stompjs')).Client).mockClear();
        const {getConfig} = await import('./WebsocketConfig.ts');
        vi.mocked(getConfig).mockReset().mockResolvedValue({brokerURL: 'ws://localhost:8080/ws'});
        vi.resetModules();
    });

    async function getService() {
        const mod = await import('./WebsocketService.ts');
        return mod.WebsocketService;
    }

    it('subscribe returns an unsubscribe function', async () => {
        const service = await getService();
        const unsub = service.subscribe('/topic/test', {
            SOME_EVENT: vi.fn(),
        });
        expect(typeof unsub).toBe('function');
    });

    it('multiple subscribers to same destination create only one STOMP subscription', async () => {
        const service = await getService();
        service.subscribe('/topic/test', {EVENT_A: vi.fn()});
        service.subscribe('/topic/test', {EVENT_B: vi.fn()});

        await flushPromises();
        simulateConnect();

        expect(mockSubscribe).toHaveBeenCalledTimes(1);
        expect(mockSubscribe).toHaveBeenCalledWith(
            '/topic/test',
            expect.any(Function),
        );
    });

    it('last unsubscribe removes the STOMP subscription', async () => {
        const stompUnsub = vi.fn();
        mockSubscribe.mockReturnValueOnce({unsubscribe: stompUnsub});

        const service = await getService();
        const unsub1 = service.subscribe('/topic/test', {EVENT_A: vi.fn()});
        const unsub2 = service.subscribe('/topic/test', {EVENT_B: vi.fn()});

        await flushPromises();
        simulateConnect();

        unsub1();
        expect(stompUnsub).not.toHaveBeenCalled();

        unsub2();
        expect(stompUnsub).toHaveBeenCalledTimes(1);
    });

    it('fan-out: message dispatches to all handler maps for a destination', async () => {
        const service = await getService();
        const handler1 = vi.fn();
        const handler2 = vi.fn();

        service.subscribe('/topic/test', {MY_EVENT: handler1});
        service.subscribe('/topic/test', {MY_EVENT: handler2});

        await flushPromises();
        simulateConnect();

        const messageCallback = mockSubscribe.mock.calls[0][1];
        messageCallback({body: JSON.stringify({eventType: 'MY_EVENT', payload: {data: 42}})});

        expect(handler1).toHaveBeenCalledWith({data: 42});
        expect(handler2).toHaveBeenCalledWith({data: 42});
    });

    it('transform function is applied before handlers', async () => {
        const service = await getService();
        const handler = vi.fn();

        service.subscribe('/topic/test', {
            transform: (raw: unknown) => (raw as { value: number }).value * 2,
            MY_EVENT: handler,
        });

        await flushPromises();
        simulateConnect();

        const messageCallback = mockSubscribe.mock.calls[0][1];
        messageCallback({body: JSON.stringify({eventType: 'MY_EVENT', payload: {value: 5}})});

        expect(handler).toHaveBeenCalledWith(10);
    });

    it('handlers only fire for matching eventType', async () => {
        const service = await getService();
        const handlerA = vi.fn();
        const handlerB = vi.fn();

        service.subscribe('/topic/test', {
            EVENT_A: handlerA,
            EVENT_B: handlerB,
        });

        await flushPromises();
        simulateConnect();

        const messageCallback = mockSubscribe.mock.calls[0][1];
        messageCallback({body: JSON.stringify({eventType: 'EVENT_A', payload: 'hello'})});

        expect(handlerA).toHaveBeenCalledWith('hello');
        expect(handlerB).not.toHaveBeenCalled();
    });

    it('auto-connect on first subscribe', async () => {
        const {Client} = await import('@stomp/stompjs');
        const service = await getService();

        service.subscribe('/topic/test', {EVENT: vi.fn()});
        await flushPromises();

        expect(Client).toHaveBeenCalledTimes(1);
        expect(mockActivate).toHaveBeenCalledTimes(1);
    });

    it('multiple synchronous subscribes before connect create only one Client', async () => {
        const {Client} = await import('@stomp/stompjs');
        const service = await getService();

        service.subscribe('/topic/a', {EVENT: vi.fn()});
        service.subscribe('/topic/b', {EVENT: vi.fn()});
        service.subscribe('/topic/c', {EVENT: vi.fn()});
        await flushPromises();

        expect(Client).toHaveBeenCalledTimes(1);
        expect(mockActivate).toHaveBeenCalledTimes(1);
    });

    it('subscribe-unsubscribe-subscribe before connect creates only one Client (StrictMode safety)', async () => {
        const {Client} = await import('@stomp/stompjs');
        const service = await getService();

        const unsub = service.subscribe('/topic/test', {EVENT: vi.fn()});
        unsub();
        service.subscribe('/topic/test', {EVENT: vi.fn()});
        await flushPromises();

        expect(Client).toHaveBeenCalledTimes(1);
        expect(mockActivate).toHaveBeenCalledTimes(1);
    });

    it('auto-disconnect when last subscription removed', async () => {
        const service = await getService();

        const unsub1 = service.subscribe('/topic/a', {EVENT: vi.fn()});
        const unsub2 = service.subscribe('/topic/b', {EVENT: vi.fn()});

        await flushPromises();
        simulateConnect();

        unsub1();
        expect(mockDeactivate).not.toHaveBeenCalled();

        unsub2();
        expect(mockDeactivate).toHaveBeenCalledTimes(1);
    });

    it('queued subscriptions are created on connect', async () => {
        const service = await getService();

        service.subscribe('/topic/a', {EVENT: vi.fn()});
        service.subscribe('/topic/b', {EVENT: vi.fn()});

        await flushPromises();

        expect(mockSubscribe).not.toHaveBeenCalled();

        simulateConnect();

        expect(mockSubscribe).toHaveBeenCalledTimes(2);
        expect(mockSubscribe).toHaveBeenCalledWith('/topic/a', expect.any(Function));
        expect(mockSubscribe).toHaveBeenCalledWith('/topic/b', expect.any(Function));
    });

    it('calls onReconnect callback on subsequent connections, not the first', async () => {
        const service = await getService();
        const onReconnect = vi.fn();

        service.subscribe('/topic/test', {EVENT: vi.fn()}, {onReconnect});

        await flushPromises();
        simulateConnect(); // first connect

        expect(onReconnect).not.toHaveBeenCalled();

        // Simulate reconnection
        simulateConnect();

        expect(onReconnect).toHaveBeenCalledTimes(1);
    });

    it('cleans up onReconnect callback on unsubscribe', async () => {
        const service = await getService();
        const onReconnect = vi.fn();

        const unsub = service.subscribe('/topic/test', {EVENT: vi.fn()}, {onReconnect});

        await flushPromises();
        simulateConnect(); // first connect

        unsub();

        // Simulate reconnection after unsubscribe
        simulateConnect();

        expect(onReconnect).not.toHaveBeenCalled();
    });

    describe('Connection Failure Toast', () => {
        it('should emit a warning toast when the connection fails', async () => {
            const {getConfig} = await import('./WebsocketConfig.ts');
            vi.mocked(getConfig).mockRejectedValueOnce(new Error('boom'));

            const service = await getService();
            service.subscribe('/topic/test', {EVENT: vi.fn()});
            await flushPromises();

            expect(notifyToast).toHaveBeenCalledTimes(1);
            expect(notifyToast).toHaveBeenCalledWith(expect.objectContaining({type: ToastType.WARNING}));
        });

        it('should not notify again on further failed retries before a successful connect', async () => {
            const {getConfig} = await import('./WebsocketConfig.ts');
            vi.mocked(getConfig)
                .mockRejectedValueOnce(new Error('boom'))
                .mockRejectedValueOnce(new Error('boom again'))
                .mockRejectedValueOnce(new Error('boom the third'));

            const service = await getService();
            service.subscribe('/topic/a', {EVENT: vi.fn()});
            await flushPromises();
            service.subscribe('/topic/b', {EVENT: vi.fn()});
            await flushPromises();
            service.subscribe('/topic/c', {EVENT: vi.fn()});
            await flushPromises();

            expect(notifyToast).toHaveBeenCalledTimes(1);
        });

        it('should not emit a toast on a normal first-time successful connect', async () => {
            const service = await getService();
            service.subscribe('/topic/test', {EVENT: vi.fn()});
            await flushPromises();
            simulateConnect();

            expect(notifyToast).not.toHaveBeenCalled();
        });

        it('should emit a success toast when the connection recovers after a prior failure', async () => {
            const {getConfig} = await import('./WebsocketConfig.ts');
            vi.mocked(getConfig).mockRejectedValueOnce(new Error('boom'));

            const service = await getService();
            service.subscribe('/topic/test', {EVENT: vi.fn()});
            await flushPromises();

            expect(notifyToast).toHaveBeenNthCalledWith(1, expect.objectContaining({type: ToastType.WARNING}));

            service.subscribe('/topic/other', {EVENT: vi.fn()});
            await flushPromises();
            simulateConnect();

            expect(notifyToast).toHaveBeenCalledTimes(2);
            expect(notifyToast).toHaveBeenNthCalledWith(2, {message: 'Live updates restored', type: ToastType.SUCCESS});
        });

        it('should not emit a success toast on a reconnect that was not preceded by a failure', async () => {
            const service = await getService();
            service.subscribe('/topic/test', {EVENT: vi.fn()}, {onReconnect: vi.fn()});
            await flushPromises();
            simulateConnect(); // clean connect

            simulateConnect(); // simulated reconnect, still no prior failure

            expect(notifyToast).not.toHaveBeenCalled();
        });
    });
});
