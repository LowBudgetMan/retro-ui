import {Client, IMessage} from '@stomp/stompjs';
import {getConfig, buildConnectHeaders} from "./WebsocketConfig.ts";

interface WebsocketEvent {
    eventType: string;
    payload: unknown;
}

type HandlerMap = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transform?: (raw: any) => any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [eventType: string]: ((payload: any) => void) | ((raw: any) => any) | undefined;
};

interface SubscribeOptions {
    retroId?: string;
    onReconnect?: () => void;
}

interface DestinationEntry {
    stompSubscription?: { unsubscribe: () => void };
    handlers: Set<HandlerMap>;
}

let client: Client | null = null;
let isConnecting = false;
let hasConnectedOnce = false;
const destinations = new Map<string, DestinationEntry>();
const reconnectCallbacks = new Set<() => void>();

function handleMessage(destination: string, message: IMessage): void {
    let event: WebsocketEvent;
    try {
        event = JSON.parse(message.body);
    } catch (error) {
        console.error('Failed to parse websocket message for', destination, error);
        return;
    }
    const entry = destinations.get(destination);
    if (!entry) return;
    entry.handlers.forEach((handlerMap) => {
        const handler = handlerMap[event.eventType];
        if (typeof handler === 'function' && event.eventType !== 'transform') {
            const payload = handlerMap.transform
                ? handlerMap.transform(event.payload)
                : event.payload;
            handler(payload);
        }
    });
}

function subscribeToDestination(destination: string): void {
    const entry = destinations.get(destination);
    if (entry && !entry.stompSubscription && client?.connected) {
        entry.stompSubscription = client.subscribe(destination, (message: IMessage) => {
            handleMessage(destination, message);
        });
    }
}

function ensureConnected(retroId?: string): void {
    if (client?.active || isConnecting) return;
    isConnecting = true;
    getConfig(retroId).then(config => {
        if (destinations.size === 0 || client) {
            isConnecting = false;
            return;
        }
        client = new Client(config);
        client.beforeConnect = async () => {
            client!.connectHeaders = await buildConnectHeaders(retroId);
        };
        client.onConnect = () => {
            destinations.forEach((entry, destination) => {
                entry.stompSubscription = undefined;
                subscribeToDestination(destination);
            });
            if (hasConnectedOnce) {
                reconnectCallbacks.forEach(cb => cb());
            }
            hasConnectedOnce = true;
        };
        client.activate();
        isConnecting = false;
    }).catch((error) => {
        isConnecting = false;
        console.error('Failed to establish websocket connection:', error);
    });
}

function subscribe(destination: string, handlerMap: HandlerMap, options?: SubscribeOptions): () => void {
    const { retroId, onReconnect } = options ?? {};

    let entry = destinations.get(destination);
    if (!entry) {
        entry = { handlers: new Set() };
        destinations.set(destination, entry);
    }
    entry.handlers.add(handlerMap);

    if (onReconnect) {
        reconnectCallbacks.add(onReconnect);
    }

    subscribeToDestination(destination);

    if (!client || !client.active) {
        ensureConnected(retroId);
    }

    return () => {
        const currentEntry = destinations.get(destination);
        if (!currentEntry) return;
        currentEntry.handlers.delete(handlerMap);
        if (onReconnect) {
            reconnectCallbacks.delete(onReconnect);
        }
        if (currentEntry.handlers.size === 0) {
            currentEntry.stompSubscription?.unsubscribe();
            destinations.delete(destination);
            if (destinations.size === 0) {
                if (client?.active) {
                    client.deactivate().catch((error) => {
                        console.error('Error deactivating websocket client:', error);
                    });
                }
                client = null;
                isConnecting = false;
                hasConnectedOnce = false;
            }
        }
    };
}

export type { HandlerMap, WebsocketEvent, SubscribeOptions };
export const WebsocketService = { subscribe };
