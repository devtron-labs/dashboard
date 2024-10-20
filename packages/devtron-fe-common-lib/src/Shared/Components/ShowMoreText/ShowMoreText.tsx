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

import { useEffect, useRef, useState } from 'react'
import { ReactComponent as ICCaretDown } from '@Icons/ic-caret-down.svg'

interface ShowMoreTextProps {
    text: string
    textClass?: string
}

const ShowMoreText = ({ text, textClass }: ShowMoreTextProps) => {
    const ellipsisText = useRef(null)
    const [showToggle, setShowToggle] = useState(false)
    const [showAllText, setShowAllText] = useState(false)

    useEffect(() => {
        if (ellipsisText.current?.offsetHeight && ellipsisText.current?.scrollHeight) {
            if (ellipsisText.current.offsetHeight === ellipsisText.current?.scrollHeight) {
                setShowToggle(false)
            } else {
                setShowToggle(true)
            }
        }
    }, [ellipsisText.current?.scrollHeight])

    const toggleShowText = () => {
        setShowAllText(!showAllText)
    }
    const getTextClassName = () => {
        if (showAllText) {
            return textClass || ''
        }

        return `${textClass || ''} dc__truncate`
    }

    return (
        <div className="min-w-385 pr-20">
            <span ref={ellipsisText} className={getTextClassName()}>
                {text}
            </span>
            {showToggle && (
                <button
                    type="button"
                    className="dc__transparent p-0 flexbox dc__align-items-center dc__gap-4"
                    onClick={toggleShowText}
                >
                    <span className="cb-5 fs-12 fw-6 lh-20">{showAllText ? 'Show less' : 'Show more'}</span>
                    <ICCaretDown
                        className={`dc__no-shrink icon-dim-16 flex scb-5 dc__transition--transform ${showAllText ? 'dc__flip-180' : ''}`}
                    />
                </button>
            )}
        </div>
    )
}

export default ShowMoreText
