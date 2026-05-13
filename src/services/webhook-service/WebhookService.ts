import {DateTime} from "luxon";
import {fetchClient} from "../../config/FetchClient";
import {ApiConfig} from "../../config/ApiConfig";

export interface Webhook {
    id: string;
    name: string;
    url: string;
    eventTypes: string[];
    enabled: boolean;
    consecutiveFailures: number;
    lastDeliveryAt: DateTime | null;
    lastFailureAt: DateTime | null;
    lastFailureReason: string | null;
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
    enabled: boolean;
    secret: string;
}

export interface UpdateWebhookRequest {
    name?: string;
    url?: string;
    eventTypes?: string[];
    enabled?: boolean;
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

async function testWebhook(teamId: string, webhookId: string): Promise<void> {
    await fetchClient.post(`${ApiConfig.baseApiUrl()}/api/teams/${teamId}/webhooks/${webhookId}/test`, {});
}

function transform(webhook: Webhook): Webhook {
    return {
        ...webhook,
        createdAt: DateTime.fromISO(webhook.createdAt as unknown as string),
        lastDeliveryAt: webhook.lastDeliveryAt ? DateTime.fromISO(webhook.lastDeliveryAt as unknown as string) : null,
        lastFailureAt: webhook.lastFailureAt ? DateTime.fromISO(webhook.lastFailureAt as unknown as string) : null,
    };
}

export const WebhookService = {
    getWebhooks,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook,
};
