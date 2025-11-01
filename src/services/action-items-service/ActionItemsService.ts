import axios from "axios";
import { DateTime } from "luxon";
import {ApiConfig} from '../../config/ApiConfig';

export interface ActionItem {
    id: string;
    teamId: string;
    action: string;
    assignee: string;
    completed: boolean;
    createdAt: DateTime;
}

async function getActionItems(teamId: string): Promise<ActionItem[]> {
    return axios.get(`${ApiConfig.baseApiUrl()}/api/teams/${teamId}/action-items`).then(response => response.data.map(transformActionItem));
}

async function createActionItem(teamId: string, action: string, assignee: string) {
    return await axios.post(`${ApiConfig.baseApiUrl()}/api/teams/${teamId}/action-items`, {
        action,
        assignee
    });
}

async function setCompleted(teamId: string, actionItemId: string, completed: boolean) {
    return await axios.put(`${ApiConfig.baseApiUrl()}/api/teams/${teamId}/action-items/${actionItemId}/completed`, {
        completed
    })
}

async function setAction(teamId: string, actionItemId: string, action: string) {
    return await axios.put(`${ApiConfig.baseApiUrl()}/api/teams/${teamId}/action-items/${actionItemId}/action`, {
        action
    });
}

async function setAssignee(teamId: string, actionItemId: string, assignee: string) {
    return await axios.put(`${ApiConfig.baseApiUrl()}/api/teams/${teamId}/action-items/${actionItemId}/assignee`, {
        assignee
    })
}

async function deleteActionItem(teamId: string, actionItemId: string) {
    return axios.delete(`${ApiConfig.baseApiUrl()}/api/teams/${teamId}/action-items/${actionItemId}`);
}

export function transformActionItem(actionItem: ActionItem): ActionItem {
    return {
        ...actionItem,
        createdAt: DateTime.fromISO(actionItem.createdAt as unknown as string)
    }
}

export const ActionItemsService = {
    createActionItem,
    getActionItems,
    setCompleted,
    setAction,
    setAssignee,
    deleteActionItem
}
