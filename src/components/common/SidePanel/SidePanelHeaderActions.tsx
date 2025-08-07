/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
