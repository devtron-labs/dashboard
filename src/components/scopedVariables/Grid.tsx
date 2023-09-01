import React from 'react'
import { GridI } from './types'

// This is meant to be a reusable component that will provide a grid like dynamic layout where xs is the number of columns out of 12 that the item will take up
export default function Grid({
    container,
    spacing = 0,
    item,
    xs,
    containerClass = '',
    itemClass = '',
    children,
}: GridI) {
    const containerStyles = container ? { gap: spacing + 'px' } : {}

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
            <div className={`p-0 ${itemClass}`} style={itemStyles}>
                {children}
            </div>
        )
    }

    return (
        <div className={`flex-wrap flexbox ${container ? containerClass : ''}`} style={containerStyles}>
            {children}
        </div>
    )
}
