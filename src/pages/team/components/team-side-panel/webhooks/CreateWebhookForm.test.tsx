import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {Mock} from "vitest";
import {CreateWebhookForm} from "./CreateWebhookForm.tsx";
import {WebhookService} from "../../../../../services/webhook-service/WebhookService.ts";

vi.mock("../../../../../services/webhook-service/WebhookService.ts", () => ({
    WebhookService: {
        createWebhook: vi.fn(),
    },
}));

describe("CreateWebhookForm", () => {
    beforeEach(() => vi.clearAllMocks());

    it("submits with name, url and selected event types, then shows the secret once", async () => {
        (WebhookService.createWebhook as Mock).mockResolvedValue({
            id: "wh-1", name: "Slack", url: "https://hooks.slack.com/test",
            eventTypes: ["action_item.created"], secret: "abcdef1234567890",
        });
        const user = userEvent.setup();
        const onCreated = vi.fn();
        const onClose = vi.fn();

        render(<CreateWebhookForm teamId="team-1" onCreated={onCreated} onClose={onClose} />);
        await user.type(screen.getByLabelText(/name/i), "Slack");
        await user.type(screen.getByLabelText(/url/i), "https://hooks.slack.com/test");
        await user.click(screen.getByLabelText(/action_item\.created/));
        await user.click(screen.getByRole("button", {name: /create/i}));

        await waitFor(() => expect(screen.getByText("abcdef1234567890")).toBeVisible());
        expect(screen.getByText(/won't see it again/i)).toBeVisible();
        expect(onCreated).toHaveBeenCalled();
        expect(WebhookService.createWebhook).toHaveBeenCalledWith("team-1", {
            name: "Slack", url: "https://hooks.slack.com/test", eventTypes: ["action_item.created"],
        });
    });

    it("requires at least one event type and surfaces the error", async () => {
        const user = userEvent.setup();
        render(<CreateWebhookForm teamId="team-1" onCreated={vi.fn()} onClose={vi.fn()} />);

        await user.type(screen.getByLabelText(/name/i), "Test");
        await user.type(screen.getByLabelText(/url/i), "https://example.com");
        await user.click(screen.getByRole("button", {name: /create/i}));

        expect(WebhookService.createWebhook).not.toHaveBeenCalled();
        expect(screen.getByRole("alert")).toHaveTextContent(/at least one event type/i);
    });

    it("calls onClose when Cancel is clicked", async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        render(<CreateWebhookForm teamId="team-1" onCreated={vi.fn()} onClose={onClose} />);

        await user.click(screen.getByRole("button", {name: /cancel/i}));

        expect(onClose).toHaveBeenCalled();
    });

    it("calls onClose when Done is clicked after creation", async () => {
        (WebhookService.createWebhook as Mock).mockResolvedValue({
            id: "wh-1", name: "Slack", url: "https://hooks.slack.com",
            eventTypes: ["action_item.created"], secret: "abcdef1234567890",
        });
        const user = userEvent.setup();
        const onClose = vi.fn();

        render(<CreateWebhookForm teamId="team-1" onCreated={vi.fn()} onClose={onClose} />);
        await user.type(screen.getByLabelText(/name/i), "Slack");
        await user.type(screen.getByLabelText(/url/i), "https://hooks.slack.com");
        await user.click(screen.getByLabelText(/action_item\.created/));
        await user.click(screen.getByRole("button", {name: /create/i}));
        await waitFor(() => expect(screen.getByText("abcdef1234567890")).toBeVisible());
        await user.click(screen.getByRole("button", {name: /done/i}));

        expect(onClose).toHaveBeenCalled();
    });
});
