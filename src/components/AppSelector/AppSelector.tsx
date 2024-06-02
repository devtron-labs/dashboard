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

import React, { useRef } from 'react'
import AsyncSelect from 'react-select/async'
import { appListOptions, appSelectorStyle, DropdownIndicator, noOptionsMessage } from './AppSelectorUtil'
import { abortPreviousRequests } from '@devtron-labs/devtron-fe-common-lib'

interface AppSelectorType {
    onChange: ({ label, value }) => void
    appId: number
    appName: string
    isJobView?: boolean
}

export default function AppSelector({ onChange, appId, appName, isJobView }: AppSelectorType) {
    const abortControllerRef = useRef<AbortController>(new AbortController())

    const defaultOptions = [{ value: appId, label: appName }]
    const loadAppListOptions = (inputValue: string) =>
        abortPreviousRequests(
            () => appListOptions(inputValue, isJobView, abortControllerRef.current.signal),
            abortControllerRef,
        )

    return (
        <AsyncSelect
            defaultOptions
            loadOptions={loadAppListOptions}
            noOptionsMessage={noOptionsMessage}
            onChange={onChange}
            components={{
                IndicatorSeparator: null,
                DropdownIndicator,
                LoadingIndicator: null,
            }}
            value={defaultOptions[0]}
            styles={appSelectorStyle}
        />
    )
}
