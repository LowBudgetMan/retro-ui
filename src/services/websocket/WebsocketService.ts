import {Client, IMessage} from '@stomp/stompjs';
import {getConfig} from "./WebsocketConfig.ts";

interface Subscription {
    destination: string;
    id: string;
    handler: (event: IMessage) => void;
    subscription?: any; // TODO: Remove this I think
}

let client: Client;
const subscriptions: Subscription[] = [];

async function connect(): Promise<void> {
    if (!client?.connected) {
        const config = await getConfig();
        client = new Client(config)
        client.onConnect = () => {
            subscriptions.forEach((subscription) => subscribeToClient(subscription));
        };
        client.activate();
    }
}

function disconnect(): void {
    if (client && client.active) {
        client.deactivate().catch();
    }
}

function subscribe(destination: string, id: string, handler: (event: IMessage) => void): void {
    if (!subscriptions.some(subscription => subscription.id == id)) {
        subscriptions.push({destination, id, handler});
        if (client && client.connected) {
            subscribeToClient({destination, id, handler});
        }
    }
}

function subscribeToClient({destination, id, handler}: Subscription): void {
    const subscription = client.subscribe(destination, handler, {id});
    // Store the subscription object for later use
    const index = subscriptions.findIndex(sub => sub.id === id);
    if (index !== -1) {
        // TODO: Can this be combined with the storage call in the above method?
        subscriptions[index] = { ...subscriptions[index], subscription };
    }
}

function unsubscribe(id: string): void {
    //TODO: This has to be able to be refactored, look how close the two sections are
    const subscription = subscriptions.find(sub => sub.id === id);
    if (subscription?.subscription) {
        subscription.subscription.unsubscribe();
    }
    const index = subscriptions.findIndex(sub => sub.id === id);
    if (index !== -1) {
        subscriptions.splice(index, 1);
    }
}

export const WebsocketService = {
    connect,
    disconnect,
    subscribe,
    unsubscribe
}