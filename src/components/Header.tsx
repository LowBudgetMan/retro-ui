import {ReactElement, useEffect, useState} from "react";
import {userManager} from "../pages/user/UserContext.ts";
import {useTheme, Theme} from "../styles/ThemeContext";

export function Header() {
    const { theme, setTheme } = useTheme();
    const [authAction, setAuthAction] = useState<ReactElement>(loginButton);

    useEffect(() => {
        userManager.getUser()
            .then((result) => result ? setAuthAction(logoutButton) : setAuthAction(loginButton))
    }, [setAuthAction])

    const toggleTheme = () => {
        if (theme === Theme.DARK) {
            setTheme(Theme.LIGHT);
        } else if (theme === Theme.LIGHT) {
            setTheme(Theme.SYSTEM);
        } else {
            setTheme(Theme.DARK);
        }
    };

    const themeIcon = theme === Theme.DARK ? '🌙' : theme === Theme.LIGHT ? '☀️' : '⚙️';

    return (
        <header className="header">
            <div className="header-content">
                <h1>Retro UI</h1>
                <div className="header-actions">
                    <button 
                        onClick={toggleTheme}
                        className="theme-toggle"
                        title={`Current theme: ${theme}`}
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
        <button onClick={() => {
            userManager?.signinRedirect()
        }}>
            Login
        </button>
    );
}

function logoutButton() {
    return (
        <button onClick={() => {
            userManager?.signoutRedirect()
        }}>
            Logout
        </button>
    );
}