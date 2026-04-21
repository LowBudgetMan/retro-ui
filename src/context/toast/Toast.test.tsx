import {act, fireEvent, render, screen} from "@testing-library/react";
import {Toast as ToastValue, ToastType} from './ToastContextTypes'
import {Toast} from "./Toast";

describe('Toast', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const defaultToast: ToastValue = {message: 'This is a test toast', type: ToastType.INFO};

    describe('when component is passed a toast value', () => {
        it('should display the passed content', () => {
            render(<Toast content={defaultToast} closeToast={vi.fn()}/>)
            expect(screen.getByText(defaultToast.message)).toBeInTheDocument();
        });

        it.each([
            [ToastType.INFO, 'Info'],
            [ToastType.FAILURE, 'Error'],
            [ToastType.SUCCESS, 'Success'],
            [ToastType.WARNING, 'Warning']
        ])('should display an icon related to the toast type', (toastType, expectedTitle) => {
            render(<Toast content={{...defaultToast, type: toastType}} closeToast={vi.fn()}/>)
            expect(screen.getByTitle(expectedTitle)).toBeInTheDocument();
        });
    });

    it('should render with the entrance animation class on mount', () => {
        const {container} = render(<Toast content={defaultToast} closeToast={vi.fn()}/>);
        const toastEl = container.firstChild as HTMLElement;
        expect(toastEl.className).toContain('container');
        expect(toastEl.className).not.toContain('exiting');
    });

    it('should not dequeue the toast until the timeout expires', () => {
        const closeToast = vi.fn();
        render(<Toast content={defaultToast} closeToast={closeToast}/>);
        expect(closeToast).not.toHaveBeenCalled();
    });

    it('should apply the exit animation class after the timeout expires', () => {
        const closeToast = vi.fn();
        const {container} = render(<Toast content={defaultToast} closeToast={closeToast}/>);
        act(() => {
            vi.runOnlyPendingTimers();
        });
        const toastEl = container.firstChild as HTMLElement;
        expect(toastEl.className).toContain('exiting');
        expect(closeToast).not.toHaveBeenCalled();
    });

    it('should dequeue the toast when the exit animation ends', () => {
        const closeToast = vi.fn();
        const {container} = render(<Toast content={defaultToast} closeToast={closeToast}/>);
        act(() => {
            vi.runOnlyPendingTimers();
        });
        fireEvent.animationEnd(container.firstChild as HTMLElement);
        expect(closeToast).toHaveBeenCalled();
    });

    it('should not dequeue the toast when the entrance animation ends', () => {
        const closeToast = vi.fn();
        const {container} = render(<Toast content={defaultToast} closeToast={closeToast}/>);
        fireEvent.animationEnd(container.firstChild as HTMLElement);
        expect(closeToast).not.toHaveBeenCalled();
    });

    it('should cancel the display timer when unmounted before it expires', () => {
        const closeToast = vi.fn();
        const {unmount} = render(<Toast content={defaultToast} closeToast={closeToast}/>);
        unmount();
        act(() => {
            vi.runOnlyPendingTimers();
        });
        expect(closeToast).not.toHaveBeenCalled();
    });
});
