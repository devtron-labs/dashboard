import { useEffect, useRef, useState } from 'react'
import { CollapseProps } from './types'

/**
 * Collapse component for smoothly expanding or collapsing its content.
 * Dynamically calculates the content height and applies smooth transitions.
 * It also supports a callback when the transition ends.
 */
export const Collapse = ({ expand, onTransitionEnd, children }: CollapseProps) => {
    // Reference to the content container to calculate its height
    const contentRef = useRef<HTMLDivElement>(null)

    // State to store the dynamic height of the content; initially set to 0 if collapsed
    const [contentHeight, setContentHeight] = useState<number>(!expand ? 0 : null)

    /**
     * Effect to observe changes in the content size when expanded and recalculate the height.
     * Uses a ResizeObserver to handle dynamic content size changes.
     */
    useEffect(() => {
        if (!contentHeight || !expand || !contentRef.current) {
            return null
        }

        const resizeObserver = new ResizeObserver((entries) => {
            // Update the height when content size changes
            setContentHeight(entries[0].contentRect.height)
        })

        // Observe the content container for resizing
        resizeObserver.observe(contentRef.current)

        // Clean up the observer when the component unmounts or content changes
        return () => {
            resizeObserver.disconnect()
        }
    }, [contentHeight, expand])

    /**
     * Effect to handle the initial setting of content height during expansion or collapse.
     * Sets height to the content's full height when expanded, or 0 when collapsed.
     */
    useEffect(() => {
        if (expand) {
            // Set the content height when expanded
            setContentHeight(contentRef.current?.getBoundingClientRect().height)
        } else {
            // Collapse content by setting the height to 0
            setContentHeight(0)
        }
    }, [expand])

    return (
        <div
            style={{ height: contentHeight, overflow: 'hidden', transition: 'height 200ms ease-out' }}
            onTransitionEnd={onTransitionEnd}
        >
            {/* The container that holds the collapsible content */}
            <div ref={contentRef}>{children}</div>
        </div>
    )
}
