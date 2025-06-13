import {
    Button,
    ButtonComponentType,
    ButtonVariantType,
    ComponentSizeType,
    CONTACT_SUPPORT_LINK,
    OPEN_NEW_TICKET,
    SidePanelTab,
} from '@devtron-labs/devtron-fe-common-lib'

export const renderOpenTicketButton = () => (
    <div className="flexbox-col dc__gap-12">
        <Button
            dataTestId="open-ai-integration-ticket"
            size={ComponentSizeType.medium}
            component={ButtonComponentType.anchor}
            text="Open Ticket"
            anchorProps={{
                href: OPEN_NEW_TICKET,
            }}
        />
        <Button
            dataTestId="contact-support"
            component={ButtonComponentType.anchor}
            text="Contact Support"
            anchorProps={{
                href: CONTACT_SUPPORT_LINK,
            }}
            variant={ButtonVariantType.text}
        />
    </div>
)

export const getContentWrapperClassNameForTab = (tab: SidePanelTab, expected: SidePanelTab) =>
    `flexbox-col dc__overflow-hidden ${tab !== expected ? 'side-panel-content--hidden' : 'flex-grow-1'}`
