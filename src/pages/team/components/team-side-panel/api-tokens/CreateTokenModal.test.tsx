import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {Mock} from "vitest";
import {useRevalidator} from "react-router-dom";
import {CreateTokenModal} from "./CreateTokenModal.tsx";
import {ApiTokenService} from "../../../../../services/api-token-service/ApiTokenService.ts";

vi.mock("react-router-dom", () => ({
    useRevalidator: vi.fn(),
}));

vi.mock("../../../../../services/api-token-service/ApiTokenService.ts", () => ({
    ApiTokenService: {
        createToken: vi.fn(),
    },
}));

describe("CreateTokenModal", () => {
    const mockRevalidate = vi.fn().mockResolvedValue(undefined);

    beforeEach(() => {
        vi.clearAllMocks();
        (useRevalidator as Mock).mockReturnValue({revalidate: mockRevalidate, state: 'idle'});
    });

    it("renders the form when open", () => {
        render(<CreateTokenModal teamId="team-1" isOpen={true} setIsOpen={vi.fn()} />);

        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByRole("button", {name: /^create$/i})).toBeInTheDocument();
    });

    it("closes when Cancel is clicked", async () => {
        const user = userEvent.setup();
        const setIsOpen = vi.fn();
        render(<CreateTokenModal teamId="team-1" isOpen={true} setIsOpen={setIsOpen} />);

        await user.click(screen.getByRole("button", {name: /cancel/i}));

        expect(setIsOpen).toHaveBeenCalledWith(false);
    });

    it("revalidates after a token is created", async () => {
        (ApiTokenService.createToken as Mock).mockResolvedValue({
            id: "tok-1", name: "Slack", scopes: ["read"], expiresAt: null,
            tokenPrefix: "retro_pat_abcd", token: "retro_pat_fullsecretvalue",
        });
        const user = userEvent.setup();

        render(<CreateTokenModal teamId="team-1" isOpen={true} setIsOpen={vi.fn()} />);
        await user.type(screen.getByLabelText(/name/i), "Slack");
        await user.click(screen.getByLabelText(/^\s*read\s*$/i));
        await user.click(screen.getByRole("button", {name: /^create$/i}));

        await waitFor(() => expect(mockRevalidate).toHaveBeenCalled());
    });
});
