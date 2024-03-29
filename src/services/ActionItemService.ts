import axios from "axios";

export interface ActionItem {
    id: number,
    task: string,
    assignee: string,
    completed: boolean,
    archived: boolean
}

async function getActionItemsForTeam(teamId: string): Promise<ActionItem[]> {
    return await axios.get(`http://localhost:8080/api/team/${teamId}/action-item`).then(response => response.data);
}

export const ActionItemService = {
    getActionItemsForTeam
}