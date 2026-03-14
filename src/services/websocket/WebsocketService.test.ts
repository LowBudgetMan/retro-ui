import {describe, it, expect, vi, beforeEach} from 'vitest';

const mockStompUnsubscribe = vi.fn();
const mockSubscribe = vi.fn().mockReturnValue({unsubscribe: mockStompUnsubscribe});
const mockActivate = vi.fn();
const mockDeactivate = vi.fn().mockResolvedValue(undefined);

let mockOnConnect: (() => void) | null = null;
let mockConnected = false;
let mockActive = false;

vi.mock('@stomp/stompjs', () => ({
    Client: vi.fn().mockImplementation(function () {
        mockActive = true;
        return {
            get connected() { return mockConnected; },
            get active() { return mockActive; },
            set onConnect(fn: () => void) { mockOnConnect = fn; },
            get onConnect() { return mockOnConnect; },
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
        mockOnConnect = null;
        mockSubscribe.mockClear();
        mockSubscribe.mockReturnValue({unsubscribe: mockStompUnsubscribe});
        mockStompUnsubscribe.mockClear();
        mockActivate.mockClear();
        mockDeactivate.mockClear();
        vi.mocked((await import('@stomp/stompjs')).Client).mockClear();
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
});
