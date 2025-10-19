import axios from "axios";
import { DateTime } from "luxon";
import {ApiConfig} from "../../config/ApiConfig.ts";

export interface Retro {
    id: string,
    teamId: string,
    finished: boolean,
    template: Template,
    thoughts: Thought[],
    createdAt: DateTime
}

export interface RetroListItem {
    id: string,
    teamId: string,
    finished: boolean,
    templateId: string,
    createdAt: DateTime
}

export interface Template {
    id: string,
    name: string,
    description: string,
    categories: Category[]
}

export const notFoundTemplate: Template = {
    id: "retro-type-not-found",
    name: "Retro Type Not Found",
    categories: [],
    description: "The retro type this retro is based off of could not be found.",

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
    createdAt: DateTime
}

function transformRetro(retro: Retro): Retro {
    return {
        ...retro,
        createdAt: DateTime.fromISO(retro.createdAt as unknown as string),
        thoughts: retro.thoughts.map((thought) => transformThought(thought))
    };
}

function transformRetroListItem(retro: RetroListItem): RetroListItem {
    return {
        ...retro,
        createdAt: DateTime.fromISO(retro.createdAt as unknown as string)
    };
}

export function transformThought(thought: Thought): Thought {
    return {
        ...thought,
        createdAt: DateTime.fromISO(thought.createdAt as unknown as string)
    };
}

async function getRetrosForTeam(teamId: string): Promise<RetroListItem[]> {
    const response = await axios.get(`${ApiConfig.baseApiUrl()}/api/teams/${teamId}/retros`);
    return response.data.map(transformRetroListItem);
}

async function getRetro(teamId: string, retroId: string): Promise<Retro> {
    const response = await axios.get(`${ApiConfig.baseApiUrl()}/api/teams/${teamId}/retros/${retroId}`);
    return transformRetro(response.data);
}

async function createRetro(teamId: string, retroTemplateId: string) {
    return await axios.post(`${ApiConfig.baseApiUrl()}/api/teams/${teamId}/retros`, {
        retroTemplateId
    });
}

// TODO: Move thought stuff into ThoughtService
async function createThought(teamId: string, retroId: string, message: string, categoryName: string) {
    return await axios.post(`${ApiConfig.baseApiUrl()}/api/teams/${teamId}/retros/${retroId}/thoughts`, {
        message,
        category: categoryName
    });
}

// TODO: Move thought stuff into ThoughtService
async function getThoughts(teamId: string, retroId: string): Promise<Thought[]> {
    const response = await axios.get(`${ApiConfig.baseApiUrl()}/api/team/${teamId}/retros/${retroId}/thoughts`);
    return response.data.map(transformThought);
}

export const RetroService = {
    getRetrosForTeam,
    getRetro,
    createRetro,
    createThought,
    getThoughts
}
