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
