import {Link, useLoaderData} from "react-router-dom";
import {Team} from "./teamLoader.ts";

export function TeamPage() {
    const team = useLoaderData() as Team;
    return (
        <main>
            <Link to={'/user'}>Home</Link>
            <h1>{team.name}</h1>
        </main>
    )
}