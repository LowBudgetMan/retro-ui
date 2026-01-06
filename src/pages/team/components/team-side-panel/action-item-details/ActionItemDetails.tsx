import {ActionItemsList} from "../../../../retro/components/action-items/action-items-list/ActionItemsList.tsx";
import {useActionItems} from "../../../../../context/hooks.tsx";
import accordionStyles from '../Accordion.module.css';

export function ActionItemDetails() {
    const {actionItems} = useActionItems();
    return (
        <details className={accordionStyles.sidePaneAccordion} open={true}>
            <summary className={accordionStyles.sidePaneAccordionHeader}>
                <h2 className={accordionStyles.sidePaneAccordionHeaderTitle}>Action Items</h2>
            </summary>
            <div className={accordionStyles.sidePaneAccordionContent}>
                <ActionItemsList actionItems={actionItems} />
            </div>
        </details>
    )
}