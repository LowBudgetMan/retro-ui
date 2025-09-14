import {EventType, WebsocketEvent} from "../WebsocketEventHandler.ts";
import {IMessage} from "@stomp/stompjs";
import {ActionItem, transformActionItem} from "../../action-items-service/ActionItemsService.ts";

export const createActionItemSubscriptionId: string = 'create-action-item-subscription-id';
export const updateActionItemSubscriptionId: string = 'update-action-item-subscription-id';
export const deleteActionItemSubscriptionId: string = 'delete-action-item-subscription-id';

export function getDestination(teamId: string) {
    return `/topic/${teamId}.action-items`;
}

export function eventHandler(expectedEventType: EventType, handler: (eventPayload: ActionItem) => void): (event: IMessage) => void  {
    return (event: IMessage) => {
        const thoughtEvent = <WebsocketEvent<ActionItem>> JSON.parse(event?.body);
        if(thoughtEvent.actionType === expectedEventType) handler(transformActionItem(thoughtEvent.payload));
    }
}