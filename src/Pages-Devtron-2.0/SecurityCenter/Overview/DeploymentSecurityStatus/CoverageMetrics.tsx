import { Chart, ChartColorKey, GenericSectionErrorState } from '@devtron-labs/devtron-fe-common-lib'

import { DEPLOYMENT_SECURITY_STATUS_METRIC_TITLE, DEPLOYMENT_SECURITY_STATUS_TOOLTIP_CONTENT } from '../constants'
import { useGetDeploymentSecurityStatus } from '../services'
import { DeploymentSecurityStatusKeys } from '../types'
import { parseNumberToPrecision } from '../utils'
import { CoverageCardProps } from './types'
import { getCoverageMetricsChartTooltip } from './utils'

export const COVERAGE_CHART_COLORS: ChartColorKey[] = ['CoralRed500', 'CharcoalGray100']

const CoverageCard = ({ metricKey, coveragePercent, isLoading }: CoverageCardProps) => {
    const xAxisLabels = DEPLOYMENT_SECURITY_STATUS_TOOLTIP_CONTENT[metricKey]
    const coveragePercentValue = parseNumberToPrecision(coveragePercent ?? 0, 2)
    const remainPercentValue = parseNumberToPrecision(100 - (coveragePercent ?? 0), 2)
    const yAxisValues = [coveragePercentValue, remainPercentValue]

    return (
        <div className="bg__primary border__secondary br-8">
            <div className="flex left px-16 py-12 border__secondary--bottom">
                <span className="fs-14 fw-6 lh-1-5 cn-9 dc__truncate">
                    {DEPLOYMENT_SECURITY_STATUS_METRIC_TITLE[metricKey]}
                </span>
            </div>

            <div className="flex p-16 h-150">
                {isLoading ? (
                    <div className="w-100 h-100 shimmer" />
                ) : (
                    <Chart
                        id={`coverage-chart-${metricKey}`}
                        type="semiPie"
                        datasets={{
                            datasetName: DEPLOYMENT_SECURITY_STATUS_METRIC_TITLE[metricKey],
                            colors: COVERAGE_CHART_COLORS,
                            yAxisValues,
                        }}
                        xAxisLabels={xAxisLabels}
                        hideAxis
                        centerText={{ text: `${coveragePercentValue}%` }}
                        tooltipConfig={{
                            getTooltipContent: getCoverageMetricsChartTooltip(xAxisLabels, yAxisValues),
                        }}
                    />
                )}
            </div>
        </div>
    )
}

const CoverageMetrics = () => {
    const { isFetching, isError, data, refetch } = useGetDeploymentSecurityStatus()

    if (!isFetching && isError) {
        return <GenericSectionErrorState reload={refetch} rootClassName="bg__primary br-8 border__secondary" />
    }

    return (
        <div className="dc__grid cards-wrapper">
            {Object.values(DeploymentSecurityStatusKeys).map((key: DeploymentSecurityStatusKeys) => (
                <CoverageCard key={key} metricKey={key} coveragePercent={data?.[key]} isLoading={isFetching} />
            ))}
        </div>
    )
}

export default CoverageMetrics
