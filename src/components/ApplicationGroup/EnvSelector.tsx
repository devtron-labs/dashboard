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
    BaseAppMetaData,
    ResourceKindType,
    SelectPickerProps,
    useAsync,
    UserPreferenceResourceActions,
    useUserPreferences,
} from '@devtron-labs/devtron-fe-common-lib'

import { RecentlyVisitedOptions } from '@Components/AppSelector/AppSelector.types'
import { APP_DETAILS_GA_EVENTS } from '@Components/AppSelector/constants'
import { ContextSwitcher } from '@Components/common/ContextSwitcher/ContextSwitcher'

import { EnvSelectorType } from './AppGroup.types'
import { envListOptions } from './AppGroup.utils'

export const EnvSelector = ({ onChange, envId, envName }: EnvSelectorType) => {
    const abortControllerRef = useRef<AbortController>(new AbortController())
    const defaultOptions = { value: envId, label: envName }

    const [inputValue, setInputValue] = useState('')
    const { userPreferences, fetchRecentlyVisitedParsedApps } = useUserPreferences({})
    const isAppDataAvailable = !!envId && !!envName

    useAsync(
        () =>
            fetchRecentlyVisitedParsedApps({ appId: envId, appName: envName, resourceKind: ResourceKindType.appGroup }),
        [envId, envName],
        isAppDataAvailable,
    )

    const recentlyVisitedDevtronApps =
        userPreferences?.resources?.[ResourceKindType.appGroup]?.[UserPreferenceResourceActions.RECENTLY_VISITED] ||
        ([] as BaseAppMetaData[])

    const [loading, selectOptions] = useAsync(
        () => envListOptions(inputValue, abortControllerRef.current.signal, recentlyVisitedDevtronApps),
        [inputValue, recentlyVisitedDevtronApps],
        isAppDataAvailable && !!recentlyVisitedDevtronApps.length,
    )

    const onInputChange: SelectPickerProps['onInputChange'] = async (val) => {
        setInputValue(val)
    }

    const handleChange = (selectedOption: RecentlyVisitedOptions) => {
        if (selectedOption.label === envName) return

        onChange(selectedOption)

        ReactGA.event(
            selectedOption.isRecentlyVisited
                ? APP_DETAILS_GA_EVENTS.RecentlyVisitedApps
                : APP_DETAILS_GA_EVENTS.SearchesAppClicked,
        )
    }

    return (
        <ContextSwitcher
            isLoading={loading}
            onChange={handleChange}
            value={defaultOptions}
            options={selectOptions}
            inputId="app-group"
            placeholder={envName}
            inputValue={inputValue}
            onInputChange={onInputChange}
        />
    )
}
