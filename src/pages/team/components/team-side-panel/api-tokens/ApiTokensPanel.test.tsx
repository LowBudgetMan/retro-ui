import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {DateTime} from "luxon";
import {Mock} from "vitest";
import {useRevalidator} from "react-router-dom";
import {ApiTokensPanel} from "./ApiTokensPanel.tsx";
import {ApiToken, ApiTokenService} from "../../../../../services/api-token-service/ApiTokenService.ts";

vi.mock("react-router-dom", () => ({
    useRevalidator: vi.fn(),
}));

vi.mock("../../../../../services/api-token-service/ApiTokenService.ts", () => ({
    ApiTokenService: {
        deleteToken: vi.fn(),
        createToken: vi.fn(),
    },
}));

const sampleTokens: ApiToken[] = [
    {
        id: "tok-1",
        name: "Slack",
        tokenPrefix: "retro_pat_abcd",
        scopes: ["read"],
        createdAt: DateTime.fromISO("2026-04-27T00:00:00Z"),
    },
];

describe("ApiTokensPanel", () => {
    const mockRevalidate = vi.fn().mockResolvedValue(undefined);

    beforeEach(() => {
        vi.clearAllMocks();
        (useRevalidator as Mock).mockReturnValue({revalidate: mockRevalidate, state: 'idle'});
    });

    it("renders heading and create button", () => {
        render(<ApiTokensPanel teamId="team-1" tokens={sampleTokens} />);

        expect(screen.getByRole("heading", {name: /api tokens/i})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: /create api token/i})).toBeInTheDocument();
    });

    it("renders each token's name, prefix, and scopes", () => {
        render(<ApiTokensPanel teamId="team-1" tokens={sampleTokens} />);

        expect(screen.getByText("Slack")).toBeInTheDocument();
        expect(screen.getByText(/retro_pat_abcd/)).toBeInTheDocument();
        expect(screen.getByText(/\(read\)/)).toBeInTheDocument();
    });

    it("revokes a token after confirmation and revalidates", async () => {
        const user = userEvent.setup();
        const originalConfirm = window.confirm;
        window.confirm = vi.fn().mockReturnValue(true);
        (ApiTokenService.deleteToken as Mock).mockResolvedValue(undefined);

        render(<ApiTokensPanel teamId="team-1" tokens={sampleTokens} />);
        await user.click(screen.getByRole("button", {name: /revoke/i}));

        expect(window.confirm).toHaveBeenCalled();
        await waitFor(() => expect(ApiTokenService.deleteToken).toHaveBeenCalledWith("team-1", "tok-1"));
        await waitFor(() => expect(mockRevalidate).toHaveBeenCalled());

        window.confirm = originalConfirm;
    });

    it("does not revoke if confirmation is cancelled", async () => {
        const user = userEvent.setup();
        const originalConfirm = window.confirm;
        window.confirm = vi.fn().mockReturnValue(false);

        render(<ApiTokensPanel teamId="team-1" tokens={sampleTokens} />);
        await user.click(screen.getByRole("button", {name: /revoke/i}));

        expect(ApiTokenService.deleteToken).not.toHaveBeenCalled();
        window.confirm = originalConfirm;
    });
});
