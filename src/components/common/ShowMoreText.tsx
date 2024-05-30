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

import React, { useEffect, useRef, useState } from 'react'

export const ShowMoreText = ({ text }) => {
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

    return (
        <div className="min-w-385 pr-20">
            <span ref={ellipsisText} className={`${showAllText ? '' : 'dc__truncate '}`}>
                {text}
            </span>
            {showToggle && (
                <div className="cursor cb-5" onClick={toggleShowText}>{`${
                    showAllText ? 'Show less' : 'Show more'
                }`}</div>
            )}
        </div>
    )
}
