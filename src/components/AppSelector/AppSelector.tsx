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

import { useEffect, useRef } from 'react'
import {
    abortPreviousRequests,
    APP_SELECTOR_STYLES,
    AppSelectorDropdownIndicator,
    AppSelectorNoOptionsMessage,
    showError,
} from '@devtron-labs/devtron-fe-common-lib'
import { Props as SelectProps, SelectInstance } from 'react-select'
import AsyncSelect from 'react-select/async'
import { useUserPreferences } from '@Components/common/UserPrefrences/useUserPrefrences'
import { appListOptions } from './AppSelectorUtil'
import { AppSelectorType } from './AppSelector.types'

const AppSelector = ({ onChange, appId, appName, isJobView }: AppSelectorType) => {
    const { recentlyVisitedDevtronApps, handleFetchUserPreferences } = useUserPreferences()
    const selectRef = useRef<SelectInstance>(null)
    useEffect(() => {
        const fetch = async () => {
            try {
                await handleFetchUserPreferences()
            } catch (error) {
                showError(error)
            }
        }
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        fetch()
        console.log(recentlyVisitedDevtronApps)
    }, [])

    const abortControllerRef = useRef<AbortController>(new AbortController())

    const defaultOptions = [{ value: appId, label: appName }]
    const loadAppListOptions = (inputValue: string) =>
        abortPreviousRequests(
            () => appListOptions(inputValue, isJobView, abortControllerRef.current.signal),
            abortControllerRef,
        )

    const handleOnKeyDown: SelectProps['onKeyDown'] = (event) => {
        if (event.key === 'Escape') {
            selectRef.current?.inputRef.blur()
        }
    }

    return (
        <AsyncSelect
            ref={selectRef}
            blurInputOnSelect
            onKeyDown={handleOnKeyDown}
            defaultOptions
            loadOptions={loadAppListOptions}
            noOptionsMessage={AppSelectorNoOptionsMessage}
            onChange={onChange}
            components={{
                IndicatorSeparator: null,
                DropdownIndicator: AppSelectorDropdownIndicator,
                LoadingIndicator: null,
            }}
            value={defaultOptions[0]}
            styles={APP_SELECTOR_STYLES}
        />
    )
}

export default AppSelector
