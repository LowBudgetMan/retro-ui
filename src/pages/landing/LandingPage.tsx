import {userManager} from "../user/UserContext.ts";

export function LandingPage() {
    userManager.getUser().then(result => console.log(result));
    return (
        <main>
            <h1>Welcome to RetroQuest</h1>
            <button onClick={() => {
                userManager?.signinRedirect()
            }}>Login
            </button>
            <button onClick={() => {
                userManager?.signoutRedirect()
            }}>Logout
            </button>
        </main>
    );
}