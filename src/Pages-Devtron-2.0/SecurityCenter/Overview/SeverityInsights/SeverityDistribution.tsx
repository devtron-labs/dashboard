import { useHistory } from 'react-router-dom'

import {
    Chart,
    ChartProps,
    GenericSectionErrorState,
    getUrlWithSearchParams,
    InfoIconTippy,
    LoadingDonutChart,
    ProdNonProdSelectValueTypes,
    URLS,
} from '@devtron-labs/devtron-fe-common-lib'

import { AGE_DISTRIBUTION_CHART_LABELS, AGE_DISTRIBUTION_FILTERS } from '../constants'
import { useGetSeverityInsights } from '../services'
import { getSeverityDistributionTooltip } from './utils'

const InfoTippyContent = () => (
    <div className="flexbox-col">
        <span>
            Age of a vulnerability refers to how long it has existed in the deployment since it was first discovered —
            even if it was fixed and later found again.
        </span>
        <span>It is measured from the time it was first discovered up to the present.</span>
    </div>
)

const SeverityDistribution = ({ prodNonProdValue }: { prodNonProdValue: ProdNonProdSelectValueTypes }) => {
    const { push } = useHistory()
    const { isFetching, isError, data, refetch } = useGetSeverityInsights(prodNonProdValue)

    const { severityDistributionLabels, severityDistributionDataset, ageDistributionDataset } = data || {}

    if (!isFetching && isError) {
        return <GenericSectionErrorState reload={refetch} rootClassName="bg__primary br-8 border__secondary" />
    }

    // Show nothing if there are no vulnerabilities
    if (!isFetching && !severityDistributionLabels?.length) {
        return null
    }

    const handleSeverityDistributionClick: ChartProps['onChartClick'] = (_, idx) => {
        push(
            getUrlWithSearchParams(URLS.SECURITY_CENTER_VULNERABILITY_DEPLOYMENTS, {
                severity: severityDistributionLabels[idx].toLowerCase(),
            }),
        )
    }

    const handleAgeDistributionClick: ChartProps['onChartClick'] = (_, idx) => {
        push(
            getUrlWithSearchParams(URLS.SECURITY_CENTER_VULNERABILITY_CVES, {
                ageOfDiscovery: AGE_DISTRIBUTION_FILTERS[idx],
            }),
        )
    }

    return (
        <div className="flexbox dc__gap-8">
            <div className="flexbox-col w-300 border__secondary br-8 bg__primary">
                <div className="px-16 py-12 flex left border__secondary--bottom">
                    <span className="fs-14 fw-6 lh-1-5 cn-9">Severity Distribution</span>
                </div>
                <div className="flex h-250 w-100 p-16">
                    {isFetching ? (
                        <LoadingDonutChart />
                    ) : (
                        <Chart
                            id="severity-distribution-chart"
                            type="pie"
                            xAxisLabels={severityDistributionLabels}
                            datasets={severityDistributionDataset}
                            tooltipConfig={{
                                getTooltipContent: getSeverityDistributionTooltip(
                                    'Severity',
                                    severityDistributionLabels,
                                    severityDistributionDataset.yAxisValues,
                                    severityDistributionDataset.colors,
                                ),
                            }}
                            onChartClick={handleSeverityDistributionClick}
                        />
                    )}
                </div>
            </div>
            <div className="flexbox-col flex-grow-1 border__secondary br-8 bg__primary">
                <div className="px-16 py-12 flex left dc__gap-8 border__secondary--bottom">
                    <span className="fs-14 fw-6 lh-1-5 cn-9">Age of Discovered Vulnerabilities</span>
                    <InfoIconTippy heading="Age of vulnerabilities" infoText={<InfoTippyContent />} />
                </div>
                <div className="flex h-250 w-100 p-16">
                    {isFetching ? (
                        <div className="h-100 w-100 br-8 shimmer" />
                    ) : (
                        <Chart
                            id="age-of-vulnerabilities-chart"
                            type="stackedBarHorizontal"
                            xAxisLabels={AGE_DISTRIBUTION_CHART_LABELS}
                            datasets={ageDistributionDataset}
                            onChartClick={handleAgeDistributionClick}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

export default SeverityDistribution
