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
import { ActionMeta } from 'react-select'

import {
    ContextSwitcher,
    RecentlyVisitedOptions,
    ResourceKindType,
    SelectPickerOptionType,
    SelectPickerProps,
    useAsync,
    useUserPreferences,
} from '@devtron-labs/devtron-fe-common-lib'

import { AppSelectorType } from './AppSelector.types'
import { appListOptions } from './AppSelectorUtil'
import { APP_DETAILS_GA_EVENTS } from './constants'

const AppSelector = ({ onChange, appId, appName, isJobView }: AppSelectorType) => {
    const abortControllerRef = useRef<AbortController>(new AbortController())
    const isAppDataAvailable = !!appId && !!appName

    const { recentlyVisitedResources } = useUserPreferences({
        recentlyVisitedFetchConfig: {
            id: appId,
            name: appName,
            resourceKind: isJobView ? ResourceKindType.job : ResourceKindType.devtronApplication,
            isDataAvailable: isAppDataAvailable,
        },
    })

    const [inputValue, setInputValue] = useState('')

    const shouldFetchAppOptions = !!recentlyVisitedResources.length

    const [loading, selectOptions] = useAsync(
        () =>
            appListOptions({
                inputValue,
                isJobView,
                signal: abortControllerRef.current.signal,
                recentlyVisitedResources,
            }),
        [inputValue, appId, appName],
        isAppDataAvailable && shouldFetchAppOptions,
    )
    const onInputChange: SelectPickerProps['onInputChange'] = async (val) => {
        setInputValue(val)
    }

    const handleChange = (
        selectedOption: RecentlyVisitedOptions,
        actionMeta: ActionMeta<SelectPickerOptionType<string | number>>,
    ) => {
        if (selectedOption.label === appName) return

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
        <ContextSwitcher
            inputId={`${isJobView ? 'job' : 'app'}-name`}
            options={selectOptions}
            inputValue={inputValue}
            onInputChange={onInputChange}
            isLoading={loading}
            onChange={handleChange}
            value={{ value: appId, label: appName }}
            placeholder={appName}
        />
    )
}

export default AppSelector
