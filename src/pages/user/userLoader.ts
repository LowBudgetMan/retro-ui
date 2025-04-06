import {UserService} from "../../services/UserService.ts";
import {Team} from "../../services/Teams.types.ts";

export interface User {
    name: string,
    teams: Team[]
}

export async function loader(): Promise<User> {
    return {
        name: "Foo",
        teams: await UserService.getTeamsForUser()
    }
}