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
import { useEffect, useRef, useMemo, useState } from 'react'
import { SelectInstance } from 'react-select'
import {
    SelectPickerVariantType,
    ComponentSizeType,
    useAsync,
    SelectPicker,
    SelectPickerProps,
} from '@devtron-labs/devtron-fe-common-lib'
import { AppSelectorType, RecentlyVisitedOptionsType, RecentlyVisitedOptions } from './types'
import { getDropdownOptions, fetchRecentlyVisitedDevtronApps, getNoOptionsMessage } from './AppSelectorUtil'
import { fetchAllAppListGroupedOptions } from './AppSelectorService'
import { AllApplicationsMetaData } from './constants'

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
    const [options, setOptions] = useState<RecentlyVisitedOptionsType[]>([])
    const [inputValue, setInputValue] = useState('')
    const [areOptionsLoading, setAreOptionsLoading] = useState(false)

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

    const memoizedDropdownOptions: RecentlyVisitedOptionsType[] = useMemo(
        () => getDropdownOptions(inputValue, recentlyVisitedDevtronApps, appId),
        [recentlyVisitedDevtronApps, appId, inputValue],
    )

    const loadOptions = async (_inputValue: string) => {
        if (!_inputValue) {
            return recentlyVisitedDevtronApps?.length ? memoizedDropdownOptions : [AllApplicationsMetaData]
        }

        if (_inputValue.length <= 2) {
            return memoizedDropdownOptions
        }

        setAreOptionsLoading(true)
        const response = await fetchAllAppListGroupedOptions(_inputValue, isJobView, abortControllerRef.current.signal)
        setAreOptionsLoading(false)

        return response || []
    }

    useEffect(() => {
        // Fetch options on component mount
        const fetchOptions = async () => {
            const _options: RecentlyVisitedOptionsType[] = await loadOptions('')
            setOptions(_options)
        }

        fetchOptions()
    }, [recentlyVisitedDevtronApps])

    const onInputChange: SelectPickerProps['onInputChange'] = async (val) => {
        setInputValue(val)
        const _options = await loadOptions(val)
        setOptions(_options)
    }

    const handleOnKeyDown = (event) => {
        if (event.key === 'Escape') {
            selectRef.current?.inputRef.blur()
        }
    }

    if (!recentlyVisitedDevtronApps) return null

    const customSelect = (option, searchText: string) => {
        // Show meta info in the 'All Applications' option
        if (option.data.value === 0) {
            return true
        }

        return option.data.label.toLowerCase().includes(searchText.toLowerCase())
    }

    return (
        <SelectPicker
            inputId={`${isJobView ? 'job' : 'app'}-name`}
            onKeyDown={handleOnKeyDown}
            options={options}
            inputValue={inputValue}
            onInputChange={onInputChange}
            isLoading={areOptionsLoading}
            noOptionsMessage={getNoOptionsMessage}
            onChange={onChange}
            value={{ value: appId, label: appName }}
            variant={SelectPickerVariantType.BORDER_LESS}
            placeholder={appName}
            isOptionDisabled={(option: RecentlyVisitedOptions) => option.isDisabled}
            size={ComponentSizeType.xl}
            filterOption={customSelect}
            menuSize={ComponentSizeType.medium}
        />
    )
}

export default AppSelector
