import React, { useState, useEffect, useRef } from 'react'
import { useThrottledEffect } from '../helpers/Helpers'

interface ResizableTextareaProps {
    minHeight?: number
    maxHeight?: number
    value?: string
    onChange?: (e) => void
    onBlur?: (e) => void
    className?: string
    placeholder?: string
    lineHeight?: number
    padding?: number
    disabled?: boolean
    name?: string
    tabIndex?: number
    defaultRows?: number
    refVar?: React.MutableRefObject<any>
    dependentRef?: React.MutableRefObject<any>
}

export const ResizableTextarea: React.FC<ResizableTextareaProps> = ({
    minHeight,
    maxHeight,
    value,
    onChange = null,
    onBlur = null,
    className = '',
    placeholder = 'Enter your text here..',
    lineHeight = 14,
    padding = 12,
    disabled = false,
    tabIndex = null,
    defaultRows = null,
    refVar,
    dependentRef,
    ...props
}) => {
    const [text, setText] = useState('')
    const _textRef = useRef(null)

    useEffect(() => {
        setText(value)
    }, [value])

    function handleChange(e) {
        e.persist()
        setText(e.target.value)
        if (typeof onChange === 'function') onChange(e)
    }

    function handleBlur(e) {
        e.persist()
        if (typeof onBlur === 'function') onBlur(e)
    }

    useThrottledEffect(
        () => {
            const ref = refVar ?? _textRef
            ref.current.style.height = 'auto'
            let nextHeight = ref.current.scrollHeight
            if (dependentRef) {
                dependentRef.current.style.height = 'auto'
                if (nextHeight < dependentRef.current.scrollHeight) {
                    nextHeight = dependentRef.current.scrollHeight
                }
            }
            if (minHeight && nextHeight < minHeight) {
                nextHeight = minHeight
            }
            if (maxHeight && nextHeight > maxHeight) {
                nextHeight = maxHeight
            }

            ref.current.style.height = nextHeight + 2 + 'px'
            if (dependentRef) {
                dependentRef.current.style.height = nextHeight + 2 + 'px'
            }
        },
        500,
        [text],
    )

    return (
        <textarea
            ref={refVar ?? _textRef}
            value={text}
            placeholder={placeholder}
            className={`dc__resizable-textarea ${className}`}
            onChange={handleChange}
            onBlur={handleBlur}
            style={{ lineHeight: `${lineHeight}px`, padding: `${padding}px` }}
            spellCheck={false}
            disabled={disabled}
            tabIndex={tabIndex}
            rows={defaultRows}
            {...props}
        />
    )
}
