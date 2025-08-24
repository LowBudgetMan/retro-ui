export const createActionItemSubscriptionId: string = 'create-action-item-subscription-id';
export const updateActionItemSubscriptionId: string = 'update-action-item-subscription-id';
export const deleteActionItemSubscriptionId: string = 'delete-action-item-subscription-id';

export function getDestination(teamId: string) {
    return `/topic/${teamId}.action-items`;
}