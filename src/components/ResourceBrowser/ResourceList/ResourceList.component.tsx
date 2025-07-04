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

import React, { MouseEventHandler, useEffect, useState } from 'react'
import { ClearIndicatorProps, components, ValueContainerProps } from 'react-select'

import { Button, ButtonVariantType, ComponentSizeType } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ClearIcon } from '@Icons/ic-error.svg'
import { ReactComponent as SearchIcon } from '@Icons/ic-search.svg'
import { ReactComponent as Warning } from '@Icons/ic-warning.svg'

import { handleUTCTime } from '../../common'
import { ShortcutKeyBadge } from '../../common/formFields/Widgets/Widgets'

export const KindSearchValueContainer = (props: ValueContainerProps) => {
    const { selectProps, children } = props
    return (
        <components.ValueContainer {...props}>
            <div className="flex left dc__position-abs w-100">
                <span className="flex icon-dim-20">
                    <SearchIcon className="kind-search-icon icon-dim-16" />
                </span>
                {!selectProps.inputValue && (
                    <span className="cn-5 dc__ellipsis-right ml-8">{selectProps.placeholder}</span>
                )}
            </div>
            {React.cloneElement(children[1])}
        </components.ValueContainer>
    )
}

export const KindSearchClearIndicator = (props: ClearIndicatorProps) => {
    const { selectProps, isFocused } = props

    return (
        <components.ClearIndicator {...props}>
            <div className="icon-dim-16">
                {selectProps.inputValue && (
                    <button
                        type="button"
                        className="dc__unset-button-styles"
                        onClick={selectProps.onBlur as unknown as MouseEventHandler<HTMLButtonElement>}
                        aria-label="Clear kind search"
                    >
                        <ClearIcon className="clear-kind-search-icon dc__no-shrink icon-dim-16" />
                    </button>
                )}
                {!isFocused && <ShortcutKeyBadge shortcutKey="k" rootClassName="kind-search-shortcut-key" />}
            </div>
        </components.ClearIndicator>
    )
}

const WarningStrip: React.FC<{ lastSyncTime: string; callback: () => void }> = ({ lastSyncTime, callback }) => {
    const [timePassed, setTimePassed] = useState(handleUTCTime(lastSyncTime, true))

    useEffect(() => {
        const interval = setInterval(() => setTimePassed(handleUTCTime(lastSyncTime, true)), 1000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="fs-13 flex left w-100 bcy-1 h-32 warning-icon-y7-imp dc__border-bottom-y2">
            <div className="pl-12 flex fs-13 pt-6 pb-6 pl-12">
                <Warning className="icon-dim-20 mr-8" />
                <span>Last synced {timePassed}. The data might be stale.</span>
                &nbsp;
                <Button
                    variant={ButtonVariantType.text}
                    size={ComponentSizeType.xs}
                    text="Sync now"
                    dataTestId="sync-resource-list"
                    onClick={callback}
                />
            </div>
        </div>
    )
}

export const renderRefreshBar =
    (show: boolean, lastSyncTime: string, callback: () => void): (() => JSX.Element) =>
    () =>
        !show ? null : <WarningStrip lastSyncTime={lastSyncTime} callback={callback} />
