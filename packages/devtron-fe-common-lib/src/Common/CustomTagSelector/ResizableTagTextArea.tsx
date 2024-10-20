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

import React, { useEffect, useState } from 'react'
import { useThrottledEffect } from '../Helper'
import { ResizableTagTextAreaProps } from './Types'

export const ResizableTagTextArea = ({
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
    dataTestId,
    handleKeyDown,
    disabled,
    disableOnBlurResizeToMinHeight,
}: ResizableTagTextAreaProps) => {
    const [text, setText] = useState('')

    useEffect(() => {
        setText(value)
    }, [value])

    const handleChange = (event) => {
        setText(event.target.value)
        onChange?.(event)
    }

    const reInitHeight = () => {
        if (document.activeElement !== refVar.current) return
        refVar.current.style.height = `${minHeight}px`
        if (dependentRef) {
            dependentRef.current.style.height = `${minHeight}px`
        }
        let nextHeight = refVar.current.scrollHeight
        if (dependentRef && nextHeight < dependentRef.current.scrollHeight) {
            nextHeight = dependentRef.current.scrollHeight
        }
        if (minHeight && nextHeight < minHeight) {
            nextHeight = minHeight
        }
        if (maxHeight && nextHeight > maxHeight) {
            nextHeight = maxHeight
        }
        refVar.current.style.height = `${nextHeight}px`
        if (dependentRef) {
            dependentRef.current.style.height = `${nextHeight}px`
        }
    }

    useThrottledEffect(reInitHeight, 500, [text])

    const handleOnBlur = (event) => {
        if (!disableOnBlurResizeToMinHeight) {
            refVar.current.style.height = `${minHeight}px`
            if (dependentRef) {
                dependentRef.current.style.height = `${minHeight}px`
            }
        }
        onBlur && onBlur(event)
    }

    const handleOnFocus = (event) => {
        reInitHeight()
        onFocus && onFocus(event)
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
            data-testid={dataTestId}
            onKeyDown={handleKeyDown}
            disabled={disabled}
        />
    )
}
