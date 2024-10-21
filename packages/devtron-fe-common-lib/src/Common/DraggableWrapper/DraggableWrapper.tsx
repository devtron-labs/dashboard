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

import React, { useEffect, useRef, useState } from 'react'
import Draggable, { ControlPosition, DraggableData } from 'react-draggable'
import { DraggableWrapperProps, DraggablePositionVariant } from './types'
import { useWindowSize } from '../Hooks'
import { MAX_Z_INDEX } from '../Constants'

/**
 * TODO: import it as lazy, after it is supported in common
 * 1. If using react select please use menuPlacement='auto'
 * 2. dragSelector will be used to identify the grabbable button that will grab the div to drag
 * 3. parentRef is the reference point from which we will derive the base top:0 ,left: 0 position
 */
export default function DraggableWrapper({
    children,
    zIndex = MAX_Z_INDEX,
    positionVariant,
    dragSelector,
    parentRef,
    boundaryGap = 16,
    childDivProps = {},
    layoutFixDelta = 0,
}: DraggableWrapperProps) {
    const windowSize = useWindowSize()
    const nodeRef = useRef<HTMLDivElement>(null)

    const [position, setPosition] = useState<ControlPosition>({
        x: 0,
        y: 0,
    })

    const getDefaultPosition = (positionVariant: DraggablePositionVariant): ControlPosition => {
        // if this return x: 0, y: 0 then it will be top left corner of parentDiv
        const parentRect =
            parentRef?.current?.getBoundingClientRect() ??
            ({
                width: 0,
                height: 0,
                top: 0,
                left: 0,
                bottom: 0,
            } as DOMRect)
        const nodeRefHeight = nodeRef.current?.getBoundingClientRect().height ?? 0
        const nodeRefWidth = nodeRef.current?.getBoundingClientRect().width ?? 0

        switch (positionVariant) {
            case DraggablePositionVariant.PARENT_BOTTOM_CENTER: {
                // currently at parentRect.x and need to start to the center of its width and half of node should lie on left of center and other half on right
                const x = (parentRect.width - nodeRefWidth) / 2
                // TODO (v3): Temp fix. Revisit
                const parentRectTop = parentRect.top > 0 ? parentRect.top : layoutFixDelta
                // currently at parentRect.y now parent height can be greater than windowSize.height so taking min
                // subtracting parentRect.top since window height already contains that
                const baseY =
                    parentRect.height > windowSize.height ? windowSize.height - parentRectTop : parentRect.height
                const y = baseY - nodeRefHeight - boundaryGap
                return { x, y }
            }
            // Add more cases for other variants if needed
            default: {
                // Since need node to be in center of screen so subtracting width/2 by left of parentRect it will start the node from center but want node's midpoint at center so subtracting node's width from it.
                const x = windowSize.width / 2 - parentRect.left - nodeRefWidth / 2
                // subtracting top since windowSize already contains that
                const y = windowSize.height - parentRect.top - nodeRefHeight - boundaryGap

                return { x, y }
            }
        }
    }

    // On change of windowSize we will reset the position to default
    useEffect(() => {
        const defaultPosition = getDefaultPosition(positionVariant)
        setPosition(defaultPosition)
    }, [nodeRef, positionVariant, windowSize])

    // Would be called on drag and will not update the state if the new position is out of window screen
    function handlePositionChange(e, data: DraggableData) {
        const offsetX = parentRef?.current?.getBoundingClientRect().left ?? 0
        const offsetY = parentRef?.current?.getBoundingClientRect().top ?? 0

        const nodeRefHeight = nodeRef.current?.getBoundingClientRect().height ?? 0
        const nodeRefWidth = nodeRef.current?.getBoundingClientRect().width ?? 0

        if (
            offsetX + data.x + nodeRefWidth + boundaryGap > windowSize.width ||
            offsetY + data.y + nodeRefHeight + boundaryGap > windowSize.height ||
            offsetX + data.x < 0 ||
            offsetY + data.y < 0
        ) {
            return
        }

        setPosition({
            x: data.x,
            y: data.y,
        })
    }

    return (
        // Since we are using position fixed so we need to disable click on the div so that it does not interfere with the click of other elements
        <div
            className="dc__position-fixed dc__disable-click"
            style={{
                zIndex,
            }}
        >
            <Draggable handle={dragSelector} nodeRef={nodeRef} position={position} onDrag={handlePositionChange}>
                <div
                    ref={nodeRef}
                    {...childDivProps}
                    style={{
                        zIndex,
                        pointerEvents: 'auto',
                    }}
                >
                    {children}
                </div>
            </Draggable>
        </div>
    )
}
