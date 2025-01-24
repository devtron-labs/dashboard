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

import React, { useState, useEffect } from 'react'
import { components } from 'react-select'
import { ReactComponent as SearchIcon } from '../../../assets/icons/ic-search.svg'
import { ReactComponent as ClearIcon } from '../../../assets/icons/ic-error.svg'
import { ReactComponent as Warning } from '../../../assets/icons/ic-warning.svg'
import { handleUTCTime } from '../../common'
import { ShortcutKeyBadge } from '../../common/formFields/Widgets/Widgets'
import { SidebarChildButtonPropsType } from '../Types'
import { Tooltip } from '@devtron-labs/devtron-fe-common-lib'

export const KindSearchValueContainer = (props) => {
    const { selectProps } = props
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
            {React.cloneElement(props.children[1])}
        </components.ValueContainer>
    )
}

export const KindSearchClearIndicator = (props) => {
    return (
        <components.ClearIndicator {...props}>
            <div className="icon-dim-16">
                {props.selectProps.inputValue && (
                    <ClearIcon className="clear-kind-search-icon icon-dim-16" onClick={props.selectProps.onBlur} />
                )}
                {!props.isFocused && <ShortcutKeyBadge shortcutKey="k" rootClassName="kind-search-shortcut-key" />}
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
                <span>Last synced {timePassed}. The data might be stale. </span>
                <button className="cb-5 ml-4 fw-6 dc__unset-button-styles cursor" onClick={callback}>
                    Sync now
                </button>
            </div>
        </div>
    )
}

export const renderRefreshBar =
    (show: boolean, lastSyncTime: string, callback: () => void): (() => JSX.Element) =>
    () =>
        !show ? null : <WarningStrip lastSyncTime={lastSyncTime} callback={callback} />

export const SidebarChildButton: React.FC<SidebarChildButtonPropsType> = ({
    parentRef,
    group,
    version,
    text,
    kind,
    namespaced,
    isSelected,
    onClick,
}) => (
    <button
        type="button"
        className="dc__unset-button-styles"
        key={text}
        ref={parentRef}
        data-group={group}
        data-version={version}
        data-kind={kind}
        data-namespaced={namespaced}
        data-selected={isSelected}
        onClick={onClick}
        aria-label={`Select ${text}`}
    >
        <Tooltip content={text}>
            <div
                className={`fs-13 pointer dc__ellipsis-right dc__align-left dc__border-radius-4-imp fw-4 pt-6 lh-20 pr-8 pb-6 pl-8 ${
                    isSelected ? 'bcb-1 cb-5' : 'cn-7 dc__hover-n50'
                }`}
            >
                {text}
            </div>
        </Tooltip>
    </button>
)
