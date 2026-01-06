import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {LandingPage} from "./pages/landing/LandingPage.tsx";
import {UserPage} from "./pages/user/UserPage.tsx";
import {RetroPage} from "./pages/retro/RetroPage.tsx";
import {loader as userLoader} from "./pages/user/userLoader.ts";
import {loader as teamLoader} from "./pages/team/teamLoader.ts";
import {loader as retroLoader} from "./pages/retro/retroLoader.ts";
import {loader as templatesLoader} from "./pages/templates/templatesLoader.ts";
import {loader as inviteLoader} from "./pages/invite/inviteLoader.ts";
import {AuthRedirectPage} from "./pages/auth-redirect/AuthRedirectPage.tsx";
import {Header} from "./components/header/Header.tsx";
import {ThemeProvider} from "./context/theme/ThemeContext.tsx";
import {TemplatesPage} from "./pages/templates/TemplatesPage.tsx";
import {SilentRedirectPage} from "./pages/auth-redirect/SilentRedirectPage.tsx";
import {InvitePage} from "./pages/invite/InvitePage.tsx";
import {TeamPage} from "./pages/team/TeamPage.tsx";

const router = createBrowserRouter([
    {
        path: '/',
        element: <LandingPage/>,
    },
    {
        path: '/auth-redirect',
        element: <AuthRedirectPage/>
    },
    {
        path: '/silent-redirect',
        element: <SilentRedirectPage/>
    },
    {
        path: '/invite',
        element: <InvitePage/>,
        loader: inviteLoader
    },
    {
        path: '/user',
        element: <UserPage/>,
        loader: userLoader
    },
    {
        path: '/teams/:teamId',
        element: <TeamPage/>,
        loader: teamLoader
    },
    {
        path: '/teams/:teamId/retros/:retroId',
        element: <RetroPage/>,
        loader: retroLoader
    },
    {
        path: '/templates',
        element: <TemplatesPage />,
        loader: templatesLoader
    }
]);

function AppContent() {
    return (
        <div className="app">
            <Header/>
            <RouterProvider router={router}/>
        </div>
    );
}

function App() {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
}

export default App;
