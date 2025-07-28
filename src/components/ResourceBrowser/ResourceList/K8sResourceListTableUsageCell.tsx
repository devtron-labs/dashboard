import { SegmentedBarChart, Tooltip } from '@devtron-labs/devtron-fe-common-lib'

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

    return (
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
            <div className="flexbox-col dc__content-center dc__gap-4 py-10 cursor">
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
    )
}
