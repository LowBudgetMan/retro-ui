export const createActionItemSubscriptionId: string = 'create-action-item-subscription-id';

export function getDestination(teamId: string) {
    return `/topic/${teamId}.action-items`;
}