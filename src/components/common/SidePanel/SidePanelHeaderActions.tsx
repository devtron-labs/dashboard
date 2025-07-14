import { PropsWithChildren, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { logExceptionToSentry } from '@devtron-labs/devtron-fe-common-lib'

export const SidePanelHeaderActions = ({ children }: PropsWithChildren<{}>) => {
    const [hasComponentRenderedOnce, setHasComponentRenderedOnce] = useState(false)

    useEffect(() => {
        setHasComponentRenderedOnce(true)
    }, [])

    if (!hasComponentRenderedOnce) {
        return null
    }

    const targetElement = document.getElementById('devtron-side-panel-actions')

    if (!targetElement) {
        logExceptionToSentry('SidePanelHeaderActions: Target element not found - devtron-side-panel-actions')
        return null
    }

    return createPortal(children, targetElement)
}
