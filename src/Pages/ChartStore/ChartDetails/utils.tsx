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

import { SelectPickerProps } from '@devtron-labs/devtron-fe-common-lib'

import { ChartDetailsSearchParams, ChartDetailsSegment, ChartSelectorOptionType } from './types'

export const parseChartDetailsSearchParams = (searchParams: URLSearchParams): ChartDetailsSearchParams => ({
    tab: (searchParams.get('tab') as ChartDetailsSegment) || ChartDetailsSegment.README,
})

export const chartSelectorFormatOptionLabel = ({
    label,
    chart_name: chartName,
}: ChartSelectorOptionType): ReturnType<SelectPickerProps['formatOptionLabel']> =>
    chartName ? (
        <div>
            <span className="cn-7">{chartName}</span> / <span className="cn-9">{label}</span>
        </div>
    ) : (
        label
    )

export const chartSelectorFilterOption: SelectPickerProps['filterOption'] = ({ data }, searchString) => {
    if (!searchString) {
        return true
    }

    const { label, chart_name: chartName } = data as ChartSelectorOptionType
    const searchStringLowerCase = searchString.toLowerCase()

    if (typeof label === 'string') {
        return label.toLowerCase().includes(searchStringLowerCase)
    }

    return (chartName || '').toLowerCase().includes(searchStringLowerCase)
}

export const getParsedChartYAML = (chartYaml: string) => {
    if (!chartYaml) {
        return null
    }

    try {
        return JSON.parse(chartYaml)
    } catch {
        return null
    }
}
