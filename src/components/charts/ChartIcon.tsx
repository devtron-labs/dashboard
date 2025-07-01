import { ImageWithFallback } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Helm } from '../../assets/icons/ic-default-chart.svg'

const ChartIcon = ({ icon }: { icon: string }) => {
    const chartIconClass = 'dc__chart-grid-item__icon chart-icon-dim br-4 dc__no-shrink'

    return (
        <div className="icon-wrapper">
            <ImageWithFallback
                imageProps={{
                    height: 32,
                    width: 32,
                    src: icon,
                    alt: 'chart',
                    className: 'dc__chart-grid-item__icon chart-icon-dim br-4 dc__no-shrink',
                }}
                fallbackImage={<Helm className={chartIconClass} />}
            />
        </div>
    )
}

export default ChartIcon
