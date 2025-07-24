import axios from "axios";

async function setCompleted(teamId: string, retroId: string, thoughtId: string, completed: boolean) {
    return await axios.put(`http://localhost:8080/api/teams/${teamId}/retros/${retroId}/thoughts/${thoughtId}/completed`, {
        completed,
    });
}

async function vote(teamId: string, retroId: string, thoughtId: string) {
    return await axios.put(`http://localhost:8080/api/teams/${teamId}/retros/${retroId}/thoughts/${thoughtId}/votes`);
}

export const ThoughtService = {
    setCompleted,
    vote
}