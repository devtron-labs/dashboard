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

import React from 'react'
import { useParams, useHistory, generatePath, useRouteMatch } from 'react-router-dom'
import Select from 'react-select'
import { useAsync } from '@devtron-labs/devtron-fe-common-lib'
import { mapByKey } from '../common'
import { appSelectorStyle, DropdownIndicator } from './AppSelectorUtil'

interface ChartSelectorType {
    primaryKey: string // url match
    primaryValue: string
    matchedKeys: string[]
    api: () => Promise<any>
    apiPrimaryKey?: string // primary key to generate map
    onChange?: ({ label, value }) => void
    formatOptionLabel?: ({ label, value, ...rest }) => React.ReactNode
    filterOption?: (option: any, searchString: string) => boolean
}
export default function ChartSelector({
    primaryKey,
    primaryValue,
    matchedKeys,
    api,
    apiPrimaryKey,
    onChange,
    formatOptionLabel = null,
    filterOption = null,
}: ChartSelectorType) {
    const [loading, result, error, reload] = useAsync(api, [])
    const listMap = mapByKey(result?.result || [], apiPrimaryKey || primaryKey)
    const { path } = useRouteMatch()
    const params = useParams()
    const { push } = useHistory()
    const _primaryKey = Number(params[primaryKey])
    function selectApp(selected) {
        if (onChange) {
            onChange(selected)
            return
        }
        const keys = listMap.get(selected.value)
        const replacements = [...matchedKeys].reduce((agg, curr) => ({ ...agg, [curr]: keys[curr] }), {})
        const newUrl = generatePath(path, { ...replacements, [primaryKey]: selected.value })
        push(newUrl)
    }
    return (
        <Select
            options={result?.result?.map((res) => ({
                value: res[apiPrimaryKey || primaryKey],
                label: res[primaryValue],
                ...res,
            }))}
            value={{
                value: _primaryKey,
                label: listMap.has(_primaryKey) ? (listMap.get(_primaryKey)[primaryValue] as string) : '',
            }}
            {...(formatOptionLabel ? { formatOptionLabel } : {})}
            {...(filterOption ? { filterOption } : {})}
            onChange={selectApp}
            components={{
                IndicatorSeparator: null,
                DropdownIndicator,
            }}
            styles={appSelectorStyle}
        />
    )
}
