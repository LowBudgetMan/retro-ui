import {createContext, PropsWithChildren, useCallback, useEffect, useState} from "react";
import {ActionItem, transformActionItem} from "../../services/action-items-service/ActionItemsService.ts";
import {WebsocketService} from "../../services/websocket/WebsocketService.ts";
import {teamDestination} from "../../services/websocket/destinations.ts";
import {CrudEventTypes} from "../../services/websocket/EventTypes.ts";

export type ActionItemsContextValue = {
    teamId: string;
    actionItems: ActionItem[];
    createActionItem: (newActionItem: ActionItem) => void;
    updateActionItem: (updatedActionItem: ActionItem) => void;
    deleteActionItem: (deletedActionItem: ActionItem) => void;
}

export const ActionItemsContext = createContext<ActionItemsContextValue>({
    teamId: "",
    actionItems: [],
    createActionItem: () => {},
    updateActionItem: () => {},
    deleteActionItem: () => {},
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

    const deleteActionItem = useCallback((deletedActionItem: ActionItem) => {
        setActionItemsState(prevState => {
            return prevState.filter(actionItem => actionItem.id !== deletedActionItem.id);
        });
    }, [setActionItemsState]);

    useEffect(() => {
        const unsubscribe = WebsocketService.subscribe(
            teamDestination(teamId, 'action-items'),
            {
                transform: transformActionItem,
                [CrudEventTypes.CREATE]: createActionItem,
                [CrudEventTypes.UPDATE]: updateActionItem,
                [CrudEventTypes.DELETE]: deleteActionItem,
            }
        );
        return unsubscribe;
    }, [teamId, createActionItem, updateActionItem, deleteActionItem]);

    return (
        <ActionItemsContext.Provider value={{teamId, actionItems: actionItemsState, createActionItem, updateActionItem, deleteActionItem}}>
            {children}
        </ActionItemsContext.Provider>
    )
}
