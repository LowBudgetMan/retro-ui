import { render } from '@testing-library/react';
import { SilentRedirectPage } from './SilentRedirectPage';
import { userManager } from '../user/UserContext';
import '@testing-library/jest-dom';

// Mock the userManager
vi.mock('../user/UserContext', () => ({
    userManager: {
        signinSilentCallback: vi.fn(),
  },
}));

// Mock console.log to avoid noise in test output
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

describe('SilentRedirectPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  it('should call userManager.signinSilentCallback when component loads', () => {
    const mockSigninSilentCallback = userManager.signinSilentCallback as any;
    mockSigninSilentCallback.mockResolvedValue(undefined);

    render(<SilentRedirectPage />);

    expect(mockSigninSilentCallback).toHaveBeenCalledTimes(1);
  });

  it('should render nothing visible when component is loaded', () => {
    const mockSigninSilentCallback = userManager.signinSilentCallback as any;
    mockSigninSilentCallback.mockResolvedValue(undefined);

    const { container } = render(<SilentRedirectPage />);

    // Check that the div has display: none style
    const hiddenDiv = container.querySelector('div');
    expect(hiddenDiv).toBeInTheDocument();
    expect(hiddenDiv).toHaveStyle({ display: 'none' });
    
    // Verify no visible text content
    expect(container).toHaveTextContent('');
  });
});
