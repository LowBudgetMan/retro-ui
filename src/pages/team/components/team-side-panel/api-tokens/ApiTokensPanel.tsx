import {useState} from "react";
import {useRevalidator} from "react-router-dom";
import {ApiToken, ApiTokenService} from "../../../../../services/api-token-service/ApiTokenService.ts";
import accordionStyles from '../Accordion.module.css';
import {CreateTokenModal} from "./CreateTokenModal.tsx";

interface Props {
    teamId: string;
    tokens: ApiToken[];
}

export function ApiTokensPanel({teamId, tokens}: Props) {
    const revalidator = useRevalidator();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleRevoke = async (tokenId: string) => {
        if (!window.confirm("Revoke this token? Integrations using it will stop working.")) return;
        await ApiTokenService.deleteToken(teamId, tokenId);
        revalidator.revalidate();
    };

    return (
        <details className={accordionStyles.sidePaneAccordion}>
            <summary className={accordionStyles.sidePaneAccordionHeader}>
                <h2 className={accordionStyles.sidePaneAccordionHeaderTitle}>API tokens</h2>
            </summary>
            <div className={accordionStyles.sidePaneAccordionContent}>
                <button onClick={() => setIsModalOpen(true)}>Create API token</button>
                <ol>
                    {tokens.map((token) => (
                        <li key={token.id}>
                            <strong>{token.name}</strong>
                            <span> — {token.tokenPrefix}…</span>
                            <span> ({token.scopes.join(", ")})</span>
<button onClick={() => handleRevoke(token.id)}>Revoke</button>
                        </li>
                    ))}
                </ol>
                <CreateTokenModal teamId={teamId} isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
            </div>
        </details>
    );
}
