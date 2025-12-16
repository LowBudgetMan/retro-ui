import {useNavigate} from "react-router-dom";
import {useEffect} from "react";
import {getUserManager, getReturnUrl} from "../user/UserContext.ts";

let hasRetrievedReturnUrl = false;

export function AuthRedirectPage() {
    const navigate = useNavigate();
    
    useEffect(() => {
        const handleAuthCallback = async () => {
            if (hasRetrievedReturnUrl) return;
            hasRetrievedReturnUrl = true;
            
            try {
                await getUserManager()?.signinRedirectCallback();
                const returnUrl = getReturnUrl();
                if (returnUrl) navigate(returnUrl);
                else navigate('/user');
            } catch (error) {
                console.error('Authentication callback error:', error);
                navigate('/user');
            }
        };
        
        handleAuthCallback()
    }, [navigate]);
    
    return <h1>Logging in...</h1>
}
