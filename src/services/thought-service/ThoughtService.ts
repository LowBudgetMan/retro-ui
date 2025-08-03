import axios from "axios";

async function setCompleted(teamId: string, retroId: string, thoughtId: string, completed: boolean) {
    return await axios.put(`http://localhost:8080/api/teams/${teamId}/retros/${retroId}/thoughts/${thoughtId}/completed`, {
        completed,
    });
}

async function vote(teamId: string, retroId: string, thoughtId: string) {
    return await axios.put(`http://localhost:8080/api/teams/${teamId}/retros/${retroId}/thoughts/${thoughtId}/votes`);
}

async function setMessage(teamId: string, retroId: string, thoughtId: string, message: string) {
    return await axios.put(`http://localhost:8080/api/teams/${teamId}/retros/${retroId}/thoughts/${thoughtId}/message`, {
        message,
    });
}

async function deleteThought(teamId: string, retroId: string, thoughtId: string) {
    return await axios.delete(`http://localhost:8080/api/teams/${teamId}/retros/${retroId}/thoughts/${thoughtId}`);
}

export const ThoughtService = {
    setCompleted,
    vote,
    setMessage,
    deleteThought
}