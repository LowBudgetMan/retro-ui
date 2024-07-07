import axios from "axios";
import {Team} from "../pages/team/teamLoader.ts";

async function getTeam(id: string): Promise<Team> {
    return await axios.get(`http://localhost:8080/api/teams/${id}`).then(response => response.data);
}

async function createTeam(name: string): Promise<void> {
    await axios.post('http://localhost:8080/api/teams', {name})
}

export const TeamService = {
    createTeam,
    getTeam
}