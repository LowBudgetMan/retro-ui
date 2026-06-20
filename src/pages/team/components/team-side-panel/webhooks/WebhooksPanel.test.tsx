import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {DateTime} from "luxon";
import {Mock} from "vitest";
import {useRevalidator} from "react-router-dom";
import {WebhooksPanel} from "./WebhooksPanel.tsx";
import {Webhook, WebhookService} from "../../../../../services/webhook-service/WebhookService.ts";

vi.mock("react-router-dom", () => ({
    useRevalidator: vi.fn(),
}));

vi.mock("../../../../../services/webhook-service/WebhookService.ts", () => ({
    WebhookService: {
        deleteWebhook: vi.fn(),
        createWebhook: vi.fn(),
    },
}));

const sampleWebhooks: Webhook[] = [
    {
        id: "wh-1",
        name: "Slack Hook",
        url: "https://hooks.slack.com/test",
        eventTypes: ["action_item.created"],
        createdAt: DateTime.fromISO("2026-04-27T09:00:00Z"),
    },
    {
        id: "wh-2",
        name: "Second Hook",
        url: "https://example.com/hook",
        eventTypes: ["retro.finished"],
        createdAt: DateTime.fromISO("2026-04-25T09:00:00Z"),
    },
];

describe("WebhooksPanel", () => {
    const mockRevalidate = vi.fn().mockResolvedValue(undefined);

    beforeEach(() => {
        vi.clearAllMocks();
        (useRevalidator as Mock).mockReturnValue({revalidate: mockRevalidate, state: 'idle'});
    });

    it("renders heading and create button", () => {
        render(<WebhooksPanel teamId="team-1" webhooks={sampleWebhooks} />);

        expect(screen.getByRole("heading", {name: /webhooks/i})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: /create webhook/i})).toBeInTheDocument();
    });

    it("renders each webhook's name and url", () => {
        render(<WebhooksPanel teamId="team-1" webhooks={sampleWebhooks} />);

        expect(screen.getByText("Slack Hook")).toBeInTheDocument();
        expect(screen.getByText("Second Hook")).toBeInTheDocument();
    });

    it("deletes a webhook after confirmation and revalidates", async () => {
        const user = userEvent.setup();
        const originalConfirm = window.confirm;
        window.confirm = vi.fn().mockReturnValue(true);
        (WebhookService.deleteWebhook as Mock).mockResolvedValue(undefined);

        render(<WebhooksPanel teamId="team-1" webhooks={sampleWebhooks} />);
        await user.click(screen.getAllByRole("button", {name: /delete/i})[0]);

        expect(window.confirm).toHaveBeenCalled();
        await waitFor(() => expect(WebhookService.deleteWebhook).toHaveBeenCalledWith("team-1", "wh-1"));
        await waitFor(() => expect(mockRevalidate).toHaveBeenCalled());

        window.confirm = originalConfirm;
    });

    it("does not delete if confirmation is cancelled", async () => {
        const user = userEvent.setup();
        const originalConfirm = window.confirm;
        window.confirm = vi.fn().mockReturnValue(false);

        render(<WebhooksPanel teamId="team-1" webhooks={sampleWebhooks} />);
        await user.click(screen.getAllByRole("button", {name: /delete/i})[0]);

        expect(WebhookService.deleteWebhook).not.toHaveBeenCalled();
        window.confirm = originalConfirm;
    });
});
