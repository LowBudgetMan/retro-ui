import {ReactElement, useEffect, useState} from "react";
import {getUserManager} from "../../pages/user/UserContext.ts";
import {Theme} from "../../context/theme/ThemeContextTypes.ts";
import {useTheme} from "../../context/hooks.tsx";

export function Header() {
    const { theme, setTheme } = useTheme();
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
            getUserManager()?.signinRedirect()
        }}>
            Login
        </button>
    );
}

function logoutButton() {
    return (
        <button onClick={() => {
            getUserManager()?.signoutRedirect()
        }}>
            Logout
        </button>
    );
}
