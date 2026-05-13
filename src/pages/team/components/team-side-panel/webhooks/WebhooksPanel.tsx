import {useState} from "react";
import {useRevalidator} from "react-router-dom";
import {Webhook, WebhookService} from "../../../../../services/webhook-service/WebhookService.ts";
import accordionStyles from '../Accordion.module.css';
import {CreateWebhookModal} from "./CreateWebhookModal.tsx";

interface Props {
    teamId: string;
    webhooks: Webhook[];
}

export function WebhooksPanel({teamId, webhooks}: Props) {
    const revalidator = useRevalidator();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDelete = async (webhookId: string) => {
        if (!window.confirm("Delete this webhook? It will stop receiving events.")) return;
        await WebhookService.deleteWebhook(teamId, webhookId);
        revalidator.revalidate();
    };

    return (
        <details className={accordionStyles.sidePaneAccordion}>
            <summary className={accordionStyles.sidePaneAccordionHeader}>
                <h2 className={accordionStyles.sidePaneAccordionHeaderTitle}>Webhooks</h2>
            </summary>
            <div className={accordionStyles.sidePaneAccordionContent}>
                <button onClick={() => setIsModalOpen(true)}>Create webhook</button>
                <ol>
                    {webhooks.map((webhook) => (
                        <li key={webhook.id}>
                            <strong>{webhook.name}</strong>
                            <span> — {webhook.url}</span>
                            <span> ({webhook.eventTypes.join(", ")})</span>
                            <span> — {webhook.enabled ? "Active" : "Disabled"}</span>
                            {webhook.lastFailureReason && <span> — Last error: {webhook.lastFailureReason}</span>}
                            <button onClick={() => handleDelete(webhook.id)}>Delete</button>
                        </li>
                    ))}
                </ol>
                <CreateWebhookModal teamId={teamId} isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
            </div>
        </details>
    );
}
