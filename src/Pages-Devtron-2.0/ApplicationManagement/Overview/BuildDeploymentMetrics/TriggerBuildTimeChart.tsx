import { useMemo, useState } from 'react'

import {
    Chart,
    ChartProps,
    GenericSectionErrorState,
    getSelectPickerOptionByValue,
    SelectPicker,
    SelectPickerOptionType,
    SelectPickerVariantType,
    TIME_WINDOW,
    TIME_WINDOW_SELECT_OPTIONS,
} from '@devtron-labs/devtron-fe-common-lib'

import { DEFAULT_TIME_WINDOW } from '../constants'
import { ChartHeaderTab, SectionEmptyState, SectionLoadingCard } from '../Overview.components'
import { useGetBuildDeploymentActivity, useGetBuildDeploymentActivityDetailed } from '../services'
import { BuildDeployOverviewActivityKind } from '../types'
import { parseMinutesInDayHourUnit } from '../utils'
import { getAvgBuildTimeTooltip, getBuildDeploymentTriggerTooltip } from './tooltipUtils'
import { NoBuildDeploymentTriggeredProps } from './types'

const NoBuildDeploymentTriggered = ({ isDeploymentTriggerChart }: NoBuildDeploymentTriggeredProps) => (
    <div className="h-200 flex">
        <SectionEmptyState
            title={`No ${isDeploymentTriggerChart ? 'deployments' : 'builds'} triggered`}
            subtitle={`${isDeploymentTriggerChart ? 'Deployment' : 'Build'} was not triggered in the selected duration`}
        />
    </div>
)

const TriggerBuildTimeChart = () => {
    const [selectedChartTab, setSelectedChartTab] = useState<BuildDeployOverviewActivityKind>(
        BuildDeployOverviewActivityKind.BUILD_TRIGGER,
    )
    const [selectedWindowOption, setSelectedWindowOption] = useState(DEFAULT_TIME_WINDOW)

    const { isFetching, data, isError, refetch } = useGetBuildDeploymentActivity(selectedWindowOption)

    const {
        isFetching: fetchingChartDetails,
        data: chartData,
        isError: chartError,
        refetch: refetchChartData,
    } = useGetBuildDeploymentActivityDetailed(selectedWindowOption, selectedChartTab)

    const { averageBuildTime, totalDeploymentTriggers, totalBuildTriggers } = data ?? {
        averageBuildTime: 0,
        totalBuildTriggers: 0,
        totalDeploymentTriggers: 0,
    }

    const xAxisLabels: ChartProps['xAxisLabels'] = useMemo(
        () => (chartData ?? []).map((item) => item.timestampLabel),
        [chartData],
    )

    const buildDeploymentTriggerDatasets: (ChartProps & { type: 'line' })['datasets'] = useMemo(
        () => [
            {
                datasetName: 'Failed',
                yAxisValues: (chartData ?? []).map((item) => item.failed),
                color: 'CoralRed300',
            },
            {
                datasetName: 'Successful',
                yAxisValues: (chartData ?? []).map((item) => item.successful),
                color: 'LimeGreen300',
            },
            {
                datasetName: `${
                    selectedChartTab === BuildDeployOverviewActivityKind.DEPLOYMENT_TRIGGER ? 'Deployment' : 'Build'
                } triggers`,
                yAxisValues: (chartData ?? []).map((item) => item.total),
                color: 'SkyBlue300',
            },
        ],
        [chartData, selectedChartTab],
    )

    const avgBuildTimeDatasets: (ChartProps & { type: 'area' })['datasets'] = useMemo(
        () => ({
            datasetName: 'Avg. Build Time (mins)',
            yAxisValues: (chartData ?? []).map(({ averageBuildTime: currentAvg }) => currentAvg),
            color: 'SkyBlue300',
        }),
        [chartData],
    )

    const handleChangeTimeWindow = (selectedWindow: SelectPickerOptionType<TIME_WINDOW>) => {
        setSelectedWindowOption(selectedWindow.value)
    }

    const getOnChangeChartTabHandler = (tab: BuildDeployOverviewActivityKind) => () => {
        setSelectedChartTab(tab)
    }

    const renderTotalBuildDeploymentChart = () => (
        <div className="p-16 h-300">
            <Chart
                id={`${selectedChartTab}Chart"`}
                type="line"
                xAxisLabels={xAxisLabels}
                datasets={buildDeploymentTriggerDatasets}
                tooltipConfig={{ getTooltipContent: getBuildDeploymentTriggerTooltip(chartData, selectedWindowOption) }}
                yScaleTitle={
                    selectedChartTab === BuildDeployOverviewActivityKind.DEPLOYMENT_TRIGGER
                        ? 'Deployment Triggers'
                        : 'Build Triggers'
                }
            />
        </div>
    )

    const renderChart = () => {
        if (isFetching || fetchingChartDetails) {
            return <SectionLoadingCard />
        }

        if (chartError) {
            return <GenericSectionErrorState subTitle="" reload={refetchChartData} />
        }

        switch (selectedChartTab) {
            case BuildDeployOverviewActivityKind.BUILD_TRIGGER:
                return totalBuildTriggers ? renderTotalBuildDeploymentChart() : <NoBuildDeploymentTriggered />
            case BuildDeployOverviewActivityKind.DEPLOYMENT_TRIGGER:
                return totalDeploymentTriggers ? (
                    renderTotalBuildDeploymentChart()
                ) : (
                    <NoBuildDeploymentTriggered
                        isDeploymentTriggerChart={
                            selectedChartTab === BuildDeployOverviewActivityKind.DEPLOYMENT_TRIGGER
                        }
                    />
                )
            case BuildDeployOverviewActivityKind.AVG_BUILD_TIME: {
                return averageBuildTime ? (
                    <div className="p-16 h-300">
                        <Chart
                            id="build-time-chart"
                            type="area"
                            xAxisLabels={xAxisLabels}
                            datasets={avgBuildTimeDatasets}
                            referenceLines={[{ value: averageBuildTime }]}
                            tooltipConfig={{
                                getTooltipContent: getAvgBuildTimeTooltip(chartData, selectedWindowOption),
                            }}
                            yScaleTitle="Average build time (minutes)"
                        />
                    </div>
                ) : (
                    <NoBuildDeploymentTriggered />
                )
            }
            default:
                return null
        }
    }

    return (
        <div className="flexbox-col br-8 border__secondary bg__primary">
            <div className="flex dc__content-space p-12 border__secondary--bottom">
                <h3 className="fs-14 lh-1-5 fw-6 cn-9 m-0">Triggers & Build Time</h3>
                <SelectPicker
                    inputId="select-trigger-build-time-range"
                    options={TIME_WINDOW_SELECT_OPTIONS}
                    variant={SelectPickerVariantType.COMPACT}
                    value={getSelectPickerOptionByValue(TIME_WINDOW_SELECT_OPTIONS, selectedWindowOption)}
                    onChange={handleChangeTimeWindow}
                    isSearchable={false}
                    shouldMenuAlignRight
                />
            </div>
            {!isFetching && isError ? (
                <GenericSectionErrorState
                    subTitle=""
                    reload={refetch}
                    rootClassName="br-8 border__secondary bg__primary"
                />
            ) : (
                <>
                    <div className="flexbox border__secondary--bottom">
                        <ChartHeaderTab
                            title="Total build triggers"
                            subtitle={`${totalBuildTriggers.toLocaleString()}`}
                            onClick={getOnChangeChartTabHandler(BuildDeployOverviewActivityKind.BUILD_TRIGGER)}
                            isActive={selectedChartTab === BuildDeployOverviewActivityKind.BUILD_TRIGGER}
                            isLoading={isFetching}
                        />
                        <ChartHeaderTab
                            title="Avg. build time"
                            subtitle={parseMinutesInDayHourUnit(averageBuildTime)}
                            onClick={getOnChangeChartTabHandler(BuildDeployOverviewActivityKind.AVG_BUILD_TIME)}
                            isActive={selectedChartTab === BuildDeployOverviewActivityKind.AVG_BUILD_TIME}
                            isLoading={isFetching}
                        />
                        <ChartHeaderTab
                            title="Total deployment triggers"
                            subtitle={`${totalDeploymentTriggers.toLocaleString()}`}
                            onClick={getOnChangeChartTabHandler(BuildDeployOverviewActivityKind.DEPLOYMENT_TRIGGER)}
                            isActive={selectedChartTab === BuildDeployOverviewActivityKind.DEPLOYMENT_TRIGGER}
                            isLoading={isFetching}
                        />
                    </div>

                    {renderChart()}
                </>
            )}
        </div>
    )
}

export default TriggerBuildTimeChart
