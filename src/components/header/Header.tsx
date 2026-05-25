import {ReactElement, useEffect, useState} from "react";
import {getUserManager} from "../../pages/user/UserContext.ts";
import {Theme} from "../../context/theme/ThemeContextTypes.ts";
import {useTheme} from "../../context/hooks.tsx";
import BonfireLogo from '../../../public/bonfire.svg';

export function Header() {
    const { setTheme, getEffectiveTheme } = useTheme();
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
    }, [setAuthAction])

    const toggleTheme = () => {
        setTheme(getEffectiveTheme() === Theme.DARK ? Theme.LIGHT : Theme.DARK);
    };

    const themeIcon = getEffectiveTheme() === Theme.DARK ? '🌙' : '☀️';

    return (
        <header className="header">
            <div className="header-content">
                <h1><img src={BonfireLogo} alt="" className="bonfire-logo" />Bonfire</h1>
                <div className="header-actions">
                    <button 
                        onClick={toggleTheme}
                        className="theme-toggle"
                        title={`Current theme: ${getEffectiveTheme()}`}
                    >
                        {themeIcon}
                    </button>
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
