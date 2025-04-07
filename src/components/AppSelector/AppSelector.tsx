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

import { useRef, useState } from 'react'
import ReactGA from 'react-ga4'
import {
    ComponentSizeType,
    SelectPicker,
    SelectPickerProps,
    SelectPickerVariantType,
    useAsync,
    ResourceKindType,
    UserPreferenceResourceActions,
    BaseAppMetaData,
    getNoMatchingResultText,
    useUserPreferences,
    AppSelectorNoOptionsMessage as appSelectorNoOptionsMessage,
    SelectPickerOptionType,
} from '@devtron-labs/devtron-fe-common-lib'
import { ActionMeta } from 'react-select'
import { appListOptions } from './AppSelectorUtil'
import { AppSelectorType, RecentlyVisitedOptions } from './AppSelector.types'
import { APP_DETAILS_GA_EVENTS } from './constants'

const AppSelector = ({ onChange, appId, appName, isJobView }: AppSelectorType) => {
    const abortControllerRef = useRef<AbortController>(new AbortController())

    const { userPreferences, fetchRecentlyVisitedParsedApps } = useUserPreferences({})
    const [inputValue, setInputValue] = useState('')

    const recentlyVisitedDevtronApps =
        userPreferences?.resources?.[ResourceKindType.devtronApplication]?.[
            UserPreferenceResourceActions.RECENTLY_VISITED
        ] || ([] as BaseAppMetaData[])

    const isAppDataAvailable = !!appId && !!appName
    const shouldFetchAppOptions = isJobView ? true : !!recentlyVisitedDevtronApps.length

    const [loading, selectOptions] = useAsync(
        () =>
            appListOptions({
                inputValue,
                isJobView,
                signal: abortControllerRef.current.signal,
                recentlyVisitedDevtronApps,
            }),
        [inputValue, isJobView],
        isAppDataAvailable && shouldFetchAppOptions,
    )

    // fetching recently visited apps only in case of devtron apps
    useAsync(
        () => fetchRecentlyVisitedParsedApps({ appId, appName }),
        [appId, appName],
        isAppDataAvailable && !isJobView,
    )

    const onInputChange: SelectPickerProps['onInputChange'] = async (val) => {
        setInputValue(val)
    }

    const customSelect: SelectPickerProps['filterOption'] = (option, searchText: string) => {
        const label = option.data.label as string
        return option.data.value === 0 || label.toLowerCase().includes(searchText.toLowerCase())
    }

    const getDisabledOptions = (option: RecentlyVisitedOptions): SelectPickerProps['isDisabled'] => option.isDisabled

    const noOptionsMessage = () =>
        isJobView
            ? appSelectorNoOptionsMessage({
                  inputValue,
              })
            : getNoMatchingResultText()

    const _selectOption = selectOptions?.map((section) => ({
        ...section,
        options: section.label === 'Recently Visited' ? section.options.slice(1) : section.options,
    }))

    const handleChange = (
        selectedOption: RecentlyVisitedOptions,
        actionMeta: ActionMeta<SelectPickerOptionType<string | number>>,
    ) => {
        onChange(selectedOption, actionMeta)

        if (!isJobView) {
            ReactGA.event(
                selectedOption.isRecentlyVisited
                    ? APP_DETAILS_GA_EVENTS.RecentlyVisitedApps
                    : APP_DETAILS_GA_EVENTS.SearchesAppClicked,
            )
        }
    }

    return (
        <SelectPicker
            inputId={`${isJobView ? 'job' : 'app'}-name`}
            options={_selectOption || []}
            inputValue={inputValue}
            onInputChange={onInputChange}
            isLoading={loading}
            noOptionsMessage={noOptionsMessage}
            onChange={handleChange}
            value={{ value: appId, label: appName }}
            variant={SelectPickerVariantType.BORDER_LESS}
            placeholder={appName}
            isOptionDisabled={getDisabledOptions}
            size={ComponentSizeType.xl}
            filterOption={customSelect}
        />
    )
}

export default AppSelector
