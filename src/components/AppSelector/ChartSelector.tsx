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

import { useParams, useHistory, generatePath, useRouteMatch } from 'react-router-dom'
import { GroupBase } from 'react-select'
import {
    useAsync,
    SelectPickerOptionType,
    ContextSwitcher,
    Icon,
    handleAnalyticsEvent,
} from '@devtron-labs/devtron-fe-common-lib'
import { mapByKey } from '../common'
import { ChartSelectorType } from './AppSelector.types'
import { appSelectorGAEvents } from './constants'

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
    const selectApp = (selected) => {
        if (onChange) {
            onChange(selected)
            return
        }
        handleAnalyticsEvent({
            category: 'Chart Store',
            action: appSelectorGAEvents.CS_CHART_DETAIL_SWITCH_ITEM_CLICKED,
        })
        const keys = listMap.get(selected.value)
        const replacements = [...matchedKeys].reduce((agg, curr) => ({ ...agg, [curr]: keys[curr] }), {})
        const newUrl = generatePath(path, { ...replacements, [primaryKey]: selected.value })
        push(newUrl)
    }

    const getChartsOptions = (): GroupBase<SelectPickerOptionType<string | number>>[] => [
        {
            label: 'All Charts',
            options:
                result?.result?.map((res) => ({
                    value: res[apiPrimaryKey || primaryKey],
                    label: res[primaryValue],
                    description: res.chart_name || res.docker_artifact_store_id,
                    endIcon: res.deprecated && <Icon name="ic-warning" color={null} size={16} />,
                })) || [],
        },
    ]

    const selectedChartLabel = listMap.has(_primaryKey) ? (listMap.get(_primaryKey)[primaryValue] as string) : ''

    return (
        <ContextSwitcher
            inputId={`chart-switcher-${_primaryKey}`}
            options={getChartsOptions()}
            isLoading={loading}
            onChange={selectApp}
            value={{
                value: _primaryKey,
                label: selectedChartLabel,
            }}
            placeholder={selectedChartLabel}
            {...(formatOptionLabel ? { formatOptionLabel } : {})}
            {...(filterOption ? { filterOption } : {})}
            optionListError={error}
            reloadOptionList={reload}
        />
    )
}
