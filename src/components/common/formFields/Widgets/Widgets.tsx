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

import { useEffect, useState } from 'react'
import { ShortcutKeyBadgeProps, StyledProgressBarProps } from './Widgets.type'
import './Widgets.scss'

export const StyledProgressBar = ({
    resetProgress,
    updateProgressValue,
    styles,
    classes,
    progress,
}: StyledProgressBarProps) => {
    const [progressValue, setProgressValue] = useState(progress ?? 0)
    let progressTimer = null

    useEffect(() => {
        progressTimer = setInterval(() => {
            setProgressValue((prevValue) => {
                const _currentValue = prevValue + 1
                // checking for both null and undefined
                if (progress != null) {
                    clearInterval(progressTimer)
                    return progress
                }

                if (_currentValue === 100) {
                    clearInterval(progressTimer)
                }

                if (updateProgressValue) {
                    updateProgressValue(_currentValue)
                }
                return _currentValue
            })
        }, 300)

        return (): void => {
            setProgressValue(0)
            if (progressTimer) {
                clearInterval(progressTimer)
            }
        }
    }, [resetProgress, progress])

    return (
        <progress
            className={`styled-progress-bar ${classes ?? ''}`}
            value={progressValue}
            max={100}
            style={styles ? { ...styles } : {}}
        />
    )
}

export const ShortcutKeyBadge = ({ rootClassName, shortcutKey, onClick }: ShortcutKeyBadgeProps) => (
    <div
        className={`shortcut-key-badge dc__position-abs flex fs-12 lh-20 icon-dim-20 bcn-0 cn-7 fw-6 dc__border br-2 ${
            rootClassName ?? ''
        }`}
        onClick={onClick}
    >
        {shortcutKey}
    </div>
)
