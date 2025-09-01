import axios from "axios";

export interface ActionItem {
    id: string;
    teamId: string;
    action: string;
    assignee: string;
    completed: boolean;
    createdAt: Date;
}

async function getActionItems(teamId: string): Promise<ActionItem[]> {
    return axios.get(`http://localhost:8080/api/teams/${teamId}/action-items`).then(response => response.data.map(transformActionItem));
}

async function createActionItem(teamId: string, action: string, assignee: string) {
    return await axios.post(`http://localhost:8080/api/teams/${teamId}/action-items`, {
        action,
        assignee
    });
}

async function setCompleted(teamId: string, actionItemId: string, completed: boolean) {
    return await axios.put(`http://localhost:8080/api/teams/${teamId}/action-items/${actionItemId}/completed`, {
        completed
    })
}

// TODO: Replace JavaScript Dates with Luxon or equivalent
function transformActionItem(actionItem: ActionItem): ActionItem {
    return {
        ...actionItem,
        createdAt: new Date(actionItem.createdAt)
    }
}

export const ActionItemsService = {
    getActionItems,
    createActionItem,
    setCompleted
}