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

import React, { useEffect } from 'react'
import { useEffectAfterMount, useWindowSize } from '@devtron-labs/devtron-fe-common-lib'

export default function ResponsiveDrawer({
    initialHeight = 36,
    minHeight = 100,
    defaultHeight = 500,
    minimumTopMargin = 100,
    isDetailedView,
    onHeightChange = null,
    className = '',
    children,
    anchor = null,
}) {
    const dimensions = useWindowSize()
    const { height: windowHeight, width } = dimensions || { height: 0, width: 0 }
    const [height, setHeight] = React.useState(initialHeight)
    const maxHeight = windowHeight - minimumTopMargin
    let timeout
    const resize = (e) => {
        e.stopPropagation()
        if (timeout) {
            window.cancelAnimationFrame(timeout)
        }
        timeout = window.requestAnimationFrame(function () {
            const height2 = window.innerHeight - e.clientY
            if (height2 < minHeight) {
                setHeight(minHeight)
            } else if (height2 > maxHeight) {
                setHeight(maxHeight)
            } else {
                setHeight(height2)
            }
        })
    }

    useEffect(() => {
        if (isDetailedView) {
            setHeight(defaultHeight)
        } else {
            setHeight(initialHeight)
        }
    }, [isDetailedView])

    useEffectAfterMount(() => {
        const maximumAllowedHeight = windowHeight - 200
        if (height > maximumAllowedHeight && maximumAllowedHeight > minHeight) {
            setHeight(maximumAllowedHeight)
        }
    }, [windowHeight])

    useEffectAfterMount(() => {
        if (typeof onHeightChange === 'function') {
            onHeightChange(height)
        }
    }, [height])

    const stopResize = (e) => {
        window.removeEventListener('mousemove', resize, false)
        window.removeEventListener('mouseup', stopResize, false)
    }

    const initResize = (e) => {
        window.addEventListener('mousemove', resize, false)
        window.addEventListener('mouseup', stopResize, false)
    }

    return (
        <section className={`${className} ${isDetailedView ? 'detailed' : ''}`} style={{ height: `${height}px` }}>
            {React.Children.map(anchor, (child) => {
                return React.cloneElement(child, {
                    onMouseDown: isDetailedView ? initResize : null,
                })
            })}
            {children}
        </section>
    )
}
