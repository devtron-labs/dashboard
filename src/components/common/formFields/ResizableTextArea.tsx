import React, { useState, useEffect, useRef } from 'react';
import { useThrottledEffect } from "../helpers/Helpers"

interface ResizableTextareaProps {
  minHeight?: number
  maxHeight?: number
  defaultHeight?: number
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
}

export const ResizableTextarea: React.FC<ResizableTextareaProps> = ({
  minHeight,
  maxHeight,
  defaultHeight,
  value,
  onChange = null,
  onBlur = null,
  className = '',
  placeholder = 'Enter your text here..',
  lineHeight = 14,
  padding = 12,
  disabled = false,
  tabIndex = null,
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
          _textRef.current.style.height = defaultHeight
          let nextHeight = _textRef.current.scrollHeight
          if (minHeight && nextHeight < minHeight) {
              nextHeight = minHeight
          }
          if (maxHeight && nextHeight > maxHeight) {
              nextHeight = maxHeight
          }
          _textRef.current.style.height = nextHeight + 2 + 'px'
      },
      500,
      [text],
  )

  return (
      <textarea
          ref={(el) => (_textRef.current = el)}
          value={text}
          placeholder={placeholder}
          className={`dc__resizable-textarea ${className}`}
          onChange={handleChange}
          onBlur={handleBlur}
          style={{ lineHeight: `${lineHeight}px`, padding: `${padding}px` }}
          spellCheck={false}
          disabled={disabled}
          tabIndex={tabIndex}
          {...props}
      />
  )
}