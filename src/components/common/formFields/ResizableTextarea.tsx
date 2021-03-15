import React, { useState, useEffect, useRef } from 'react'
import { useThrottledEffect } from '../index';

interface ResizableTextareaProps {
    minHeight?: number;
    maxHeight?: number;
    value?: string;
    onChange?: (e) => void;
    className?: string;
    placeholder?: string;
    lineHeight?: number;
    padding?: number;
    disabled?: boolean;
    name?: string;
}

export const ResizableTextarea: React.FC<ResizableTextareaProps> = ({ minHeight, maxHeight, value, onChange = null, className = "", placeholder = "Enter your text here..", lineHeight = 14, padding = 12, disabled = false, ...props }) => {
    const [text, setText] = useState("")
    const _textRef = useRef(null)

    useEffect(() => {
        setText(value)
    }, [value])

    function handleChange(e) {
        e.persist();
        setText(e.target.value)
        if (typeof onChange === 'function') onChange(e)
    }

    useThrottledEffect(() => {
        _textRef.current.style.height = 'auto';
        let nextHeight = _textRef.current.scrollHeight
        if (minHeight && nextHeight < minHeight) {
            nextHeight = minHeight
        }
        if (maxHeight && nextHeight > maxHeight) {
            nextHeight = maxHeight
        }
        _textRef.current.style.height = nextHeight + 2 + 'px';
    }, 500, [text])

    return (
        <textarea
            ref={el => _textRef.current = el}
            value={text}
            placeholder={placeholder}
            className={`resizable-textarea ${className}`}
            onChange={handleChange}
            style={{ lineHeight: `${lineHeight}px`, padding: `${padding}px` }}
            spellCheck={false}
            disabled={disabled}
            {...props}
        />
    );
}