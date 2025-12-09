import { useMemo, useState } from 'react'

import {
    Badge,
    Button,
    ButtonComponentType,
    ButtonStyleType,
    ButtonVariantType,
    Chart,
    CHART_COLORS,
    ComponentSizeType,
    GenericSectionErrorState,
    getSelectPickerOptionByValue,
    Icon,
    RELATIVE_TIME_WINDOW_SELECT_OPTIONS,
    RelativeTimeWindow,
    SelectPicker,
    SelectPickerOptionType,
    SelectPickerVariantType,
    SimpleDatasetForPie,
    Tooltip,
    useTheme,
} from '@devtron-labs/devtron-fe-common-lib'

import { SectionEmptyState, SectionLoadingCard } from '../Overview.components'
import { useGetAppOverviewDoraMetrics } from '../services'
import { AppOverviewDoraMetricsKeys, DoraMetricsChartCardProps, PerformanceLevel } from '../types'
import { parseMinutesInDayHourUnit } from '../utils'
import {
    APP_OVERVIEW_DORA_METRICS_KEY_LABEL_MAP,
    DORA_METRICS_BG_COLORS,
    DORA_METRICS_CHART_COLORS_MAP,
    DORA_METRICS_LABEL_MAP,
    DORA_METRICS_LABELS,
    DORA_METRICS_LINK,
} from './constants'
import { getDoraMetricsChartTooltip } from './tooltipUtils'
import { getDoraMetricBadgeVariant } from './utils'

const PerformanceLevelIndicator = () => {
    const { appTheme } = useTheme()
    const performanceLevels = Object.values(PerformanceLevel)

    return (
        <>
            {performanceLevels.map((level) => (
                <div className="flex left dc__gap-8" key={level}>
                    <div
                        className="icon-dim-12 br-4"
                        style={{ backgroundColor: CHART_COLORS[appTheme][DORA_METRICS_CHART_COLORS_MAP[level]] }}
                    />
                    <span className="fs-13 fw-4 lh-20 cn-9">{DORA_METRICS_LABEL_MAP[level]}</span>
                </div>
            ))}
        </>
    )
}

const DoraMetricsChartCard = ({
    value,
    metricKey,
    comparisonUnit,
    comparisonValue,
    performanceLevelCount,
}: DoraMetricsChartCardProps) => {
    const title = APP_OVERVIEW_DORA_METRICS_KEY_LABEL_MAP[metricKey]
    const absoluteValue = Math.abs(comparisonValue || 0)
    const totalValue = Object.values(performanceLevelCount).reduce((acc, curr) => acc + curr, 0)

    const datasets = useMemo(() => {
        const { elite, high, medium, low } = performanceLevelCount
        return {
            datasetName: 'Number of pipelines',
            yAxisValues: [elite, high, medium, low],
            colors: DORA_METRICS_BG_COLORS,
        } satisfies SimpleDatasetForPie
    }, [performanceLevelCount])

    return (
        <div className="flexbox-col">
            <div className="flexbox-col dc__gap-2 px-16 pt-16 pb-8 border__bottom--secondary">
                <div className="flexbox dc__content-space">
                    <span className="fs-13 cn-9 fw-4 lh-1-5">{title}</span>
                    {comparisonValue ? (
                        <Badge
                            startIconProps={{
                                name: 'ic-arrow-right',
                                rotateBy: comparisonValue > 0 ? -90 : 90,
                            }}
                            variant={getDoraMetricBadgeVariant({
                                comparisonValue,
                                isDeclinePositive: metricKey !== AppOverviewDoraMetricsKeys.DEPLOYMENT_FREQUENCY,
                            })}
                            label={
                                comparisonUnit === 'MINUTES'
                                    ? parseMinutesInDayHourUnit(absoluteValue)
                                    : `${absoluteValue}%`
                            }
                            size={ComponentSizeType.xxxs}
                        />
                    ) : null}
                </div>
                <Tooltip content={value}>
                    <span className="fs-20 fw-6 lh-1-5 cn-9 dc__truncate font-ibm-plex-sans">{value}</span>
                </Tooltip>
            </div>
            <div className="flex dc__align-self-center p-16">
                <Chart
                    id={`dora-metrics-${metricKey}`}
                    type="pie"
                    xAxisLabels={DORA_METRICS_LABELS}
                    datasets={datasets}
                    hideAxis
                    tooltipConfig={{
                        getTooltipContent: getDoraMetricsChartTooltip({ metricKey, totalValue }),
                    }}
                />
            </div>
        </div>
    )
}

const DoraMetrics = () => {
    const [selectedWindowOption, setSelectedWindowOption] = useState(RelativeTimeWindow.LAST_30_DAYS)

    const handleChangeTimeWindow = (selectedPeriod: SelectPickerOptionType<RelativeTimeWindow>) => {
        setSelectedWindowOption(selectedPeriod.value)
    }

    const { isFetching, data, isError, refetch } = useGetAppOverviewDoraMetrics(selectedWindowOption)

    const prodDeploymentPipelineCount = data?.prodDeploymentPipelineCount ?? 0

    const renderBody = () => {
        if (isFetching) {
            return <SectionLoadingCard />
        }

        if (isError) {
            return <GenericSectionErrorState subTitle="" reload={refetch} />
        }

        const noDeploymentTriggers = data.cardsConfig.every(({ performanceLevelCount }) =>
            Object.values(performanceLevelCount).every((value) => !value),
        )

        if (noDeploymentTriggers) {
            return (
                <SectionEmptyState
                    title="DORA Metrics not available"
                    subtitle="No production deployments occured in the selected duration"
                />
            )
        }

        return (
            <>
                <div className="dc__grid dora-metrics-wrapper">
                    {data.cardsConfig.map(
                        ({ metricKey, value, comparisonUnit, comparisonValue, performanceLevelCount }) => (
                            <DoraMetricsChartCard
                                key={metricKey}
                                metricKey={metricKey}
                                value={value}
                                comparisonUnit={comparisonUnit}
                                comparisonValue={comparisonValue}
                                performanceLevelCount={performanceLevelCount}
                                prodDeploymentPipelineCount={prodDeploymentPipelineCount}
                            />
                        ),
                    )}
                </div>
                <div className="flexbox dc__content-space px-16 py-8 border__secondary--top">
                    <div className="flex left dc__gap-16">
                        <span className="fs-13 fw-4 lh-1-5 cn-9">Pipelines count by performance</span>
                        <PerformanceLevelIndicator />
                    </div>
                    <Button
                        dataTestId="know-more-dora-metrics"
                        ariaLabel="Know more about dora metrics"
                        icon={<Icon name="ic-help-outline" color={null} />}
                        showAriaLabelInTippy={false}
                        size={ComponentSizeType.xs}
                        variant={ButtonVariantType.borderLess}
                        style={ButtonStyleType.neutral}
                        showTooltip
                        tooltipProps={{
                            content: 'Learn more about DORA metrics',
                        }}
                        component={ButtonComponentType.anchor}
                        anchorProps={{
                            href: DORA_METRICS_LINK,
                        }}
                    />
                </div>
            </>
        )
    }

    return (
        <div className="flexbox-col br-8 border__secondary bg__primary">
            <div className="flexbox dc__content-space p-12 border__secondary--bottom">
                <h3 className="flex left dc__gap-4 fs-14 lh-1-5 fw-4 cn-7 m-0">
                    <span className="fw-6 cn-9">DORA Metrics</span>
                    {isFetching ? (
                        <span className="shimmer h-14 w-100px" />
                    ) : (
                        !!prodDeploymentPipelineCount && (
                            <>
                                <span>·</span>
                                <span>{prodDeploymentPipelineCount} production deployment pipelines</span>
                            </>
                        )
                    )}
                </h3>
                <SelectPicker
                    inputId="select-dora-metric-range"
                    options={RELATIVE_TIME_WINDOW_SELECT_OPTIONS}
                    variant={SelectPickerVariantType.COMPACT}
                    value={getSelectPickerOptionByValue(RELATIVE_TIME_WINDOW_SELECT_OPTIONS, selectedWindowOption)}
                    onChange={handleChangeTimeWindow}
                    isSearchable={false}
                    shouldMenuAlignRight
                />
            </div>
            {renderBody()}
        </div>
    )
}

export default DoraMetrics
