import { useEffect, useMemo, useState } from 'react'

import {
    Chart,
    ChartProps,
    GenericSectionErrorState,
    getHandleOpenURL,
    getSelectPickerOptionByValue,
    OVERVIEW_PAGE_SIZE_OPTIONS,
    Pagination,
    SelectPicker,
    SelectPickerOptionType,
    SelectPickerVariantType,
    SORT_ORDER_OPTIONS,
    SortingOrder,
    TabGroup,
    TIME_WINDOW,
    TIME_WINDOW_SELECT_OPTIONS,
    URLS,
    useStateFilters,
} from '@devtron-labs/devtron-fe-common-lib'

import { DEFAULT_TIME_WINDOW } from '../constants'
import { SectionEmptyState, SectionLoadingCard } from '../Overview.components'
import { useGetPipelineInsights } from '../services'
import { PipelineType } from '../types'
import { MIN_X_AXIS_VALUE } from './constants'
import { getPipelineInsightsChartTooltip } from './tooltipUtils'

const PipelineTriggerInsights = () => {
    const [selectedWindowOption, setSelectedWindowOption] = useState(DEFAULT_TIME_WINDOW)
    const [pipelineType, setPipelineType] = useState<PipelineType>(PipelineType.BUILD)
    const [sortOrder, setSortingOrder] = useState<SortingOrder>(SortingOrder.DESC)
    const [maxTriggerCount, setMaxTriggerCount] = useState(MIN_X_AXIS_VALUE) // Using 1 for fallback value as it is max value of x axis in chart

    const { offset, pageSize, changePage, changePageSize, clearFilters } = useStateFilters({
        defaultPageSize: OVERVIEW_PAGE_SIZE_OPTIONS[0].value,
    })

    const { isFetching, data, isError, refetch } = useGetPipelineInsights({
        timeWindow: selectedWindowOption,
        pipelineType,
        offset,
        pageSize,
        sortOrder,
    })

    const { totalCount, pipelines } = useMemo(() => data ?? { totalCount: 0, pipelines: [] }, [data])

    const isBuildTriggerInsights = pipelineType === PipelineType.BUILD

    // update maxTriggerCount when pipelineType or timeWindow changes
    useEffect(() => {
        if (sortOrder === SortingOrder.DESC && offset === 0 && pipelines.length) {
            setMaxTriggerCount(pipelines[0].triggerCount || MIN_X_AXIS_VALUE)
        }
    }, [pipelines])

    const xAxisLabels = useMemo(
        () =>
            pipelines.map(
                ({ appName, envName, pipelineName }) =>
                    `${appName} • ${isBuildTriggerInsights ? pipelineName : envName}`,
            ),
        [pipelines, isBuildTriggerInsights],
    )

    const datasets = useMemo(
        () =>
            [
                {
                    datasetName: `${isBuildTriggerInsights ? 'Build' : 'Deployment'} trigger count`,
                    yAxisValues: pipelines.map(({ triggerCount }) => triggerCount),
                    color: 'SkyBlue500',
                    isClickable: true,
                },
            ] satisfies (ChartProps & { type: 'stackedBarHorizontal' })['datasets'],
        [isBuildTriggerInsights, pipelines],
    )

    const handleChangeTimeWindow = (selectedPeriod: SelectPickerOptionType<TIME_WINDOW>) => {
        setSelectedWindowOption(selectedPeriod.value)
        clearFilters()
    }

    const handleChangeSorting = (selectedSortOrder: SelectPickerOptionType<SortingOrder>) => {
        clearFilters()
        setSortingOrder(selectedSortOrder.value)
    }

    const getTabChangeHandler = (tabId: PipelineType) => () => {
        setPipelineType(tabId)
        clearFilters()
    }

    const handleChartClick: ChartProps['onChartClick'] = (_, index) => {
        const { appId, envId, pipelineId } = pipelines[index]

        // For build pipelines pipelineId is required and for deployment pipelines envId is required
        if (appId && !!(isBuildTriggerInsights ? pipelineId : envId)) {
            const url = `${window.__BASE_URL__}${URLS.APPLICATION_MANAGEMENT_APP}/${appId}/${isBuildTriggerInsights ? URLS.APP_CI_DETAILS : URLS.CD_DETAILS}/${isBuildTriggerInsights ? pipelineId : envId}`
            getHandleOpenURL(url)()
        }
    }

    const renderChart = () => {
        if (isFetching) {
            return (
                <div className="h-400">
                    <SectionLoadingCard />
                </div>
            )
        }

        if (isError) {
            return <GenericSectionErrorState subTitle="" reload={refetch} />
        }

        if (!pipelines.length) {
            return (
                <SectionEmptyState
                    title={`No ${isBuildTriggerInsights ? 'builds' : 'deployments'} triggered`}
                    subtitle={`${isBuildTriggerInsights ? 'Build' : 'Deployment'} was not triggered in the selected duration`}
                />
            )
        }

        return (
            // Custom logic for height according to number of pipeliens, update when barThickness is added in chart
            <div className="p-16 mh-200 mxh-600" style={{ height: (pipelines.length + 1) * 40 }}>
                <Chart
                    id={`most-least-triggered-${pipelineType}`}
                    type="stackedBarHorizontal"
                    xAxisLabels={xAxisLabels}
                    datasets={datasets}
                    onChartClick={handleChartClick}
                    xAxisMax={maxTriggerCount}
                    tooltipConfig={{ getTooltipContent: getPipelineInsightsChartTooltip(isBuildTriggerInsights) }}
                />
            </div>
        )
    }

    return (
        <div className="flexbox-col br-8 border__secondary bg__primary">
            <div className="flex dc__content-space px-16 py-12">
                <span className="fs-14 lh-1-5 cn-9 fw-6">Most & least triggered pipelines</span>
                <div className="flex dc__gap-12">
                    <SelectPicker
                        inputId="select-triggered-pipeline-metric-range"
                        options={TIME_WINDOW_SELECT_OPTIONS}
                        variant={SelectPickerVariantType.COMPACT}
                        value={getSelectPickerOptionByValue(TIME_WINDOW_SELECT_OPTIONS, selectedWindowOption)}
                        onChange={handleChangeTimeWindow}
                        isSearchable={false}
                        shouldMenuAlignRight
                    />
                    <div className="divider__secondary" />
                    <SelectPicker
                        inputId="select-triggered-pipeline-sort-order"
                        options={SORT_ORDER_OPTIONS}
                        variant={SelectPickerVariantType.COMPACT}
                        value={getSelectPickerOptionByValue(SORT_ORDER_OPTIONS, sortOrder)}
                        onChange={handleChangeSorting}
                        isSearchable={false}
                        shouldMenuAlignRight
                    />
                </div>
            </div>
            <div className="px-16 border__secondary--bottom">
                <TabGroup
                    tabs={[
                        {
                            id: PipelineType.BUILD,
                            label: 'Build Pipelines',
                            tabType: 'button',
                            props: { onClick: getTabChangeHandler(PipelineType.BUILD) },
                            active: isBuildTriggerInsights,
                        },
                        {
                            id: PipelineType.DEPLOYMENT,
                            label: 'Deployment Pipelines',
                            tabType: 'button',
                            props: { onClick: getTabChangeHandler(PipelineType.DEPLOYMENT) },
                            active: !isBuildTriggerInsights,
                        },
                    ]}
                />
            </div>
            {renderChart()}
            {totalCount > OVERVIEW_PAGE_SIZE_OPTIONS[0].value && (
                <Pagination
                    size={totalCount}
                    offset={offset}
                    pageSize={pageSize}
                    changePage={changePage}
                    changePageSize={changePageSize}
                    pageSizeOptions={OVERVIEW_PAGE_SIZE_OPTIONS}
                    rootClassName="flex dc__content-space border__secondary--top px-16"
                />
            )}
        </div>
    )
}

export default PipelineTriggerInsights
