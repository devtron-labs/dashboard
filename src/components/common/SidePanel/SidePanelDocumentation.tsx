import { useEffect, useRef } from 'react'

import {
    Button,
    ButtonComponentType,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    getUniqueId,
    Icon,
    useMainContext,
    useTheme,
} from '@devtron-labs/devtron-fe-common-lib'

import { SidePanelDocumentationProps } from './types'

export const SidePanelDocumentation = ({ onClose }: SidePanelDocumentationProps) => {
    // HOOKS
    const { appTheme } = useTheme()
    const {
        sidePanelConfig: { docLink, reinitialize },
        setSidePanelConfig,
    } = useMainContext()

    // REFS
    const iframeRef = useRef<HTMLIFrameElement | null>(null)
    const iframeKeyRef = useRef<string | null>(`${docLink}-${getUniqueId()}`)

    // CONSTANTS
    const iframeSrc = docLink
        ? `${docLink}${docLink.includes('?') ? `&theme=${appTheme}` : `?theme=${appTheme}`}`
        : null

    useEffect(() => {
        /**
         * Reinitializes the iframe when the reinitialize flag is set to true. \
         * This is needed to reload the iframe content whenever doc link is clicked (reinitialize is set to true). \
         * It generates a new unique key for the iframe which forces React to recreate it.
         */
        if (reinitialize) {
            iframeKeyRef.current = `${docLink}-${getUniqueId()}`
            setSidePanelConfig((prev) => ({ ...prev, reinitialize: false }))
        }
    }, [reinitialize])

    return (
        <>
            <div className="side-panel-documentation__header px-16 pt-12 pb-11 border__primary--bottom flex dc__gap-12">
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
                {iframeSrc && (
                    <iframe
                        key={iframeKeyRef.current}
                        ref={iframeRef}
                        title="side-panel-documentation"
                        loading="lazy"
                        className="dc__no-border"
                        src={iframeSrc}
                        width="100%"
                        height="100%"
                        allow="clipboard-read; clipboard-write"
                        referrerPolicy="strict-origin-when-cross-origin"
                    />
                )}
            </div>
        </>
    )
}
