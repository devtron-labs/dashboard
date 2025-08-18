import { InfoIconTippy, isNullOrUndefined, SegmentedBarChart, Tooltip } from '@devtron-labs/devtron-fe-common-lib'

export const K8sResourceListTableUsageCell = ({
    percentage,
    absoluteValue,
    totalValue,
    color,
}: {
    percentage: string
    absoluteValue: string
    totalValue: string
    color: string
}) => {
    const percentageInNumber = parseInt(percentage, 10)
    const usagePercentage = Number.isNaN(percentageInNumber) ? 0 : percentageInNumber

    return !isNullOrUndefined(absoluteValue) ? (
        <Tooltip
            className="no-content-padding w-160"
            alwaysShowTippyOnHover
            content={
                <div className="flexbox-col dc__gap-4 p-8">
                    <div className="flex left dc__gap-8 text__white">
                        <p className="m-0 fs-12 lh-18 flex-grow-1">Usage (%)</p>
                        <p className="m-0 fs-12 lh-18">{percentage}</p>
                    </div>
                    <div className="flex left dc__gap-8 text__white">
                        <p className="m-0 fs-12 lh-18 flex-grow-1">Usage (Abs.)</p>
                        <p className="m-0 fs-12 lh-18">{absoluteValue}</p>
                    </div>
                    <div className="flex left dc__gap-8 text__white">
                        <p className="m-0 fs-12 lh-18 flex-grow-1">Allocatable</p>
                        <p className="m-0 fs-12 lh-18">{totalValue}</p>
                    </div>
                </div>
            }
        >
            <div className="flexbox-col dc__content-center dc__gap-4 py-10">
                <div className="flex left dc__gap-8">
                    <p className="m-0 fs-13 lh-20 cn-9 flex-grow-1">{absoluteValue}</p>
                    <p className="m-0 fs-13 lh-20 cn-7">{percentage}</p>
                </div>
                <SegmentedBarChart
                    entities={[
                        { value: usagePercentage, color },
                        { value: 100 - usagePercentage, color: 'var(--N200)' },
                    ]}
                    hideLegend
                />
            </div>
        </Tooltip>
    ) : (
        <div className="flex left dc__gap-6">
            <span>NA</span>
            <InfoIconTippy
                heading="Metrics API is not available"
                additionalContent={
                    <div className="dc__align-left dc__word-break dc__hyphens-auto fs-13 fw-4 lh-20 p-12">
                        Devtron uses Kubernetes’s&nbsp;
                        <a
                            href="https://kubernetes.io/docs/tasks/debug/debug-cluster/resource-metrics-pipeline/#metrics-api"
                            rel="noreferrer noopener"
                            target="_blank"
                        >
                            Metrics API
                        </a>
                        &nbsp; to show CPU and Memory Capacity. Please install metrics-server in this cluster to display
                        CPU and Memory Capacity.
                    </div>
                }
                documentationLinkText="View metrics-server helm chart"
                documentationLink="CHART_STORE_METRICS_SERVER"
                iconClassName="icon-dim-20 fcn-5"
            />
        </div>
    )
}
