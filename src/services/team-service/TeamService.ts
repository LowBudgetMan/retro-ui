import axios from "axios";

export interface TeamListItem {
    id: string,
    name: string,
    createdAt: Date,
}

async function getTeams(): Promise<TeamListItem[]> {
    return axios.get('http://localhost:8080/api/teams').then(response => response.data.map(transformTeam));
}

async function getTeam(id: string): Promise<TeamListItem> {
    return await axios.get(`http://localhost:8080/api/teams/${id}`).then(response => transformTeam(response.data));
}

async function createTeam(name: string): Promise<void> {
    await axios.post('http://localhost:8080/api/teams', {name})
}

function transformTeam(team: TeamListItem): TeamListItem {
    return {
        ...team,
        createdAt: new Date(team.createdAt)
    }
}

export const TeamService = {
    createTeam,
    getTeam,
    getTeams
}