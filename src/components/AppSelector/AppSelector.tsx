/* eslint-disable @typescript-eslint/no-floating-promises */
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
import { Props as SelectProps, SelectInstance, GroupBase, OptionsOrGroups } from 'react-select'
import {
    abortPreviousRequests,
    SelectPickerOptionType,
    showError,
    SelectPickerVariantType,
    ComponentSizeType,
    AsyncSelectPicker,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'
import { AppSelectorType, RecentSelectPickerTypes } from './types'
import { appListOptions, fetchRecentlyVisitedDevtronApps, noOptionsMessage } from './AppSelectorUtil'

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

    const [, result] = useAsync(
        () => fetchRecentlyVisitedDevtronApps(appId, appName),
        [appId, appName],
        !!appName && !!appId,
    )

    useEffect(() => {
        if (!result) return
        setRecentlyVisitedDevtronApps(result)
    }, [result])

    if (!recentlyVisitedDevtronApps) {
        return null
    }

    const filteredRecentlyVisitedApps = (inputValue) =>
        inputValue?.length &&
        recentlyVisitedDevtronApps
            .filter((app) => app.appName.toLowerCase().includes(inputValue.toLowerCase()))
            .map((app) => ({ value: app.appId, label: app.appName }))

    const recentlyVisitedDevtronAppsOptions = (
        inputValue?: string,
    ): OptionsOrGroups<RecentSelectPickerTypes, GroupBase<RecentSelectPickerTypes>> => [
        {
            label: 'Recently Visited',
            options:
                filteredRecentlyVisitedApps(inputValue)?.length || inputValue?.length < 3
                    ? filteredRecentlyVisitedApps(inputValue)
                    : recentlyVisitedDevtronApps
                          .filter((app) => app.appId !== appId)
                          .map((app) => ({ value: app.appId, label: app.appName })),
        },
        {
            label: 'All Applications',
            options: [
                {
                    value: 0,
                    label: 'Type 3 characters to search all applications',
                    isDisabled: true,
                },
            ],
        },
    ]

    const allAppListGroupedOptions = async (inputValue) => {
        try {
            const response = await appListOptions(inputValue, isJobView, abortControllerRef.current.signal)
            return [
                {
                    label: 'All Applications',
                    options: response,
                },
            ]
        } catch (error) {
            showError(error)
            return [{ label: 'All Applications', options: [] }]
        }
    }

    const loadAllAppListOptions = (inputValue) =>
        abortPreviousRequests(() => allAppListGroupedOptions(inputValue), abortControllerRef)

    const defaultOptions = [{ value: appId, label: appName }]

    const appResponse = async (
        inputValue,
    ): Promise<OptionsOrGroups<SelectPickerOptionType<number>, GroupBase<SelectPickerOptionType<number>>>> => {
        if (!inputValue) {
            // Show recently visited apps when clicking the dropdown
            return recentlyVisitedDevtronApps.length ? recentlyVisitedDevtronAppsOptions() : defaultOptions
        }

        if (inputValue.length <= 2 && recentlyVisitedDevtronApps.length) {
            // Show recently visited apps when typing less than 3 characters
            return recentlyVisitedDevtronAppsOptions(inputValue)
        }

        // ✅ Extracting only `options` from the grouped object
        return loadAllAppListOptions(inputValue)
    }

    const handleOnKeyDown: SelectProps['onKeyDown'] = (event) => {
        if (event.key === 'Escape') {
            selectRef.current?.inputRef.blur()
        }
    }

    return (
        <AsyncSelectPicker
            blurInputOnSelect
            onKeyDown={handleOnKeyDown}
            defaultOptions={recentlyVisitedDevtronApps.length ? recentlyVisitedDevtronAppsOptions() : defaultOptions}
            loadOptions={appResponse}
            noOptionsMessage={(inputObj) =>
                noOptionsMessage(inputObj, filteredRecentlyVisitedApps(inputObj?.inputValue)?.length > 0)
            }
            onChange={onChange}
            value={defaultOptions[0]}
            variant={SelectPickerVariantType.BORDER_LESS}
            size={ComponentSizeType.xl}
            placeholder={appName}
            isOptionDisabled={(option: RecentSelectPickerTypes) => option.isDisabled}
        />
    )
}

export default AppSelector
