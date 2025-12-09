import { useState } from 'react'

import {
    Chart,
    GenericSectionErrorState,
    getSelectPickerOptionByValue,
    RELATIVE_TIME_WINDOW_SELECT_OPTIONS,
    RelativeTimeWindow,
    SelectPicker,
    SelectPickerOptionType,
    SelectPickerVariantType,
} from '@devtron-labs/devtron-fe-common-lib'

import { useGetAutoBlockedDeploymentTrend } from '../services'
import { getBlockedDeploymentChartTooltip } from './utils'

const AutoBlockedDeployments = () => {
    const [timeRange, setTimeRange] = useState<RelativeTimeWindow>(RelativeTimeWindow.LAST_30_DAYS)

    const handleTimeRangeChange = ({ value }: SelectPickerOptionType<RelativeTimeWindow>) => {
        setTimeRange(value)
    }

    const { isFetching, isError, data, refetch } = useGetAutoBlockedDeploymentTrend(timeRange)

    const renderBody = () => {
        if (isFetching) {
            return <div className="h-100 w-100 shimmer" />
        }

        if (isError) {
            return <GenericSectionErrorState reload={refetch} />
        }

        return (
            <Chart
                id="auto-blocked-deployments-chart"
                type="line"
                xAxisLabels={data?.timestampLabels ?? []}
                datasets={[
                    {
                        datasetName: 'Blocked Deployments',
                        yAxisValues: data?.blockedCount ?? [],
                        color: 'CoralRed600',
                    },
                ]}
                yScaleTitle="Blocked Deployments (Count)"
                tooltipConfig={{
                    getTooltipContent: getBlockedDeploymentChartTooltip(data, timeRange),
                }}
            />
        )
    }

    return (
        <div className="flexbox-col bg__primary border__secondary br-8">
            <div className="flex dc__content-space px-16 py-12 border__secondary--bottom">
                <span className="fs-14 fw-6 lh-1-5 cn-9">Automatic Deployments blocked due to security policy</span>
                <SelectPicker
                    inputId="blocked-deployments-time-range-select"
                    options={RELATIVE_TIME_WINDOW_SELECT_OPTIONS}
                    variant={SelectPickerVariantType.COMPACT}
                    value={getSelectPickerOptionByValue(RELATIVE_TIME_WINDOW_SELECT_OPTIONS, timeRange)}
                    onChange={handleTimeRangeChange}
                    isSearchable={false}
                    shouldMenuAlignRight
                />
            </div>
            <div className="flex p-16 h-300">{renderBody()}</div>
        </div>
    )
}

export default AutoBlockedDeployments
