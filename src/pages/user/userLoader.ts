import {TeamListItem, TeamService} from "../../services/TeamService.ts";

export interface UserPageData {
    teams: TeamListItem[]
}

export async function loader(): Promise<UserPageData> {
    return {
        teams: await TeamService.getTeams()
    }
}