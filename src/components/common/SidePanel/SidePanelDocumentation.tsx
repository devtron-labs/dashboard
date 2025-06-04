import { useRef } from 'react'

import {
    Button,
    ButtonComponentType,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    DOCUMENTATION,
    Icon,
    useMainContext,
    useTheme,
} from '@devtron-labs/devtron-fe-common-lib'

import { SidePanelContentBaseProps } from './types'

export const SidePanelDocumentation = ({ SidePanelHeaderActions }: SidePanelContentBaseProps) => {
    // HOOKS
    const { appTheme } = useTheme()
    const {
        sidePanelConfig: { docLink = DOCUMENTATION.DOC_HOME_PAGE },
    } = useMainContext()

    // REFS
    const iframeRef = useRef<HTMLIFrameElement | null>(null)

    // CONSTANTS
    const iframeSrc = `${docLink}&theme=${appTheme}`

    return (
        <>
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

            <div className="flex-grow-1">
                {docLink && (
                    <iframe
                        key={iframeSrc}
                        ref={iframeRef}
                        title="side-panel-documentation"
                        loading="lazy"
                        className="dc__no-border"
                        src={iframeSrc}
                        width="100%"
                        height="100%"
                        allow="clipboard-read; clipboard-write"
                        sandbox="allow-same-origin allow-scripts allow-popups"
                        referrerPolicy="no-referrer"
                    />
                )}
            </div>
        </>
    )
}
