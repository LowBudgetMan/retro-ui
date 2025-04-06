import {TeamListItem, TeamService} from "../../services/TeamService.ts";

export interface UserPageData {
    name: string,
    teams: TeamListItem[]
}

export async function loader(): Promise<UserPageData> {
    return {
        name: "Foo",
        teams: await TeamService.getTeams()
    }
}