import { render, screen, fireEvent } from '@testing-library/react';
import { CreateRetroFormOption } from './CreateRetroFormOption';
import { Template } from '../../../services/RetroService';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

jest.mock('./CreateRetroFormOption.module.css', () => ({
  option: 'mock-option-class',
  displayContent: 'mock-display-content-class',
  title: 'mock-title-class',
  actionsContainer: 'mock-actions-container-class',
  moreInfo: 'mock-more-info-class',
  selectButton: 'mock-select-button-class',
}));

jest.mock('../../../components/category-list/CategoryList.tsx', () => ({
  CategoryList: ({ categories }: any) => (
    <div data-testid="category-list">
      {categories.map((category: any) => (
        <span key={category.name} data-testid={`category-${category.name}`}>
          {category.name}
        </span>
      ))}
    </div>
  ),
}));

describe('CreateRetroFormOption', () => {
  const mockTemplate: Template = {
    id: 'template-123',
    name: 'Start Stop Continue',
    description: 'Classic retrospective format',
    categories: [
      {
        name: 'Start',
        position: 0,
        lightBackgroundColor: '#e8f5e8',
        lightTextColor: '#2d5a2d',
        darkBackgroundColor: '#1a3d1a',
        darkTextColor: '#90ee90'
      },
      {
        name: 'Stop',
        position: 1,
        lightBackgroundColor: '#ffe8e8',
        lightTextColor: '#5a2d2d',
        darkBackgroundColor: '#3d1a1a',
        darkTextColor: '#ff9090'
      },
      {
        name: 'Continue',
        position: 2,
        lightBackgroundColor: '#e8e8ff',
        lightTextColor: '#2d2d5a',
        darkBackgroundColor: '#1a1a3d',
        darkTextColor: '#9090ff'
      }
    ]
  };

  const mockSelectionCallback = jest.fn();

  const defaultProps = {
    template: mockTemplate,
    selectionCallback: mockSelectionCallback
  };

  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the correct title', () => {
    renderWithRouter(<CreateRetroFormOption {...defaultProps} />);

    const title = screen.getByRole('heading', { level: 3 });
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('Start Stop Continue');
  });

  it('should display the list of categories', () => {
    renderWithRouter(<CreateRetroFormOption {...defaultProps} />);

    const categoryList = screen.getByTestId('category-list');
    expect(categoryList).toBeInTheDocument();

    expect(screen.getByTestId('category-Start')).toBeInTheDocument();
    expect(screen.getByTestId('category-Stop')).toBeInTheDocument();
    expect(screen.getByTestId('category-Continue')).toBeInTheDocument();
  });

  it('should navigate to the correct endpoint with the id value included', () => {
    renderWithRouter(<CreateRetroFormOption {...defaultProps} />);

    const learnMoreLink = screen.getByRole('link', { name: 'Learn more' });
    expect(learnMoreLink).toHaveAttribute('href', '/templates#template-123');
  });

  it('should open in a new tab', () => {
    renderWithRouter(<CreateRetroFormOption {...defaultProps} />);

    const learnMoreLink = screen.getByRole('link', { name: 'Learn more' });
    expect(learnMoreLink).toHaveAttribute('target', '_blank');
  });

  it('should call the provided selectionCallback when clicked', () => {
    renderWithRouter(<CreateRetroFormOption {...defaultProps} />);

    const selectButton = screen.getByRole('button', { name: 'Use this template' });
    fireEvent.click(selectButton);

    expect(mockSelectionCallback).toHaveBeenCalledTimes(1);
    expect(mockSelectionCallback).toHaveBeenCalledWith('template-123');
  });

  it('should pass the template categories to CategoryList component', () => {
    renderWithRouter(<CreateRetroFormOption {...defaultProps} />);

    const categoryList = screen.getByTestId('category-list');
    expect(categoryList).toBeInTheDocument();

    // Verify all categories are passed
    expect(screen.getByTestId('category-Start')).toHaveTextContent('Start');
    expect(screen.getByTestId('category-Stop')).toHaveTextContent('Stop');
    expect(screen.getByTestId('category-Continue')).toHaveTextContent('Continue');
  });
});
