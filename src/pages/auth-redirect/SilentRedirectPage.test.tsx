import {render} from '@testing-library/react';
import {SilentRedirectPage} from './SilentRedirectPage';
import {userManager} from '../user/UserContext';
import '@testing-library/jest-dom';
import {Mock} from "vitest";

vi.mock('../user/UserContext', () => ({
    userManager: {
        signinSilentCallback: vi.fn(),
  },
}));

const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

describe('SilentRedirectPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  it('should call userManager.signinSilentCallback when component loads', () => {
      (userManager.signinSilentCallback as Mock).mockResolvedValue(undefined);

    render(<SilentRedirectPage />);

    expect(userManager.signinSilentCallback).toHaveBeenCalledTimes(1);
  });

  it('should render nothing visible when component is loaded', () => {
      (userManager.signinSilentCallback as Mock).mockResolvedValue(undefined);

    const { container } = render(<SilentRedirectPage />);

    const hiddenDiv = container.querySelector('div');
    expect(hiddenDiv).toBeInTheDocument();
    expect(hiddenDiv).toHaveStyle({ display: 'none' });
    expect(container).toHaveTextContent('');
  });
});
