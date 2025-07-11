import { Icon, ImageWithFallback } from '@devtron-labs/devtron-fe-common-lib'

const ChartIcon = ({ icon, isChartGroupCard }: { icon: string; isChartGroupCard?: boolean }) => {
    const chartIconClass = `dc__chart-grid-item__icon icon-dim-32 ${isChartGroupCard ? 'chart-group-card__icon' : 'chart-icon-dim'} br-4 dc__no-shrink`

    return (
        <div
            className={`${isChartGroupCard ? 'chart-group-card__icon-wrapper' : 'chart-card__icon-wrapper'} border__secondary-translucent bg__secondary br-8 p-8 dc__w-fit-content h-50`}
        >
            <ImageWithFallback
                imageProps={{
                    height: 32,
                    width: 32,
                    src: icon,
                    alt: 'chart',
                    className: chartIconClass,
                }}
                fallbackImage={
                    <div className={chartIconClass}>
                        <Icon name="ic-helm-app" size={32} color={null} />
                    </div>
                }
            />
        </div>
    )
}

export default ChartIcon
