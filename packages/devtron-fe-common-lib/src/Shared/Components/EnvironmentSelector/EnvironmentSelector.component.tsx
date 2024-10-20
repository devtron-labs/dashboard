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

import { useMemo } from 'react'
import ReactSelect from 'react-select'
import { GenericSectionErrorState } from '../GenericSectionErrorState'
import { commonSelectStyles, GroupHeading, LoadingIndicator } from '../ReactSelect'
import { ClearIndicator, useAsync } from '../../../Common'
import { ENVIRONMENT_SELECTOR_TEXT } from './constants'
import { getEnvironmentsGroupedByCluster } from './service'
import { EnvironmentSelectorProps } from './types'
import { getSelectedOptions } from './utils'

const EnvironmentSelector = <T,>({
    handleEnvironmentChange,
    selectedEnvironmentsMap,
    isMulti,
    placeholder = ENVIRONMENT_SELECTOR_TEXT.DEFAULT_PLACEHOLDER,
    processOptions,
    styles,
    isClearable,
    autoFocus,
}: EnvironmentSelectorProps<T>) => {
    const [areOptionsLoading, allEnvironmentOptions, optionsError, reloadOptions] = useAsync(
        getEnvironmentsGroupedByCluster,
    )
    const options = useMemo(() => {
        if (!allEnvironmentOptions) {
            return []
        }

        return processOptions?.(allEnvironmentOptions) || allEnvironmentOptions
    }, [allEnvironmentOptions, processOptions])

    const value = useMemo(() => {
        const selectedOptions = getSelectedOptions<T>(selectedEnvironmentsMap, options)
        if (isMulti) {
            return selectedOptions
        }

        return selectedOptions?.[0] || null
    }, [selectedEnvironmentsMap, options, isMulti])

    const renderNoEnvironmentMessage = () => {
        if (optionsError) {
            return <GenericSectionErrorState withBorder reload={reloadOptions} />
        }

        return (
            <p className="m-0 cn-7 fs-13 fw-4 lh-20 py-6 px-8">{ENVIRONMENT_SELECTOR_TEXT.NO_ENVIRONMENTS_AVAILABLE}</p>
        )
    }

    return (
        <ReactSelect
            isMulti={isMulti}
            options={options}
            value={value}
            onChange={handleEnvironmentChange}
            isSearchable
            isClearable={isClearable}
            isLoading={areOptionsLoading}
            placeholder={placeholder}
            components={{
                IndicatorSeparator: null,
                LoadingIndicator,
                NoOptionsMessage: renderNoEnvironmentMessage,
                GroupHeading,
                ClearIndicator,
            }}
            styles={styles ?? commonSelectStyles}
            backspaceRemovesValue={false}
            autoFocus={autoFocus}
        />
    )
}

export default EnvironmentSelector
