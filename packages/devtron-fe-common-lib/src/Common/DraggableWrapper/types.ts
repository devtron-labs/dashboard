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

import { HTMLAttributes, ReactNode, RefObject } from 'react'

export enum DraggablePositionVariant {
    PARENT_BOTTOM_CENTER = 'PARENT_BOTTOM_CENTER',
    SCREEN_BOTTOM_CENTER = 'SCREEN_BOTTOM_CENTER',
    // Can add more based on requirement
}

export interface DraggableWrapperProps {
    children: ReactNode
    /**
     * Support for passing the direct value or calc functions as well
     */
    zIndex?: number | string
    positionVariant?: DraggablePositionVariant
    /**
     * dragSelector (class - (append with .), id, etc) will be used to identify the grabbable button that will grab the div to drag
     */
    dragSelector: string
    parentRef?: RefObject<HTMLDivElement>
    boundaryGap?: number
    childDivProps?: HTMLAttributes<HTMLDivElement>
    /**
     * Delta for fixing the scrollable layout positioning
     */
    layoutFixDelta?: number
}

/**
 * dragClassName is the class that we feed to Draggable to identify dragging buttons
 */
export interface DraggableButtonProps {
    dragClassName: string
}
