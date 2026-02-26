import axios from "axios";
import {ApiConfig} from "../../../../config/ApiConfig.ts";
import {useState} from "react";

interface Props {
    teamId: string;
    retroId: string;
}

export function ShareButton({teamId, retroId}: Props) {
    const [copied, setCopied] = useState(false);

    const handleClick = async () => {
        const response = await axios.post(
            `${ApiConfig.baseApiUrl()}/api/teams/${teamId}/retros/${retroId}/share-tokens`
        );
        const token = response.data.token;
        const shareUrl = `${window.location.origin}/share/${token}`;
        try {
            await window.navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy share link: ', err);
        }
    };

    return (
        <button onClick={handleClick}>
            {copied ? "Copied!" : "Share"}
        </button>
    );
}
