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
import { useEffect, useRef, useMemo } from 'react'
import { SelectInstance, GroupBase, OptionsOrGroups } from 'react-select'
import {
    abortPreviousRequests,
    showError,
    SelectPickerVariantType,
    ComponentSizeType,
    useAsync,
    SelectPickerOptionType,
    AsyncSelectPicker,
} from '@devtron-labs/devtron-fe-common-lib'
import { AppSelectorType, RecentlyVisitedSelectPickerTypes } from './types'
import { getDropdownOptions, fetchRecentlyVisitedDevtronApps, getNoOptionsMessage } from './AppSelectorUtil'
import { fetchAllAppListGroupedOptions } from './AppSelectorService'

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
        if (result) {
            setRecentlyVisitedDevtronApps(result)
        }
    }, [result])

    const memoizedDropdownOptions = useMemo(
        () => (inputValue) => getDropdownOptions(inputValue, recentlyVisitedDevtronApps, appId),
        [recentlyVisitedDevtronApps, appId],
    )

    const loadAllAppListOptions = async (inputValue: string) => {
        try {
            const response = await abortPreviousRequests(
                () => fetchAllAppListGroupedOptions(inputValue, isJobView, abortControllerRef.current.signal),
                abortControllerRef,
            )
            return response || []
        } catch (error) {
            showError(error)
            return []
        }
    }

    // Load App Options Based on Input
    const loadOptions = async (
        inputValue: string,
    ): Promise<OptionsOrGroups<SelectPickerOptionType<number>, GroupBase<SelectPickerOptionType<number>>>> => {
        if (!inputValue) {
            return recentlyVisitedDevtronApps?.length
                ? memoizedDropdownOptions(inputValue)
                : [{ value: appId, label: appName }]
        }

        if (inputValue.length <= 2) {
            return memoizedDropdownOptions(inputValue)
        }

        return loadAllAppListOptions(inputValue)
    }

    const handleOnKeyDown = (event) => {
        if (event.key === 'Escape') {
            selectRef.current?.inputRef.blur()
        }
    }

    const noOptionsMessage = (inputObj: { inputValue: string }) =>
        getNoOptionsMessage(inputObj?.inputValue, recentlyVisitedDevtronApps?.length > 0)

    if (!recentlyVisitedDevtronApps) return null

    return (
        <AsyncSelectPicker
            blurInputOnSelect
            onKeyDown={handleOnKeyDown}
            defaultOptions={memoizedDropdownOptions('')}
            loadOptions={loadOptions}
            noOptionsMessage={noOptionsMessage}
            onChange={onChange}
            value={{ value: appId, label: appName }}
            variant={SelectPickerVariantType.BORDER_LESS}
            size={ComponentSizeType.xl}
            placeholder={appName}
            isOptionDisabled={(option: RecentlyVisitedSelectPickerTypes) => option.isDisabled}
        />
    )
}

export default AppSelector
