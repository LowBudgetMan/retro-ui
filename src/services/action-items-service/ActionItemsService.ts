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

function transformActionItem(actionItem: ActionItem): ActionItem {
    return {
        ...actionItem,
        createdAt: new Date(actionItem.createdAt)
    }
}

export const ActionItemsService = {
    getActionItems
}