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

import { useEffect, useRef, useState } from 'react'
import {
    ComponentSizeType,
    AppSelectorNoOptionsMessage as appSelectorNoOptionsMessage,
    SelectPicker,
    SelectPickerProps,
    SelectPickerVariantType,
    showError,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'
import { useUserPreferences } from '@Components/common/UserPrefrences/useUserPrefrences'
import { appListSelectOptions } from './AppSelectorUtil'
import { AppSelectorType, RecentlyVisitedOptions } from './AppSelector.types'
import { fetchRecentlyVisitedDevtronApps } from './service'

const AppSelector = ({ onChange, appId, appName, isJobView }: AppSelectorType) => {
    const abortControllerRef = useRef<AbortController>(new AbortController())

    const { recentlyVisitedDevtronApps, handleFetchUserPreferences, setRecentlyVisitedDevtronApps } =
        useUserPreferences()
    const [inputValue, setInputValue] = useState('')

    const [loading, selectOptions] = useAsync(
        () =>
            appListSelectOptions(inputValue, isJobView, abortControllerRef.current.signal, recentlyVisitedDevtronApps),
        [inputValue, isJobView, recentlyVisitedDevtronApps],
        !!appName && !!appId,
    )

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await fetchRecentlyVisitedDevtronApps(appId, appName)
                setRecentlyVisitedDevtronApps(res)
                await handleFetchUserPreferences()
            } catch (error) {
                showError(error)
            }
        }
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        fetch()
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
    }, [appId, appName])

    const onInputChange: SelectPickerProps['onInputChange'] = async (val) => {
        setInputValue(val)
    }

    const customSelect = (option, searchText: string) =>
        option.data.value === 0 || option.data.label.toLowerCase().includes(searchText.toLowerCase())

    const getNoOptions = () => appSelectorNoOptionsMessage(null, true)

    return (
        <SelectPicker
            inputId={`${isJobView ? 'job' : 'app'}-name`}
            options={selectOptions || []}
            inputValue={inputValue}
            onInputChange={onInputChange}
            isLoading={loading}
            noOptionsMessage={getNoOptions}
            onChange={onChange}
            value={{ value: appId, label: appName }}
            variant={SelectPickerVariantType.BORDER_LESS}
            placeholder={appName}
            isOptionDisabled={(option: RecentlyVisitedOptions) => option.isDisabled}
            size={ComponentSizeType.xl}
            menuSize={ComponentSizeType.medium}
            filterOption={customSelect}
        />
    )
}

export default AppSelector
