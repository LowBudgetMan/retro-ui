import {render} from '@testing-library/react';
import {SilentRedirectPage} from './SilentRedirectPage';
import {getUserManager} from '../user/UserContext';
import '@testing-library/jest-dom';
import {UserManager} from "oidc-client-ts";
import {Mock} from "vitest";

const mockUserManager = {
    signinSilentCallback: vi.fn(),
} as unknown as UserManager;

vi.mock('../user/UserContext', () => ({
    getUserManager: vi.fn(),
}));

vi.mocked(getUserManager).mockReturnValue(mockUserManager);

const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {
});

describe('SilentRedirectPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (mockUserManager.signinSilentCallback as Mock).mockResolvedValue(undefined);
    });

    afterAll(() => {
        mockConsoleLog.mockRestore();
    });

    it('should call userManager.signinSilentCallback when component loads', () => {
        (mockUserManager.signinSilentCallback as Mock).mockResolvedValue(undefined);

        render(<SilentRedirectPage/>);

        expect(mockUserManager.signinSilentCallback).toHaveBeenCalledTimes(1);
    });

    it('should render nothing visible when component is loaded', () => {
        (mockUserManager.signinSilentCallback as Mock).mockResolvedValue(undefined);

        const {container} = render(<SilentRedirectPage/>);

        const hiddenDiv = container.querySelector('div');
        expect(hiddenDiv).toBeInTheDocument();
        expect(hiddenDiv).toHaveStyle({display: 'none'});
        expect(container).toHaveTextContent('');
    });
});
