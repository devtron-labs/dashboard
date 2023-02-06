import React, { useEffect, useState } from 'react'
import { useThrottledEffect } from '../../../common'

export function ResizableTagTextArea({
    className,
    minHeight,
    maxHeight,
    value,
    onChange,
    onBlur,
    onFocus,
    placeholder,
    tabIndex,
    refVar,
    dependentRef,
}) {
    const [text, setText] = useState('')

    useEffect(() => {
        setText(value)
    }, [value])

    const handleChange = (event) => {
        setText(event.target.value)
        onChange(event)
    }

    const reInitHeight = () => {
        if (document.activeElement !== refVar.current) return
        refVar.current.style.height = 'auto'
        dependentRef.current.style.height = 'auto'
        let nextHeight = refVar.current.scrollHeight
        if (nextHeight < dependentRef.current.scrollHeight) {
            nextHeight = dependentRef.current.scrollHeight
        }
        if (minHeight && nextHeight < minHeight) {
            nextHeight = minHeight
        }
        if (maxHeight && nextHeight > maxHeight) {
            nextHeight = maxHeight
        }
        refVar.current.style.height = nextHeight + 'px'
        dependentRef.current.style.height = nextHeight + 'px'
    }

    useThrottledEffect(reInitHeight, 500, [text])

    const handleOnBlur = (event) => {
        refVar.current.style.height = 'auto'
        dependentRef.current.style.height = 'auto'
        onBlur(event)
    }

    const handleOnFocus = (event) => {
        reInitHeight()
        onFocus(event)
    }

    return (
        <textarea
            rows={1}
            ref={refVar}
            value={text}
            placeholder={placeholder}
            className={`${className || ''} lh-20`}
            style={{ resize: 'none' }}
            onChange={handleChange}
            onBlur={handleOnBlur}
            onFocus={handleOnFocus}
            tabIndex={tabIndex}
        />
    )
}
