import axios from "axios";

export interface Retro {
    id: string,
    teamId: string,
    finished: boolean,
    template: Template,
    thoughts: Thought[],
    dateCreated: Date
}

export interface Template {
    id: string,
    name: string,
    description: string,
    categories: Category[]
}

export interface Category {
    name: string,
    position: number,
    lightBackgroundColor: string,
    lightTextColor: string,
    darkBackgroundColor: string,
    darkTextColor: string,
}

export interface Thought {
    id: string,
    message: string,
    votes: number,
    completed: boolean,
    category: string,
    retroId: string,
    createdAt: Date
}

export interface Column {
    id: number,
    topic: string,
    title: string,
    teamId: string
}

//TODO: I think this can be removed
function transformRetro(retro: Retro): Retro {
    return {
        ...retro,
        dateCreated: new Date(retro.dateCreated)
    };
}

//TODO: I think this can be removed
function transformThought(thought: Thought): Thought {
    return {
        ...thought,
        createdAt: new Date(thought.createdAt)
    };
}

async function getRetrosForTeam(teamId: string): Promise<Retro[]> {
    const response = await axios.get(`http://localhost:8080/api/teams/${teamId}/retros`);
    return response.data.map(transformRetro);
}

async function getRetro(teamId: string, retroId: string): Promise<Retro> {
    const response = await axios.get(`http://localhost:8080/api/teams/${teamId}/retros/${retroId}`);
    return transformRetro(response.data);
}

async function createRetro(teamId: string, retroTemplateId: string) {
    return await axios.post(`http://localhost:8080/api/teams/${teamId}/retros`, {
        retroTemplateId
    });
}

async function createThought(teamId: string, retroId: string, message: string, category: number) {
    return await axios.post(`http://localhost:8080/api/teams/${teamId}/retros/${retroId}/thoughts`, {
        message,
        category
    });
}

async function getThoughts(teamId: string, retroId: string): Promise<Thought[]> {
    const response = await axios.get(`http://localhost:8080/api/team/${teamId}/retros/${retroId}/thoughts`);
    return response.data.map(transformThought);
}

async function getColumns(teamId: string): Promise<Column[]> {
    return await axios.get(`http://localhost:8080/api/team/${teamId}/columns`).then(response => response.data);
}

export const RetroService = {
    getRetrosForTeam,
    getRetro,
    createRetro,
    createThought,
    getThoughts,
    getColumns
}