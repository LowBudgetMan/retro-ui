import {useNavigate} from "react-router-dom";
import {useEffect} from "react";
import {getUserManager} from "../user/UserContext.ts";

export function AuthRedirectPage() {
    const navigate = useNavigate();
    useEffect(() => {
        getUserManager()?.signinRedirectCallback().then(() => navigate('/user'));
    }, [navigate])
    return <h1>Logging in...</h1>
}