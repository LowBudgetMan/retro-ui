import {EventType, WebsocketEvent} from "../WebsocketEventHandler.ts";
import {IMessage} from "@stomp/stompjs";

export const updateRetroFinishedSubscriptionId: string = 'update-retro-finished-subscription-id';

export function getDestination(retroId: string) {
    return `/topic/${retroId}.finished`;
}

export function eventHandler(expectedEventType: EventType, handler: (eventPayload: boolean) => void): (event: IMessage) => void {
    return (event: IMessage) => {
        const endRetroEvent = <WebsocketEvent<boolean>> JSON.parse(event?.body);
        if (endRetroEvent.actionType === expectedEventType) handler(endRetroEvent.payload);
    }
}