import {Retro, Template, Thought} from "../../services/RetroService.ts";
import {createContext, PropsWithChildren, useCallback, useEffect, useState} from "react";
import {WebsocketService} from "../../services/websocket/WebsocketService.ts";
import {
    createThoughtEventHandler,
    getDestination,
    createThoughtSubscriptionId,
    updateThoughtEventHandler,
    updateThoughtSubscriptionId,
    deleteThoughtSubscriptionId,
    deleteThoughtEventHandler
} from "../../services/websocket/eventHandlers/ThoughtEventHandler.ts";

export type RetroContextProviderProps = {
    retro: Retro;
}

export type RetroContextValue = {
    retro: Retro;
    // TODO: Do I need these exposed as part of the context or should they just be internal to the provider? 
    // TODO: So far they only seem neccessary for tests.
    createThought: (thought: Thought) => void;
    updateThought: (thought: Thought) => void;
    deleteThought: (thought: Thought) => void;
}

export const RetroContext = createContext<RetroContextValue>({
    retro: {
        id: '',
        teamId: '',
        finished: false,
        dateCreated: new Date(),
        thoughts: [],
        template: {} as Template
    },
    createThought: () => {},
    updateThought: () => {},
    deleteThought: () => {}
});

export function RetroContextProvider({children, retro}: PropsWithChildren<RetroContextProviderProps>) {
    const [retroState, setRetroState] = useState<Retro>(retro);

    const createThought = useCallback((newThought: Thought) => {
        setRetroState(prevState => ({
            ...prevState,
            thoughts: [...prevState.thoughts, newThought]
        }));
    }, []);

    const updateThought = useCallback((updatedThought: Thought) => {
        setRetroState(prevState => {
            const index = prevState.thoughts.findIndex(t => t.id === updatedThought.id);
            if (index === -1) return prevState;

            const newThoughts = [...prevState.thoughts];
            newThoughts[index] = updatedThought;
            return { ...prevState, thoughts: newThoughts };
        });
    }, []);

    const deleteThought = useCallback((deletedThought: Thought) => {
        setRetroState(prevState => {
            const thoughts = prevState.thoughts.filter(t => t.id !== deletedThought.id);
            return { ...prevState, thoughts };
        });
    }, []);

    useEffect(() => {
        WebsocketService.subscribe(
            getDestination(retro.id),
            createThoughtSubscriptionId,
            createThoughtEventHandler(createThought)
        );
        return () => {
            WebsocketService.unsubscribe(createThoughtSubscriptionId);
        };
    }, [retro.id, createThought]);

    useEffect(() => {
        WebsocketService.subscribe(
            getDestination(retro.id),
            updateThoughtSubscriptionId,
            updateThoughtEventHandler(updateThought)
        );
        return () => {
            WebsocketService.unsubscribe(updateThoughtSubscriptionId);
        };
    }, [retro.id, updateThought]);

    useEffect(() => {
        WebsocketService.subscribe(
            getDestination(retro.id),
            deleteThoughtSubscriptionId,
            deleteThoughtEventHandler(deleteThought)
        );
        return () => {
            WebsocketService.unsubscribe(deleteThoughtSubscriptionId);
        };
    }, [retro.id, deleteThought]);

    return (
        <RetroContext.Provider value={{retro: retroState, createThought, updateThought, deleteThought}}>
            {children}
        </RetroContext.Provider>
    );
}
