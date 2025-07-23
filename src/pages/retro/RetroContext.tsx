import {Retro, Template, Thought} from "../../services/RetroService.ts";
import {createContext, PropsWithChildren, useCallback, useContext, useEffect, useState} from "react";
import {useLoaderData} from "react-router-dom";
import {WebsocketService} from "../../services/websocket/WebsocketService.ts";
import {
    createThoughtEventHandler,
    getDestination,
    createThoughtSubscriptionId, updateThoughtEventHandler, updateThoughtSubscriptionId
} from "../../services/websocket/eventHandlers/ThoughtEventHandler.ts";

type RetroContextValue = {
    retro: Retro;
    createThought: (thought: Thought) => void;
    updateThought: (thought: Thought) => void;
}

const RetroContext = createContext<RetroContextValue>({
    retro: {
        id: '',
        teamId: '',
        finished: false,
        dateCreated: new Date(),
        thoughts: [],
        template: {} as Template
    },
    createThought: () => {},
    updateThought: () => {}
});

export function RetroContextProvider(props: PropsWithChildren) {
    const retro = useLoaderData() as Retro;
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

    return (
        <RetroContext.Provider value={{retro: retroState, createThought, updateThought}}>
            {props.children}
        </RetroContext.Provider>
    );
}

export function useRetro(): RetroContextValue {
    return useContext(RetroContext);
}