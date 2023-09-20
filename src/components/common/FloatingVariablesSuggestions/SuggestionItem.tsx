import React, { useCallback, useState } from 'react'
import Tippy from '@tippyjs/react'
import * as DOMPurify from 'dompurify'
import ClipboardButton from '../ClipboardButton/ClipboardButton'
import { SuggestionsItemProps } from './types'
import { NO_DEFINED_DESCRIPTION } from './constants'

export default function SuggestionItem({
    variableName,
    description,
    variableValue,
    isRedacted,
    highlightText,
}: SuggestionsItemProps) {
    const [triggerCopy, setTriggerCopy] = useState<boolean>(false)

    const handleCopyTrigger = useCallback(() => setTriggerCopy(true), [])

    const sanitiseVariableValue = (value): JSX.Element => {
        if (isRedacted) return <i className="cn-3 fs-12 fw-6 lh-18 m-0">is sensitive & hidden</i>
        if (value === '') return <p className="cn-0 fs-12 fw-6 lh-18 m-0">&apos;&quot;&quot;&apos;</p>
        return <p className="cn-0 fs-12 fw-6 lh-18 m-0">{value}</p>
    }

    const highlightedText = (text: string): string => {
        if (highlightText === '') return text

        try {
            const regex = new RegExp(highlightText, 'gi')
            return text.replace(regex, (match) => `<span class="bcy-2">${match}</span>`)
        } catch (error) {
            return text
        }
    }

    const renderDescription = (): JSX.Element => {
        if (description === NO_DEFINED_DESCRIPTION) return <p className="m-0 fs-12 fw-4 lh-18">{description}</p>

        return (
            <p
                className="m-0 fs-12 fw-4 lh-18"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(highlightedText(description)) }}
            />
        )
    }

    const renderVariableName = (): JSX.Element => (
        <p
            className="m-0 fs-13 fw-6 lh-20 cn-9 dc__ellipsis-right"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(highlightedText(variableName)) }}
        />
    )

    return (
        <Tippy
            className="default-tt"
            content={
                <div className="mw-200 flex column dc__content-start dc__align-start">
                    <div className="flex column dc__content-start dc__align-start">Value</div>
                    <div className="flex column dc__content-start dc__align-start">
                        {sanitiseVariableValue(variableValue)}
                    </div>
                </div>
            }
            placement="left"
        >
            <div
                className="flexbox-col pt-8 pb-8 pl-12 pr-12 dc__align-self-stretch bcn-0 dc__border-bottom-n1 dc__hover-n50"
                onClick={handleCopyTrigger}
                data-testid="suggestion-item"
            >
                <div className="flexbox dc__align-items-center dc__gap-8 dc__ellipsis-right">
                    {renderVariableName()}

                    <ClipboardButton
                        content={`@{{${variableName}}}`}
                        copiedTippyText={`Copied: @{{${variableName}}}`}
                        duration={1000}
                        trigger={triggerCopy}
                        setTrigger={setTriggerCopy}
                    />
                </div>

                <div className="flexbox dc__align-items-center">{renderDescription()}</div>
            </div>
        </Tippy>
    )
}
