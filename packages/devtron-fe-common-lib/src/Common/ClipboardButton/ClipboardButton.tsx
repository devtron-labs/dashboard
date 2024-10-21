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

import { useState, useEffect, useCallback } from 'react'
import Tippy from '@tippyjs/react'
import { copyToClipboard, noop, stopPropagation } from '../Helper'
import ClipboardProps from './types'
import { ReactComponent as ICCopy } from '../../Assets/Icon/ic-copy.svg'
import { ReactComponent as Check } from '../../Assets/Icon/ic-check.svg'

/**
 * @param content - Content to be copied
 * @param copiedTippyText - Text to be shown in the tippy when the content is copied, default 'Copied!'
 * @param duration - Duration for which the tippy should be shown, default 1000
 * @param trigger - To trigger the copy action outside the button, if set to true the content will be copied, use case being triggering the copy action from outside the component
 * @param setTrigger - Callback function to set the trigger outside the button
 * @param rootClassName - additional classes to add to button
 * @param iconSize - size of svg icon to be shown, default 16 (icon-dim-16)
 */
export default function ClipboardButton({
    content,
    copiedTippyText = 'Copied!',
    duration = 1000,
    trigger,
    setTrigger = noop,
    rootClassName = '',
    iconSize = 16,
}: ClipboardProps) {
    const [copied, setCopied] = useState<boolean>(false)
    const [enableTippy, setEnableTippy] = useState<boolean>(false)

    const handleTextCopied = () => {
        setCopied(true)
    }
    const isTriggerUndefined = typeof trigger === 'undefined'

    const handleEnableTippy = () => setEnableTippy(true)
    const handleDisableTippy = () => setEnableTippy(false)
    const handleCopyContent = useCallback(
        (e?) => {
            if (e) stopPropagation(e)
            copyToClipboard(content, handleTextCopied)
        },
        [content],
    )
    const iconClassName = `icon-dim-${iconSize} dc__no-shrink`

    useEffect(() => {
        if (!copied) return

        const timeout = setTimeout(() => {
            setCopied(false)
            setTrigger(false)
        }, duration)

        return () => clearTimeout(timeout)
    }, [copied, duration, setTrigger])

    useEffect(() => {
        if (!isTriggerUndefined && trigger) {
            setCopied(true)
            handleCopyContent()
        }
    }, [trigger, handleCopyContent])
    return (
        <Tippy
            className="default-tt"
            content={copied ? copiedTippyText : 'Copy'}
            placement="bottom"
            visible={copied || enableTippy}
            arrow={false}
        >
            <button
                type="button"
                className={`dc__outline-none-imp p-0 flex dc__transparent--unstyled dc__no-border ${rootClassName}`}
                onMouseEnter={handleEnableTippy}
                onMouseLeave={handleDisableTippy}
                onClick={isTriggerUndefined && handleCopyContent}
            >
                {copied ? <Check className={iconClassName} /> : <ICCopy className={iconClassName} />}
            </button>
        </Tippy>
    )
}
