import { useEffect, useRef, useState } from 'react'

import {
    Button,
    ButtonComponentType,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    DOCUMENTATION,
    GenericEmptyState,
    getUniqueId,
    Icon,
    ProgressBar,
    SidePanelTab,
    useIsSecureConnection,
    useMainContext,
    useTheme,
} from '@devtron-labs/devtron-fe-common-lib'

import ImgPageBlocked from '@Images/img-page-blocked.webp'

import { SidePanelContentBaseProps } from './types'

const renderButton = (docLink: string) => () => (
    <Button
        dataTestId="open-in-new-tab-button"
        endIcon={<Icon name="ic-arrow-square-out" color={null} />}
        variant={ButtonVariantType.text}
        size={ComponentSizeType.medium}
        component={ButtonComponentType.anchor}
        text="Open in new tab"
        anchorProps={{
            href: docLink,
        }}
    />
)

export const SidePanelDocumentation = ({ SidePanelHeaderActions }: SidePanelContentBaseProps) => {
    // HOOKS
    const { appTheme } = useTheme()
    const {
        sidePanelConfig: { state, docLink: sidePanelDocLink, reinitialize },
        setSidePanelConfig,
    } = useMainContext()
    const isSecureConnection = useIsSecureConnection()

    const [isLoading, setIsLoading] = useState(isSecureConnection)

    const docLink = sidePanelDocLink ?? DOCUMENTATION.DOC_HOME_PAGE

    // REFS
    const iframeRef = useRef<HTMLIFrameElement | null>(null)
    const iframeKeyRef = useRef<string | null>(`${docLink}-${getUniqueId()}`)

    // CONSTANTS
    const iframeSrc = `${docLink}${docLink.includes('?') ? `&theme=${appTheme}` : `?theme=${appTheme}`}`

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

    const onLoad = () => {
        setIsLoading(false)
    }

    return (
        <>
            {state === SidePanelTab.DOCUMENTATION && (
                <SidePanelHeaderActions>
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
                </SidePanelHeaderActions>
            )}

            <div className="flex-grow-1 dc__position-rel">
                <ProgressBar isLoading={isLoading} />

                {isSecureConnection ? (
                    iframeSrc && (
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
                            onLoad={onLoad}
                        />
                    )
                ) : (
                    <GenericEmptyState
                        title="Unable to load docs"
                        subTitle="Your Devtron setup isn’t secure, so the documentation can’t be displayed here."
                        image={ImgPageBlocked}
                        isButtonAvailable
                        renderButton={renderButton(docLink)}
                    />
                )}
            </div>
        </>
    )
}
