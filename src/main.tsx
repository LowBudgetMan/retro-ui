import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/global.css'
import './styles/colors.css';
import { initializeConfig } from './config/ApiConfig';
import {configureAxios} from "./config/AxiosConfig.ts";

initializeConfig()
    .then(async () => {
        await configureAxios();
        ReactDOM.createRoot(document.getElementById('root')!).render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );
    })
    .catch((error) => {
        console.error('Failed to initialize application:', error);
        // You might want to show an error UI here instead of just logging
        document.body.innerHTML = '<div style="padding: 20px; color: red;">Failed to load application configuration. Please check your connection and refresh the page.</div>';
    })
