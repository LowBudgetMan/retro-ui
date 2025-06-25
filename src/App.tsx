import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {LandingPage} from "./pages/landing/LandingPage.tsx";
import {UserPage} from "./pages/user/UserPage.tsx";
import {TeamPage} from "./pages/team/TeamPage.tsx";
import {RetroPage} from "./pages/retro/RetroPage.tsx";
import {loader as userLoader} from "./pages/user/userLoader.ts";
import {loader as teamLoader} from "./pages/team/teamLoader.ts";
import {loader as retroLoader} from "./pages/retro/retroLoader.ts";
import {loader as templatesLoader} from "./pages/templates/templatesLoader.ts";
import {AuthRedirectPage} from "./pages/auth-redirect/AuthRedirectPage.tsx";
import {configureAxios} from "./services/AxiosConfig.ts";
import {Header} from "./components/header/Header.tsx";
import {ThemeProvider} from "./styles/ThemeContext.tsx";
import {TemplatesPage} from "./pages/templates/TemplatesPage.tsx";

configureAxios();

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
