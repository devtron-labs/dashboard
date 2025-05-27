import {
    Button,
    ButtonComponentType,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    Icon,
    useMainContext,
    useTheme,
} from '@devtron-labs/devtron-fe-common-lib'

import { SidePanelDocumentationProps } from './types'

export const SidePanelDocumentation = ({ onClose }: SidePanelDocumentationProps) => {
    // HOOKS
    const { appTheme } = useTheme()
    const {
        sidePanelConfig: { docLink },
    } = useMainContext()

    // CONSTANTS
    const iframeSrc = `${docLink}&theme=${appTheme}`

    return (
        <>
            <div className="px-16 pt-14 pb-13 border__primary--bottom flex dc__gap-12">
                <Icon name="ic-book-open" color="N900" />
                <h2 className="m-0 fs-16 lh-1-5 fw-6 cn-9 flex-grow-1">Documentation</h2>
                <div className="flex dc__gap-8">
                    <Button
                        dataTestId="open-in-new-tab-button"
                        ariaLabel="Open in new tab"
                        icon={<Icon name="ic-arrow-square-out" color={null} />}
                        variant={ButtonVariantType.borderLess}
                        style={ButtonStyleType.neutral}
                        size={ComponentSizeType.xs}
                        component={ButtonComponentType.anchor}
                        anchorProps={{
                            href: docLink,
                        }}
                    />
                    <Button
                        dataTestId="close-side-panel-button"
                        ariaLabel="close-side-panel-button"
                        showAriaLabelInTippy={false}
                        icon={<Icon name="ic-close-large" color={null} />}
                        variant={ButtonVariantType.borderLess}
                        style={ButtonStyleType.negativeGrey}
                        size={ComponentSizeType.xs}
                        onClick={onClose}
                    />
                </div>
            </div>
            <div className="flex-grow-1">
                {docLink && (
                    <iframe
                        key={iframeSrc}
                        title="side-panel-documentation"
                        loading="lazy"
                        className="dc__no-border"
                        src={iframeSrc}
                        width="100%"
                        height="100%"
                        allow="clipboard-read; clipboard-write"
                        sandbox="allow-same-origin allow-scripts"
                        referrerPolicy="no-referrer"
                    />
                )}
            </div>
        </>
    )
}
