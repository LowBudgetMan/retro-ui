export const createThoughtSubscriptionId: string = 'create-thought-subscription-id';
export const updateThoughtSubscriptionId: string = 'update-thought-subscription-id';
export const deleteThoughtSubscriptionId: string = 'delete-thought-subscription-id';

export function getDestination(retroId: string) {
    return `/topic/${retroId}.thoughts`;
}
