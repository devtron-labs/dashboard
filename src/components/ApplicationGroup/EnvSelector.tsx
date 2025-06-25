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
    ContextSwitcher,
    RecentlyVisitedOptions,
    SelectPickerProps,
    useAsync,
    useUserPreferences,
} from '@devtron-labs/devtron-fe-common-lib'

import { APP_DETAILS_GA_EVENTS } from '@Components/AppSelector/constants'

import { EnvSelectorType } from './AppGroup.types'
import { envListOptions } from './AppGroup.utils'

export const EnvSelector = ({ onChange, envId, envName }: EnvSelectorType) => {
    const abortControllerRef = useRef<AbortController>(new AbortController())
    const defaultOptions = { value: envId, label: envName }
    const isEnvDataAvailable = !!envId && !!envName

    const [inputValue, setInputValue] = useState('')
    const { recentlyVisitedResources } = useUserPreferences({
        recentlyVisitedFetchConfig: {
            id: envId,
            name: envName,
            resourceKind: 'app-group',
            isDataAvailable: isEnvDataAvailable,
        },
    })

    const [loading, selectOptions, error, reload] = useAsync(
        () => envListOptions(inputValue, abortControllerRef.current.signal, recentlyVisitedResources),
        [inputValue, recentlyVisitedResources],
        isEnvDataAvailable && !!recentlyVisitedResources.length,
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
            inputId={`app-group-switcher-${envId}`}
            placeholder={envName}
            inputValue={inputValue}
            onInputChange={onInputChange}
            optionListError={error}
            reloadOptionList={reload}
        />
    )
}
