import {Retro, Template, Thought} from "../../services/RetroService.ts";
import {createContext, PropsWithChildren, useCallback, useContext, useEffect, useState} from "react";
import {useLoaderData} from "react-router-dom";
import {WebsocketService} from "../../services/websocket/WebsocketService.ts";
import {
    createThoughtEventHandler,
    getDestination,
    id
} from "../../services/websocket/eventHandlers/ThoughtEventHandler.ts";

type RetroContextValue = {
    retro: Retro
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
})

export function RetroContextProvider(props: PropsWithChildren) {
    const retro = useLoaderData() as Retro;
    const [retroState, setRetroState] = useState<Retro>(retro);
    const updateThought = useCallback((updatedThought: Thought) => {
        setRetroState((prevState) => {
            const newState = {...prevState};
            const index = newState.thoughts.findIndex((thought) => thought.id === updatedThought.id);

            if(index == -1) newState.thoughts.push(updatedThought);
            else newState.thoughts[index] = updatedThought;

            return newState;
        })
    }, [setRetroState]);

    useEffect(() => {
        WebsocketService.subscribe(getDestination(retro.id), id, createThoughtEventHandler(updateThought))
    }, [updateThought, retro])


    return <RetroContext.Provider value={{retro: retroState}}>
        {props.children}
    </RetroContext.Provider>
}

export function useRetro(): RetroContextValue {
    return useContext(RetroContext);
}