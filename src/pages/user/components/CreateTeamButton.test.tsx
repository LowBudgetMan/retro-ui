import { render, screen } from '@testing-library/react';
import { CreateTeamButton } from './CreateTeamButton';
import '@testing-library/jest-dom';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useRevalidator: () => ({
    revalidate: jest.fn().mockResolvedValue(undefined),
    state: 'idle'
  })
}));

// Mock the CreateModal component
jest.mock('../../../components/Modal/CreateModal', () => ({
  CreateModal: ({ buttonContent, buttonClassName, modalContent, backgroundButtonAriaLabel }: any) => (
    <div data-testid="mock-create-modal" data-aria-label={backgroundButtonAriaLabel}>
      <button data-testid="mock-button" className={buttonClassName}>
        {buttonContent}
      </button>
      <div data-testid="modal-content">
        {typeof modalContent === 'function' ? modalContent(() => {}) : modalContent}
      </div>
    </div>
  ),
}));

// Mock the CreateTeamModal component
jest.mock('./CreateTeamModal', () => ({
  CreateTeamModal: ({ isOpen, setIsOpen }: any) => (
    <div data-testid="mock-create-team-modal" data-is-open={isOpen ? 'true' : 'false'}>
      <button data-testid="mock-modal-close-button" onClick={() => setIsOpen(false)}>Close Modal</button>
    </div>
  ),
}));

// TextEncoder and TextDecoder are now mocked globally in setupTests.ts

// Mock the CSS module
jest.mock('../UserPage.module.css', () => ({
  createNewTeamButton: 'mock-create-new-team-button-class',
}));

describe('CreateTeamButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the CreateModal with the correct props', () => {
      render(<CreateTeamButton />);
      
      const createModal = screen.getByTestId('mock-create-modal');
      expect(createModal).toHaveAttribute('data-aria-label', 'Close create team form');
      
      // Button should have the correct class and content
      const button = screen.getByTestId('mock-button');
      expect(button).toHaveClass('mock-create-new-team-button-class');
      expect(button).toHaveTextContent('+');
      
      // Modal content should be the CreateTeamModal
      expect(screen.getByTestId('mock-create-team-modal')).toBeInTheDocument();
    });
  });
});
