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

import React from 'react'
import { GridProps } from './types'

// This is meant to be a reusable component that will provide a grid like dynamic layout where xs is the number of columns out of 12 that the item will take up
export default function Grid({
    container,
    spacing = 0,
    item,
    xs,
    containerClass = '',
    itemClass = '',
    children,
    ...containerDivProps
}: GridProps) {
    const containerStyles = container ? { gap: `${spacing}px` } : {}

    if (item) {
        const getColumnWidth = () => {
            const percentageWidth = (xs / 12) * 100
            // DONT CHANGE IT FROM CALC SINCE CALC CONVERTS TO PX which is needed to handle text overflow
            return `calc(${percentageWidth}%)`
        }

        const itemStyles = {
            flex: `1 1 ${getColumnWidth()}`,
        }

        return (
            <div className={`p-0 ${itemClass}`} style={itemStyles} {...containerDivProps}>
                {children}
            </div>
        )
    }

    return (
        <div
            className={`flex-wrap flexbox ${container ? containerClass : ''}`}
            style={containerStyles}
            {...containerDivProps}
        >
            {children}
        </div>
    )
}
