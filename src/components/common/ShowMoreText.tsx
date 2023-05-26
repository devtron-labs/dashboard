import React, { useEffect, useRef, useState } from 'react'

export function ShowMoreText({ text }) {
    const ellipsisText = useRef(null)
    const [showToggle, setShowToggle] = useState(false)
    const [showAllText, setShowAllText] = useState(false)

    useEffect(() => {
        if (ellipsisText.current?.offsetHeight && ellipsisText.current?.scrollHeight) {
            if (ellipsisText.current.offsetHeight === ellipsisText.current?.scrollHeight) {
                setShowToggle(false)
            } else {
                setShowToggle(true)
            }
        }
    }, [ellipsisText.current?.scrollHeight])

    const toggleShowText = () => {
        setShowAllText(!showAllText)
    }

    return (
        <div className="min-w-385 pr-20">
            <span ref={ellipsisText} className={`${showAllText ? '' : 'dc__truncate '}`}>
                {text}
            </span>
            {showToggle && (
                <div className="cursor cb-5" onClick={toggleShowText}>{`${
                    showAllText ? 'Show less' : 'Show more'
                }`}</div>
            )}
        </div>
    )
}
