import React, { useState, useEffect } from 'react'
import Tippy from '@tippyjs/react'
import { copyToClipboard } from '../helpers/Helpers'
import ClipboardProps from './types'
import { ReactComponent as ICCopy } from '../../../assets/icons/ic-copy.svg'

export default function ClipboardButton({ content, copiedTippyText, duration, trigger }: ClipboardProps) {
    const [copied, setCopied] = useState<boolean>(false)

    const handleTextCopied = () => {
        setCopied(true)
    }

    const handleCopyContent = () => {
        copyToClipboard(content, handleTextCopied)
    }

    useEffect(() => {
        const timeout = setTimeout(() => {
            setCopied(false)
        }, duration)

        return () => clearTimeout(timeout)
    }, [copied])

    useEffect(() => {
        setCopied(true)
        handleCopyContent()
    }, [trigger])

    return (
        <div className="icon-dim-16 ml-8">
            <Tippy
                className="default-tt"
                content={copied ? copiedTippyText : 'Copy to clipboard'}
                placement="right"
                trigger="mouseenter click"
            >
                <button type="button" className="dc__hover-n100 dc__outline-none-imp p-0 flex bcn-0 dc__no-border">
                    <ICCopy onClick={handleCopyContent} className="icon-dim-16" />
                </button>
            </Tippy>
        </div>
    )
}
