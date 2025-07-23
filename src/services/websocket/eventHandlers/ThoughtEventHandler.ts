import {Thought} from "../../RetroService.ts";
import {IMessage} from "@stomp/stompjs";

export const createThoughtSubscriptionId: string = 'create-thought-subscription-id';
export const updateThoughtSubscriptionId: string = 'update-thought-subscription-id';

export function getDestination(retroId: string) {
    return `/topic/${retroId}.thoughts`;
}

enum EventType {
    CREATE= 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE'
}

interface WebsocketThoughtEvent {
    actionType: EventType;
    payload: Thought;
}

export function createThoughtEventHandler(createThought: (thought: Thought) => void): (event: IMessage) => void {
    return (event: IMessage) => {
        const thoughtEvent = <WebsocketThoughtEvent> JSON.parse(event?.body);
        if(thoughtEvent.actionType === EventType.CREATE) createThought(thoughtEvent.payload);
    }
}

export function updateThoughtEventHandler(updateThought: (thought: Thought) => void): (event: IMessage) => void {
    return (event: IMessage) => {
        const thoughtEvent = <WebsocketThoughtEvent> JSON.parse(event?.body);
        if(thoughtEvent.actionType === EventType.UPDATE) updateThought(thoughtEvent.payload);
    }
}
