import {IMessage} from "@stomp/stompjs";

export enum EventType {
    CREATE= 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE'
}

export interface WebsocketEvent<T> {
    actionType: EventType;
    payload: T;
}

export function eventHandler<T>(expectedEventType: EventType, handler: (eventPayload: T) => void): (event: IMessage) => void  {
    return (event: IMessage) => {
        const thoughtEvent = <WebsocketEvent<T>> JSON.parse(event?.body);
        if(thoughtEvent.actionType === expectedEventType) handler(thoughtEvent.payload);
    }
}