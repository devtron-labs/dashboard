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
import { Props as SelectProps, SelectInstance } from 'react-select'
import AsyncSelect from 'react-select/async'
import { abortPreviousRequests, noop, showError } from '@devtron-labs/devtron-fe-common-lib'
import { getRecentlyVisitedDevtronApps, updateRecentlyVisitedDevtronApps } from '@Components/app/details/utils'
import { AppMetaInfo } from '@Components/app/types'
import { AppSelectorType } from './types'
import { appListOptions, appSelectorStyle, DropdownIndicator, noOptionsMessage } from './AppSelectorUtil'

const AppSelector = ({
    onChange,
    appId,
    appName,
    isJobView,
    recentlyVisitedDevtronApps,
    setRecentlyVisitedDevtronApps,
}: AppSelectorType) => {
    const selectRef = useRef<SelectInstance>(null)
    const abortControllerRef = useRef<AbortController>(new AbortController())

    const fetchRecentlyVisitedDevtronApps = async () => {
        try {
            if (!appName || !appId) {
                return // ✅ Exit early inside the function instead of skipping useEffect
            }

            const response = await getRecentlyVisitedDevtronApps()

            // Combine current app with previous list
            const combinedList = [{ appId, appName }, ...response] as AppMetaInfo[]

            // Ensure unique entries using a Map
            const uniqueApps = Array.from(new Map(combinedList.map((app) => [Number(app.appId), app])).values())

            // Trim the list to 5 items
            const trimmedList = uniqueApps.slice(0, 5)

            setRecentlyVisitedDevtronApps(trimmedList)
            await updateRecentlyVisitedDevtronApps(trimmedList)
        } catch (error) {
            showError(error)
        }
    }
    useEffect(() => {
        fetchRecentlyVisitedDevtronApps().catch(showError)
    }, [appId])

    if (!recentlyVisitedDevtronApps) {
        return null
    }

    const recentlyVisitedDevtronAppsOptions = [
        {
            label: 'Recently Visited',
            options: recentlyVisitedDevtronApps.map(({ appId, appName }) => ({ value: appId, label: appName })),
        },
    ]

    const allAppListGroupedOptions = async (inputValue) => {
        try {
            const response = (await appListOptions(inputValue, isJobView, abortControllerRef.current.signal)) || []
            return {
                label: 'All Applications',
                options: response,
            }
        } catch (error) {
            showError(error)
            return { label: 'All Applications', options: [] }
        }
    }

    const loadAllAppListOptions = (inputValue) =>
        abortPreviousRequests(() => allAppListGroupedOptions(inputValue), abortControllerRef)

    const defaultOptions = [{ value: appId, label: appName }]

    const appResponse = async (inputValue) => {
        if (inputValue.length <= 2 && recentlyVisitedDevtronApps.length) {
            const filteredApps = recentlyVisitedDevtronAppsOptions[0].options.filter(({ label }) =>
                label.toLowerCase().includes(inputValue.toLowerCase()),
            )
            return filteredApps.length ? filteredApps : recentlyVisitedDevtronAppsOptions
        }

        // ✅ Extracting only `options` from the grouped object
        const groupedResponse = await loadAllAppListOptions(inputValue)
        return groupedResponse.options || []
    }

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
            loadOptions={appResponse}
            noOptionsMessage={!recentlyVisitedDevtronApps?.length ? noOptionsMessage : noop}
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

export default AppSelector
