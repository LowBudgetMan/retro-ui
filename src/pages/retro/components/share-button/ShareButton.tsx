import {fetchClient} from "../../../../config/FetchClient";
import {ApiConfig} from "../../../../config/ApiConfig.ts";
import {useToasts} from "../../../../context/hooks.tsx";
import {ToastType} from "../../../../context/toast/ToastContextTypes.ts";

interface Props {
    teamId: string;
    retroId: string;
}

export function ShareButton({teamId, retroId}: Props) {
    const {queueToast} = useToasts();

    const handleClick = async () => {
        const response = await fetchClient.post<{token: string}>(
            `${ApiConfig.baseApiUrl()}/api/teams/${teamId}/retros/${retroId}/share-tokens`
        );
        const token = response.data.token;
        const shareUrl = `${window.location.origin}/share/${token}`;
        try {
            await window.navigator.clipboard.writeText(shareUrl);
            queueToast({message: "Copied share link to clipboard", type: ToastType.SUCCESS});
        } catch (err) {
            queueToast({message: "Failed to copy share link", type: ToastType.FAILURE});
            console.error('Failed to copy share link: ', err);
        }
    };

    return (
        <button className="share-btn" onClick={handleClick}>Share</button>
    );
}
