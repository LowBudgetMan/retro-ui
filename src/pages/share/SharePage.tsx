import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {ShareLinkService} from "../../services/share-link-service/ShareLinkService.ts";
import {setShareToken} from "../../services/anonymous-auth/AnonymousAuthService.ts";

export function SharePage() {
    const {token} = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            setError("Invalid share link.");
            return;
        }

        ShareLinkService.validateShareLink(token)
            .then(({teamId, retroId}) => {
                setShareToken(token);
                navigate(`/teams/${teamId}/retros/${retroId}`, {replace: true});
            })
            .catch(() => {
                setError("This share link is invalid or has expired.");
            });
    }, [token, navigate]);

    if (error) {
        return <p>{error}</p>;
    }

    return <p>Joining retro...</p>;
}
