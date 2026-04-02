import {fetchClient, FetchResponse} from "../../config/FetchClient";
import {ApiConfig} from "../../config/ApiConfig";

export interface TeamListItem {
    id: string,
    name: string,
    createdAt: Date,
}

export interface Invite {
    id: string,
    teamId: string,
    createdAt: Date,
}

async function getTeams(): Promise<TeamListItem[]> {
    return fetchClient.get<TeamListItem[]>(`${ApiConfig.baseApiUrl()}/api/teams`).then(response => response.data.map(transformTeam));
}

async function getTeam(id: string): Promise<TeamListItem> {
    return await fetchClient.get<TeamListItem>(`${ApiConfig.baseApiUrl()}/api/teams/${id}`).then(response => transformTeam(response.data));
}

async function createTeam(name: string): Promise<void> {
    await fetchClient.post(`${ApiConfig.baseApiUrl()}/api/teams`, {name});
}

async function createInvite(teamId: string): Promise<string> {
    return await fetchClient.post(`${ApiConfig.baseApiUrl()}/api/teams/${teamId}/invites`)
        .then(response => {
            const locationHeader = response.headers.get('location') as string;
            const lastSlashIndex = locationHeader.lastIndexOf('/') + 1;
            return locationHeader.substring(lastSlashIndex);
        });
}

async function getInvitesForTeam(teamId: string): Promise<Invite[]> {
    return await fetchClient.get<Invite[]>(`${ApiConfig.baseApiUrl()}/api/teams/${teamId}/invites`)
        .then(response => response.data.map(transformInvite));
}

async function deleteInvite(teamId: string, inviteId: string): Promise<FetchResponse> {
    return await fetchClient.delete(`${ApiConfig.baseApiUrl()}/api/teams/${teamId}/invites/${inviteId}`);
}

async function addUserToTeam(teamId: string, inviteId: string): Promise<FetchResponse> {
    return await fetchClient.post(`${ApiConfig.baseApiUrl()}/api/teams/${teamId}/users`, {inviteId});
}

function transformTeam(team: TeamListItem): TeamListItem {
    return {
        ...team,
        createdAt: new Date(team.createdAt)
    }
}

function transformInvite(invite: Invite): Invite {
    return {
        ...invite,
        createdAt: new Date(invite.createdAt)
    }
}

export const TeamService = {
    createTeam,
    getTeam,
    getTeams,
    createInvite,
    getInvitesForTeam,
    addUserToTeam,
    deleteInvite,
}
