import {createContext, PropsWithChildren, useCallback, useEffect, useState} from "react";
import {ActionItem} from "../../services/action-items-service/ActionItemsService.ts";
import {WebsocketService} from "../../services/websocket/WebsocketService.ts";
import {eventHandler, EventType} from "../../services/websocket/WebsocketEventHandler.ts";
import {getDestination, createActionItemSubscriptionId} from "../../services/websocket/constants/action-items.ts";

export type ActionItemsContextValue = {
    actionItems: ActionItem[];
}

export const ActionItemsContext = createContext<ActionItemsContextValue>({
    actionItems: []
})

type ActionItemsContextProviderProps = {
    teamId: string;
    actionItems: ActionItem[];
}

export function ActionItemsContextProvider({teamId, actionItems, children}: PropsWithChildren<ActionItemsContextProviderProps>) {
    const [actionItemsState, setActionItemsState] = useState<ActionItem[]>(actionItems);

    const createActionItem = useCallback((newActionItem: ActionItem) => {
        setActionItemsState(prevState => ([...prevState, newActionItem]));
    }, []);

    useEffect(() => {
        WebsocketService.subscribe(
            getDestination(teamId),
            createActionItemSubscriptionId,
            eventHandler(EventType.CREATE, createActionItem)
        );
        return () => {
            WebsocketService.unsubscribe(createActionItemSubscriptionId);
        };
    }, [teamId, createActionItem]);

    return (
        <ActionItemsContext.Provider value={{actionItems: actionItemsState}}>
            {children}
        </ActionItemsContext.Provider>
    )
}