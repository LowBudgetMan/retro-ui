import {Team} from "./Teams.types.ts";
import axios from "axios";

async function getTeamsForUser(): Promise<Team[]> {
    return axios.get('http://localhost:8080/api/team').then(response => response.data)
}

export const UserSerivce = {
    getTeamsForUser
};