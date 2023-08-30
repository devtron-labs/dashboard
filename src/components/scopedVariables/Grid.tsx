import React from 'react'

interface GridI {
    container?: boolean
    spacing?: number
    item?: boolean
    xs?: number
    containerClass?: string
    itemClass?: string
    children: React.ReactNode
}

// This is meant to be a reusable component that will provide a grid like dynamic layout
const Grid = ({ container, spacing=0, item, xs, containerClass='', itemClass='', children }: GridI) => {
    const containerStyles = container ? { gap: spacing + 'px' } : {}

    if (item) {
        const getColumnWidth = () => {
            const percentageWidth = (xs / 12) * 100
            return `${percentageWidth}%`
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

export default Grid
