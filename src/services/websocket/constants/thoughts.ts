import {IMessage} from "@stomp/stompjs";
import {EventType, WebsocketEvent} from "../WebsocketEventHandler.ts";
import {Thought, transformThought} from "../../retro-service/RetroService.ts";

export const createThoughtSubscriptionId: string = 'create-thought-subscription-id';
export const updateThoughtSubscriptionId: string = 'update-thought-subscription-id';
export const deleteThoughtSubscriptionId: string = 'delete-thought-subscription-id';

export function getDestination(retroId: string) {
    return `/topic/${retroId}.thoughts`;
}

export function eventHandler(expectedEventType: EventType, handler: (eventPayload: Thought) => void): (event: IMessage) => void  {
    return (event: IMessage) => {
        const thoughtEvent = <WebsocketEvent<Thought>> JSON.parse(event?.body);
        if(thoughtEvent.actionType === expectedEventType) handler(transformThought(thoughtEvent.payload));
    }
}
