import {FormEvent, useState} from "react";
import {WebhookService} from "../../../../../services/webhook-service/WebhookService.ts";
import formStyle from './CreateWebhookForm.module.css';

const VALID_EVENT_TYPES = ["action_item.created", "action_item.updated", "action_item.deleted", "retro.finished"];

interface Props {
    teamId: string;
    onCreated: () => void;
    onClose: () => void;
}

export function CreateWebhookForm({teamId, onCreated, onClose}: Props) {
    const [eventTypes, setEventTypes] = useState<Set<string>>(new Set());
    const [createdSecret, setCreatedSecret] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const toggleEventType = (type: string) => {
        const next = new Set(eventTypes);
        if (next.has(type)) {
            next.delete(type);
        } else {
            next.add(type);
        }
        setEventTypes(next);
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (eventTypes.size === 0) {
            setError("Select at least one event type");
            return;
        }
        const form = e.target as HTMLFormElement;
        const nameInput = form.elements.namedItem('name') as HTMLInputElement;
        const urlInput = form.elements.namedItem('url') as HTMLInputElement;
        const url = urlInput.value;
        if (!url.startsWith("https://")) {
            setError("URL must start with https://");
            return;
        }
        WebhookService.createWebhook(teamId, {name: nameInput.value, url, eventTypes: Array.from(eventTypes)})
            .then(result => {
                setCreatedSecret(result.secret);
                onCreated();
            })
            .catch(() => setError("Failed to create webhook"));
    };

    if (createdSecret) {
        return (
            <div className={formStyle.form}>
                <h3>Webhook created</h3>
                <p className={formStyle.warning}>Save this secret now — you won&apos;t see it again.</p>
                <pre className={formStyle.secretBlock}>{createdSecret}</pre>
                <div className={formStyle.buttonsContainer}>
                    <button type="button" onClick={() => navigator.clipboard.writeText(createdSecret)}>Copy</button>
                    <button type="button" onClick={onClose}>Done</button>
                </div>
            </div>
        );
    }

    return (
        <form className={formStyle.form} onSubmit={handleSubmit} onReset={onClose} role="form">
            <p className={formStyle.explanationText}>Create a webhook to receive event notifications.</p>
            <label>
                Name
                <input id="name" name="name" type="text" placeholder="e.g. Slack notifications" required />
            </label>
            <label>
                URL
                <input id="url" name="url" type="url" placeholder="https://example.com/webhook" required />
            </label>
            <fieldset>
                <legend>Event types</legend>
                <div className={formStyle.eventTypeRow}>
                    {VALID_EVENT_TYPES.map(type => (
                        <label key={type}><input type="checkbox" onChange={() => toggleEventType(type)} /> {type}</label>
                    ))}
                </div>
            </fieldset>
            {error && <p role="alert" className={formStyle.error}>{error}</p>}
            <div className={formStyle.buttonsContainer}>
                <button type="reset">Cancel</button>
                <button type="submit">Create</button>
            </div>
        </form>
    );
}
