export function retroDestination(retroId: string, suffix: string): string {
    return `/topic/retros.${retroId}.${suffix}`;
}

export function teamDestination(teamId: string, suffix: string): string {
    return `/topic/teams.${teamId}.${suffix}`;
}
