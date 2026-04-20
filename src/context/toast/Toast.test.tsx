import {render, screen} from "@testing-library/react";
import {Toast as ToastValue, ToastType} from './ToastContextTypes'
import {Toast} from "./Toast";

describe('Toast', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('when component is passed a toast value', () => {
        const expected: ToastValue = {message: 'This is a test toast', type: ToastType.INFO}
        it('should display the passed content', () => {
            render(<Toast content={expected} closeToast={vi.fn()}/>)
            expect(screen.getByText(expected.message)).toBeInTheDocument();
        });

        it.each([
            [ToastType.INFO, 'Info'],
            [ToastType.FAILURE, 'Error'],
            [ToastType.SUCCESS, 'Success'],
            [ToastType.WARNING, 'Warning']
        ])('should display an icon related to the toast type', (toastType, expectedTitle) => {
            render(<Toast content={{...expected, type: toastType}} closeToast={vi.fn()}/>)
            expect(screen.getByTitle(expectedTitle)).toBeInTheDocument();
        });
    });

    it('should not dequeue the toast until the timeout expires', () => {
        const toast: ToastValue = {message: 'This is a test toast', type: ToastType.INFO}
        const closeToast = vi.fn();
        render(<Toast content={toast} closeToast={closeToast}/>);
        expect(closeToast).not.toHaveBeenCalled();
    });

    it('should dequeue the toast after the timeout expires', () => {
        const toast: ToastValue = {message: 'This is a test toast', type: ToastType.INFO}
        const closeToast = vi.fn();
        render(<Toast content={toast} closeToast={closeToast}/>);
        vi.runOnlyPendingTimers();
        expect(closeToast).toHaveBeenCalled();
    });
});