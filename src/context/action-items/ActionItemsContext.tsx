import {createContext, PropsWithChildren, useCallback, useEffect, useState} from "react";
import {ActionItem} from "../../services/action-items-service/ActionItemsService.ts";
import {WebsocketService} from "../../services/websocket/WebsocketService.ts";
import {eventHandler, EventType} from "../../services/websocket/WebsocketEventHandler.ts";
import {
    getDestination,
    createActionItemSubscriptionId,
    updateActionItemSubscriptionId
} from "../../services/websocket/constants/action-items.ts";

export type ActionItemsContextValue = {
    actionItems: ActionItem[];
    createActionItem: (newActionItem: ActionItem) => void;
    updateActionItem: (updatedActionItem: ActionItem) => void;
}

export const ActionItemsContext = createContext<ActionItemsContextValue>({
    actionItems: [],
    createActionItem: () => {},
    updateActionItem: () => {},
})

type ActionItemsContextProviderProps = {
    teamId: string;
    actionItems: ActionItem[];
}

export function ActionItemsContextProvider({teamId, actionItems, children}: PropsWithChildren<ActionItemsContextProviderProps>) {
    const [actionItemsState, setActionItemsState] = useState<ActionItem[]>(actionItems);

    const createActionItem = useCallback((newActionItem: ActionItem) => {
        setActionItemsState(prevState => ([...prevState, newActionItem]));
    }, [setActionItemsState]);

    const updateActionItem = useCallback((updatedActionItem: ActionItem) => {
        setActionItemsState(prevState => {
            const index = prevState.findIndex(actionItem => actionItem.id === updatedActionItem.id);
            const newState = [...prevState];
            if (index !== -1) newState[index] = updatedActionItem;
            return newState;
        });
    }, [setActionItemsState]);

    useEffect(() => {
        WebsocketService.subscribe(getDestination(teamId), createActionItemSubscriptionId, eventHandler(EventType.CREATE, createActionItem));
        return () => {WebsocketService.unsubscribe(createActionItemSubscriptionId);};
    }, [teamId, createActionItem]);

    useEffect(() => {
        WebsocketService.subscribe(getDestination(teamId), updateActionItemSubscriptionId, eventHandler(EventType.UPDATE, updateActionItem));
        return () => {WebsocketService.unsubscribe(updateActionItemSubscriptionId);};
    }, [teamId, updateActionItem]);

    return (
        <ActionItemsContext.Provider value={{actionItems: actionItemsState, createActionItem, updateActionItem}}>
            {children}
        </ActionItemsContext.Provider>
    )
}