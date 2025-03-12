import {Thought} from "../../RetroService.ts";
import {IMessage} from "@stomp/stompjs";

export const id: string = 'this-is-a-thought-subscription-id';

export function getDestination(retroId: string) {
    return `/topic/${retroId}.thoughts`;
}

enum EventType {
    CREATE= 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE'
}

interface WebsocketThoughtEvent {
    type: EventType;
    payload: Thought;
}

export function createThoughtEventHandler(createThought: (updatedThought: Thought) => void): (event: IMessage) => void {
    return (event: IMessage) => {
        console.log(event)
        const thoughtEvent = <WebsocketThoughtEvent> JSON.parse(event?.body);
        console.log(thoughtEvent)
        switch (thoughtEvent.type) {
            case EventType.CREATE:
                createThought(thoughtEvent.payload);
                break;
        }
    }
}
