import {Client, IMessage} from '@stomp/stompjs';
import {getConfig} from "./WebsocketConfig.ts";

interface Subscription {
    destination: string;
    id: string;
    handler: (event: IMessage) => void;
}

let client: Client;
const subscriptions: Subscription[] = [];
let isConnected: boolean = false; // TODO: Should I move websocket connections into various page contexts, or keep the providers at the root page?

async function connect(): Promise<void> {
    if (!isConnected) {
        const config = await getConfig();
        client = new Client(config)
        client.onConnect = () => {
            console.log("Connected to event bus");
            isConnected = true;
            subscriptions.forEach((subscription) => addSubscription(subscription));
        };
        client.activate();
    }
}

function disconnect(): void {
    if (client && client.active) {
        // TODO: Should I clear subscriptions here?
        // subscriptions = [];
        isConnected = false;
        client.deactivate().catch();
    }
}

function subscribe(destination: string, id: string, handler: (event: IMessage) => void): void {
    if (!subscriptions.some(subscription => subscription.id == id)) {
        subscriptions.push({destination, id, handler});
        console.log(subscriptions);
        if (client && client.connected) {
            console.log("added");
            addSubscription({destination, id, handler});
        }
    }
}

function addSubscription({destination, id, handler}: Subscription): void {
    client.subscribe(
        destination,
        handler,
        {id}
    );
}

export const WebsocketService = {
    connect,
    disconnect,
    subscribe
}