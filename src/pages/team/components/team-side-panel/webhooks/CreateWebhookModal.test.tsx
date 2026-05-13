import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {Mock} from "vitest";
import {useRevalidator} from "react-router-dom";
import {CreateWebhookModal} from "./CreateWebhookModal.tsx";
import {WebhookService} from "../../../../../services/webhook-service/WebhookService.ts";

vi.mock("react-router-dom", () => ({
    useRevalidator: vi.fn(),
}));

vi.mock("../../../../../services/webhook-service/WebhookService.ts", () => ({
    WebhookService: {
        createWebhook: vi.fn(),
    },
}));

describe("CreateWebhookModal", () => {
    const mockRevalidate = vi.fn().mockResolvedValue(undefined);

    beforeEach(() => {
        vi.clearAllMocks();
        (useRevalidator as Mock).mockReturnValue({revalidate: mockRevalidate, state: 'idle'});
    });

    it("renders the form when open", () => {
        render(<CreateWebhookModal teamId="team-1" isOpen={true} setIsOpen={vi.fn()} />);

        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByRole("button", {name: /^create$/i})).toBeInTheDocument();
    });

    it("closes when Cancel is clicked", async () => {
        const user = userEvent.setup();
        const setIsOpen = vi.fn();
        render(<CreateWebhookModal teamId="team-1" isOpen={true} setIsOpen={setIsOpen} />);

        await user.click(screen.getByRole("button", {name: /cancel/i}));

        expect(setIsOpen).toHaveBeenCalledWith(false);
    });

    it("revalidates after a webhook is created", async () => {
        (WebhookService.createWebhook as Mock).mockResolvedValue({
            id: "wh-1", name: "Slack", url: "https://hooks.slack.com",
            eventTypes: ["action_item.created"], enabled: true, secret: "abcdef1234567890",
        });
        const user = userEvent.setup();

        render(<CreateWebhookModal teamId="team-1" isOpen={true} setIsOpen={vi.fn()} />);
        await user.type(screen.getByLabelText(/name/i), "Slack");
        await user.type(screen.getByLabelText(/url/i), "https://hooks.slack.com");
        await user.click(screen.getByLabelText(/action_item\.created/));
        await user.click(screen.getByRole("button", {name: /^create$/i}));

        await waitFor(() => expect(mockRevalidate).toHaveBeenCalled());
    });
});
