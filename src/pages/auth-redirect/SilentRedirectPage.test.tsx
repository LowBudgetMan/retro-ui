import { render } from '@testing-library/react';
import { SilentRedirectPage } from './SilentRedirectPage';
import { userManager } from '../user/UserContext';
import '@testing-library/jest-dom';

// Mock the userManager
jest.mock('../user/UserContext', () => ({
  userManager: {
    signinSilentCallback: jest.fn(),
  },
}));

// Mock console.log to avoid noise in test output
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('SilentRedirectPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  it('should call userManager.signinSilentCallback when component loads', () => {
    const mockSigninSilentCallback = userManager.signinSilentCallback as jest.Mock;
    mockSigninSilentCallback.mockResolvedValue(undefined);

    render(<SilentRedirectPage />);

    expect(mockSigninSilentCallback).toHaveBeenCalledTimes(1);
  });

  it('should render nothing visible when component is loaded', () => {
    const mockSigninSilentCallback = userManager.signinSilentCallback as jest.Mock;
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
