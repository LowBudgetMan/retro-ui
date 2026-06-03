import {ReactElement, useEffect, useState} from "react";
import {getUserManager} from "../../pages/user/UserContext.ts";
import BonfireLogo from '../../../public/bonfire.svg';
import {ThemeToggle} from "../theme-toggle/ThemeToggle.tsx";

export function Header() {
    const [authAction, setAuthAction] = useState<ReactElement>(loginButton);

    useEffect(() => {
        getUserManager().events.addUserLoaded(() => {
            setAuthAction(logoutButton);
        });

        return () => {
            getUserManager().events.removeUserLoaded(() => {});
        };
    }, [setAuthAction]);

    useEffect(() => {
        getUserManager().events.addUserUnloaded(() => {
            setAuthAction(loginButton);
        });

        return () => {
            getUserManager().events.removeUserUnloaded(() => {});
        };
    }, [setAuthAction]);

    useEffect(() => {
        getUserManager().getUser()
            .then((result) => {
                return result ? setAuthAction(logoutButton) : setAuthAction(loginButton)
            })
    }, [setAuthAction]);

    return (
        <header className="header">
            <div className="header-content">
                <h1><img src={BonfireLogo} alt="" className="bonfire-logo"/>Bonfire</h1>
                <div className="header-actions">
                    <ThemeToggle />
                    {authAction}
                </div>
            </div>
        </header>
    );
}

function loginButton() {
    return (
        <button className="auth-btn" onClick={() => {
            getUserManager()?.signinRedirect()
        }}>
            Login
        </button>
    );
}

function logoutButton() {
    return (
        <button className="auth-btn" onClick={() => {
            getUserManager()?.signoutRedirect()
        }}>
            Logout
        </button>
    );
}
