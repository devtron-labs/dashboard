import { SegmentedBarChart } from '@devtron-labs/devtron-fe-common-lib'

export const K8sResourceListTableUsageCell = ({
    percentage,
    absoluteValue,
    color,
}: {
    percentage: string
    absoluteValue: string
    color: string
}) => {
    const percentageInNumber = parseInt(percentage, 10)
    const usagePercentage = Number.isNaN(percentageInNumber) ? 0 : percentageInNumber

    return (
        <div className="flexbox-col dc__content-center dc__gap-4">
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
    )
}
