import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {Mock} from "vitest";
import {CreateTokenForm} from "./CreateTokenForm.tsx";
import {ApiTokenService} from "../../../../../services/api-token-service/ApiTokenService.ts";

vi.mock("../../../../../services/api-token-service/ApiTokenService.ts", () => ({
    ApiTokenService: {
        createToken: vi.fn(),
    },
}));

describe("CreateTokenForm", () => {
    beforeEach(() => vi.clearAllMocks());

    it("submits with name and selected scopes, then shows the secret once", async () => {
        (ApiTokenService.createToken as Mock).mockResolvedValue({
            id: "tok-1", name: "Slack", scopes: ["read"],
            tokenPrefix: "retro_pat_abcd", token: "retro_pat_fullsecretvalue",
        });
        const user = userEvent.setup();
        const onCreated = vi.fn();
        const onClose = vi.fn();

        render(<CreateTokenForm teamId="team-1" onCreated={onCreated} onClose={onClose} />);
        await user.type(screen.getByLabelText(/name/i), "Slack");
        await user.click(screen.getByLabelText(/^\s*read\s*$/i));
        await user.click(screen.getByRole("button", {name: /create/i}));

        await waitFor(() => expect(screen.getByText("retro_pat_fullsecretvalue")).toBeVisible());
        expect(screen.getByText(/won't see it again/i)).toBeVisible();
        expect(onCreated).toHaveBeenCalled();
        expect(ApiTokenService.createToken).toHaveBeenCalledWith("team-1", {name: "Slack", scopes: ["read"]});
    });

    it("requires at least one scope and surfaces the error", async () => {
        const user = userEvent.setup();
        render(<CreateTokenForm teamId="team-1" onCreated={vi.fn()} onClose={vi.fn()} />);

        await user.type(screen.getByLabelText(/name/i), "Slack");
        await user.click(screen.getByRole("button", {name: /create/i}));

        expect(ApiTokenService.createToken).not.toHaveBeenCalled();
        expect(screen.getByRole("alert")).toHaveTextContent(/at least one scope/i);
    });

    it("calls onClose when Cancel is clicked", async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        render(<CreateTokenForm teamId="team-1" onCreated={vi.fn()} onClose={onClose} />);

        await user.click(screen.getByRole("button", {name: /cancel/i}));

        expect(onClose).toHaveBeenCalled();
    });

    it("calls onClose when Done is clicked after creation", async () => {
        (ApiTokenService.createToken as Mock).mockResolvedValue({
            id: "tok-1", name: "Slack", scopes: ["read"],
            tokenPrefix: "retro_pat_abcd", token: "retro_pat_fullsecretvalue",
        });
        const user = userEvent.setup();
        const onClose = vi.fn();

        render(<CreateTokenForm teamId="team-1" onCreated={vi.fn()} onClose={onClose} />);
        await user.type(screen.getByLabelText(/name/i), "Slack");
        await user.click(screen.getByLabelText(/^\s*read\s*$/i));
        await user.click(screen.getByRole("button", {name: /create/i}));
        await waitFor(() => expect(screen.getByText("retro_pat_fullsecretvalue")).toBeVisible());
        await user.click(screen.getByRole("button", {name: /done/i}));

        expect(onClose).toHaveBeenCalled();
    });
});
