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

import { useRef } from 'react'
import AsyncSelect from 'react-select/async'

import {
    abortPreviousRequests,
    APP_SELECTOR_STYLES,
    AppSelectorDropdownIndicator,
    AppSelectorNoOptionsMessage,
} from '@devtron-labs/devtron-fe-common-lib'

import { EnvSelectorType } from './AppGroup.types'
import { envListOptions } from './AppGroup.utils'

export const EnvSelector = ({ onChange, envId, envName }: EnvSelectorType) => {
    const abortControllerRef = useRef<AbortController>(new AbortController())
    const defaultOptions = { value: envId, label: envName }

    const handleFetchOptions = (inputValue: string) =>
        abortPreviousRequests(() => envListOptions(inputValue, abortControllerRef.current.signal), abortControllerRef)

    return (
        <AsyncSelect
            loadOptions={handleFetchOptions}
            noOptionsMessage={AppSelectorNoOptionsMessage}
            onChange={onChange}
            value={defaultOptions}
            components={{
                IndicatorSeparator: null,
                DropdownIndicator: AppSelectorDropdownIndicator,
                LoadingIndicator: null,
            }}
            styles={APP_SELECTOR_STYLES}
        />
    )
}
