import { CHART_COLORS, useTheme } from '@devtron-labs/devtron-fe-common-lib'

import { ChartTooltipProps } from './types'

export const ChartColorIndicator = ({ title, backgroundColor }: { title: string; backgroundColor: string }) => (
    <div className="flexbox dc__gap-4">
        <div className="py-4">
            <div className="icon-dim-12 br-2" style={{ backgroundColor }} />
        </div>
        <span>{title}</span>
    </div>
)

export const ChartTooltip = ({ title, label, value, chartColorKey }: ChartTooltipProps) => {
    const { appTheme } = useTheme()
    const backgroundColor = CHART_COLORS[appTheme][chartColorKey]
    return (
        <div className="dc__mxw-200 flexbox-col dc__gap-8 py-6 px-10 fw-4">
            {title && <span className="fw-6">{title}</span>}
            <div className="flexbox dc__gap-4">
                <div className="py-4">
                    <div className="icon-dim-12 br-2" style={{ backgroundColor }} />
                </div>
                <div className="flexbox-col dc__gap-12">
                    <span>
                        {label}:&nbsp;{value}
                    </span>
                </div>
            </div>
        </div>
    )
}
