import {DateTime} from "luxon";
import {fetchClient} from "../../config/FetchClient";
import {ApiConfig} from "../../config/ApiConfig";

export interface Webhook {
    id: string;
    name: string;
    url: string;
    eventTypes: string[];
    createdAt: DateTime;
}

export interface CreateWebhookRequest {
    name: string;
    url: string;
    eventTypes: string[];
}

export interface CreateWebhookResponse {
    id: string;
    name: string;
    url: string;
    eventTypes: string[];
    secret: string;
}

export interface UpdateWebhookRequest {
    name?: string;
    url?: string;
    eventTypes?: string[];
}

async function getWebhooks(teamId: string): Promise<Webhook[]> {
    return fetchClient.get<Webhook[]>(`${ApiConfig.baseApiUrl()}/api/teams/${teamId}/webhooks`)
        .then(response => response.data.map(transform));
}

async function createWebhook(teamId: string, request: CreateWebhookRequest): Promise<CreateWebhookResponse> {
    return fetchClient.post<CreateWebhookResponse>(`${ApiConfig.baseApiUrl()}/api/teams/${teamId}/webhooks`, request)
        .then(response => response.data);
}

async function updateWebhook(teamId: string, webhookId: string, request: UpdateWebhookRequest): Promise<void> {
    await fetchClient.put(`${ApiConfig.baseApiUrl()}/api/teams/${teamId}/webhooks/${webhookId}`, request);
}

async function deleteWebhook(teamId: string, webhookId: string): Promise<void> {
    await fetchClient.delete(`${ApiConfig.baseApiUrl()}/api/teams/${teamId}/webhooks/${webhookId}`);
}

function transform(webhook: Webhook): Webhook {
    return {
        ...webhook,
        createdAt: DateTime.fromISO(webhook.createdAt as unknown as string),
    };
}

export const WebhookService = {
    getWebhooks,
    createWebhook,
    updateWebhook,
    deleteWebhook,
};
