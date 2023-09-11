import React, { useState } from 'react'
import Tippy from '@tippyjs/react'
import ClipboardButton from '../ClipboardButton/ClipboardButton'
import { SuggestionsItemProps } from './types'

export default function SuggestionItem({ variableName, description, variableValue }: SuggestionsItemProps) {
    const [triggerCopy, setTriggerCopy] = useState<boolean>(false)

    const handleCopyTrigger = () => {
        setTriggerCopy(true)
    }

    return (
        <Tippy
            className="default-tt"
            content={
                <div className="mw-200 flex column dc__content-start dc__align-start">
                    <div className="flex column dc__content-start dc__align-start">Value</div>
                    <div className="flex column dc__content-start dc__align-start">{variableValue}</div>
                </div>
            }
            placement="left"
        >
            <div
                className="flexbox-col pt-8 pb-8 pl-12 pr-12 dc__align-self-stretch bcn-0 dc__border-bottom-n1 dc__hover-n50"
                onClick={handleCopyTrigger}
            >
                <div className="flexbox dc__align-items-center dc__gap-2 dc__content-space">
                    <p className="m-0 fs-13 fw-6 lh-20 cn-9">{variableName}</p>

                    <ClipboardButton
                        content={`@{{${variableName}}}`}
                        copiedTippyText={`Copied: @{{${variableName}}}`}
                        duration={1000}
                        trigger={triggerCopy}
                        setTrigger={setTriggerCopy}
                    />
                </div>

                <div className="flexbox dc__align-items-center">
                    <p className="m-0 dc__ellipsis-right__2nd-line fs-12 fw-4 lh-18">{description}</p>
                </div>
            </div>
        </Tippy>
    )
}
