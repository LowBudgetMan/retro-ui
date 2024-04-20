import axios from "axios";

export interface Retro {
    id: number,
    teamId: string,
    dateCreated: Date,
    thoughts: Thought[],
    columns: Column[]
}

export interface Thought {
    id: number,
    message: string,
    hearts: number,
    discussed: boolean,
    teamId: string,
    boardId: number,
    columnId: number
}

export interface Column {
    id: number,
    topic: string,
    title: string,
    teamId: string
}

async function getRetrosForTeam(teamId: string): Promise<Retro[]> {
    return await axios.get(`http://localhost:8080/api/team/${teamId}/boards`).then(response => response.data);
}

async function getRetro(teamId: string, retroId: number): Promise<Retro> {
    return await axios.get(`http://localhost:8080/api/team/${teamId}/boards/${retroId}`).then(response => response.data);
}

async function createRetro(teamId: string) {
    return await axios.post(`http://localhost:8080/api/team/${teamId}/board`);
}

async function createThought(teamId: string, message: string, columnId: number) {
    return await axios.post(`http://localhost:8080/api/team/${teamId}/thoughts`, {
        message,
        columnId
    });
}

async function getThoughts(teamId: string) {
    return await axios.get(`http://localhost:8080/api/team/${teamId}/thoughts`).then(response => response.data);
}

async function getColumns(teamId: string) {
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