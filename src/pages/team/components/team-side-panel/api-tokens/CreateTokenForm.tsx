import {FormEvent, useState} from "react";
import {ApiTokenService} from "../../../../../services/api-token-service/ApiTokenService.ts";
import formStyle from './CreateTokenForm.module.css';

interface Props {
    teamId: string;
    onCreated: () => void;
    onClose: () => void;
}

export function CreateTokenForm({teamId, onCreated, onClose}: Props) {
    const [scopes, setScopes] = useState<Set<string>>(new Set());
    const [createdToken, setCreatedToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const toggleScope = (scope: string) => {
        const next = new Set(scopes);
        if (next.has(scope)) {
            next.delete(scope);
        } else {
            next.add(scope);
        }
        setScopes(next);
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (scopes.size === 0) {
            setError("Select at least one scope");
            return;
        }
        const form = e.target as HTMLFormElement;
        const nameInput = form.elements.namedItem('name') as HTMLInputElement;
        ApiTokenService.createToken(teamId, {name: nameInput.value, scopes: Array.from(scopes)})
            .then(result => {
                setCreatedToken(result.token);
                onCreated();
            })
            .catch(() => setError("Failed to create token"));
    };

    const handleDone = () => {
        onClose();
    };

    if (createdToken) {
        return (
            <div className={formStyle.form}>
                <h3>Token created</h3>
                <p className={formStyle.warning}>Save this token now — you won&apos;t see it again.</p>
                <pre className={formStyle.secretBlock}>{createdToken}</pre>
                <div className={formStyle.buttonsContainer}>
                    <button type="button" onClick={() => navigator.clipboard.writeText(createdToken)}>Copy</button>
                    <button type="button" onClick={handleDone}>Done</button>
                </div>
            </div>
        );
    }

    return (
        <form className={formStyle.form} onSubmit={handleSubmit} onReset={onClose} role="form">
            <p className={formStyle.explanationText}>Create an API token for external integrations.</p>
            <label>
                Name
                <input id="name" name="name" type="text" placeholder="e.g. Slack bot" required />
            </label>
            <fieldset>
                <legend>Scopes</legend>
                <div className={formStyle.scopeRow}>
                    <label><input type="checkbox" onChange={() => toggleScope("read")} /> read</label>
                    <label><input type="checkbox" onChange={() => toggleScope("write")} /> write</label>
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
