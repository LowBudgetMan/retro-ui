import {createContext, PropsWithChildren, useState} from "react";
import {ActionItem} from "../../services/action-items-service/ActionItemsService.ts";

export type ActionItemsContextValue = {
    actionItems: ActionItem[];
}

export const ActionItemsContext = createContext<ActionItemsContextValue>({
    actionItems: []
})

type ActionItemsContextProviderProps = {
    actionItems: ActionItem[];
}

export function ActionItemsContextProvider({actionItems, children}: PropsWithChildren<ActionItemsContextProviderProps>) {
    const [actionItemsState] = useState<ActionItem[]>(actionItems);

    return (
        <ActionItemsContext.Provider value={{actionItems: actionItemsState}}>
            {children}
        </ActionItemsContext.Provider>
    )
}