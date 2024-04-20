import {Thought} from "../../RetroService.ts";
import {IMessage} from "@stomp/stompjs";

export const id: string = 'this-is-a-thought-subscription-id';

export function getDestination(teamId: string) {
    return `/topic/${teamId}/thoughts`;
}

enum EventType {
    UPDATE = 'put',
    DELETE = 'delete'
}

interface WebsocketThoughtEvent {
    type: EventType;
    payload: Thought;
}

export function createThoughtEventHandler(updateHandler: (updatedThought: Thought) => void): (event: IMessage) => void {
    return (event: IMessage) => {
        const thoughtEvent = <WebsocketThoughtEvent> JSON.parse(event?.body);
        switch (thoughtEvent.type) {
            case EventType.UPDATE:
                updateHandler(thoughtEvent.payload);
                break;
        }
    }
}
