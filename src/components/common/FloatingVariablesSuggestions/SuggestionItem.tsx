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

import { useState } from 'react'
import Tippy from '@tippyjs/react'
import DOMPurify from 'dompurify'
import { ClipboardButton, copyToClipboard, YAMLStringify } from '@devtron-labs/devtron-fe-common-lib'
import { SuggestionsItemProps } from './types'
import { NO_DEFINED_DESCRIPTION } from './constants'

export default function SuggestionItem({
    variableName,
    description,
    variableValue,
    isRedacted,
    highlightText,
}: SuggestionsItemProps) {
    const [copyToClipboardPromise, setCopyToClipboardPromise] = useState<ReturnType<typeof copyToClipboard>>(null)

    const clipboardContent = `@{{${variableName}}}`

    const handleCopyTrigger = () => {
        setCopyToClipboardPromise(copyToClipboard(clipboardContent))
    }

    const sanitiseVariableValue = (value): JSX.Element => {
        if (isRedacted) {
            return <i className="cn-3 fs-12 fw-6 lh-18 m-0">is sensitive & hidden</i>
        }
        if (value === '') {
            return <p className="cn-0 fs-12 fw-6 lh-18 m-0">&apos;&quot;&quot;&apos;</p>
        }
        if (typeof value === 'boolean') {
            return <p className="cn-0 fs-12 fw-6 lh-18 m-0">{value ? 'true' : 'false'}</p>
        }
        if (typeof value === 'object') {
            return <pre className="cn-0 fs-12 fw-6 lh-18 m-0 bcn-9">{YAMLStringify(value)}</pre>
        }
        return <p className="cn-0 fs-12 fw-6 lh-18 m-0">{value}</p>
    }

    const highlightedText = (text: string): string => {
        if (highlightText === '') {
            return text
        }

        try {
            const regex = new RegExp(highlightText, 'gi')
            return text.replace(regex, (match) => `<span class="bcy-2">${match}</span>`)
        } catch (error) {
            return text
        }
    }

    const renderDescription = (): JSX.Element => {
        if (description === NO_DEFINED_DESCRIPTION) {
            return <p className="m-0 fs-12 fw-4 lh-18">{description}</p>
        }

        return (
            <p
                className="m-0 fs-12 fw-4 lh-18 dc__word-break-all"
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
            className="default-tt dc__word-break-all"
            content={
                <div className="mw-200 flex column dc__content-start dc__align-start mxh-140 dc__overflow-scroll">
                    <div className="flex column dc__content-start dc__align-start">Value</div>
                    <div className="flex column dc__content-start dc__align-start">
                        {sanitiseVariableValue(variableValue)}
                    </div>
                </div>
            }
            placement="left"
            interactive
            // Have to append to body because the parent is draggable
            appendTo={document.body}
        >
            <div
                className="flexbox-col pt-8 pb-8 pl-12 pr-12 dc__align-self-stretch bcn-0 dc__border-bottom-n1 dc__hover-n50"
                onClick={handleCopyTrigger}
                data-testid="suggestion-item"
            >
                <div className="flexbox dc__align-items-center dc__gap-8 dc__ellipsis-right">
                    {renderVariableName()}

                    <ClipboardButton
                        content={clipboardContent}
                        copiedTippyText={`Copied: ${clipboardContent}`}
                        copyToClipboardPromise={copyToClipboardPromise}
                    />
                </div>

                <div className="flexbox dc__align-items-center">{renderDescription()}</div>
            </div>
        </Tippy>
    )
}
