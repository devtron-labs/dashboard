import React, { useState, useEffect, useCallback } from 'react'
import Tippy from '@tippyjs/react'
import { copyToClipboard } from '../helpers/Helpers'
import ClipboardProps from './types'
import { ReactComponent as ICCopy } from '../../../assets/icons/ic-copy.svg'

export default function ClipboardButton({ content, copiedTippyText, duration, trigger, setTrigger }: ClipboardProps) {
    const [copied, setCopied] = useState<boolean>(false)
    const [enableTippy, setEnableTippy] = useState<boolean>(false)

    const handleTextCopied = () => setCopied(true)
    const handleEnableTippy = () => setEnableTippy(true)
    const handleDisableTippy = () => setEnableTippy(false)
    const handleCopyContent = useCallback(() => copyToClipboard(content, handleTextCopied), [content])

    useEffect(() => {
        if (!copied) return

        const timeout = setTimeout(() => {
            setCopied(false)
            setTrigger(false)
        }, duration)

        return () => clearTimeout(timeout)
    }, [copied, duration, setTrigger])

    useEffect(() => {
        if (!trigger) return

        setCopied(true)
        handleCopyContent()
    }, [trigger, handleCopyContent])

    return (
        <div className="icon-dim-16 flex center">
            <Tippy
                className="default-tt"
                content={copied ? copiedTippyText : 'Copy'}
                placement="right"
                visible={copied || enableTippy}
            >
                <button
                    type="button"
                    className="dc__hover-n100 dc__outline-none-imp p-0 flex bcn-0 dc__no-border"
                    onMouseEnter={handleEnableTippy}
                    onMouseLeave={handleDisableTippy}
                    onClick={handleCopyContent}
                >
                    <ICCopy className="icon-dim-16" />
                </button>
            </Tippy>
        </div>
    )
}
