import dayjs from 'dayjs'

import { DATE_TIME_FORMATS, Icon, SegmentedBarChart, ZERO_TIME_STRING } from '@devtron-labs/devtron-fe-common-lib'

import { SecurityScanRecommendationBarProps } from './types'

export const SecurityScanRecommendationBar = ({
    summary,
    hasRecommendations,
    handleSecurityScanModal,
    isModalView = false,
    lastScanTime,
}: SecurityScanRecommendationBarProps) => {
    const { error, warning } = summary
    const totalCount = error + warning
    const hasThreats = error || warning
    const shouldShowLastScanTime =
        isModalView && !!lastScanTime && lastScanTime !== ZERO_TIME_STRING && lastScanTime !== 0

    return (
        <div
            className={`flexbox-col en-2 bw-1 br-8 dc__gap-16 cn-9 ${isModalView ? 'm-20' : ''}`}
            onClick={handleSecurityScanModal}
        >
            {!hasThreats || !hasRecommendations ? (
                <>
                    <div className="flexbox-col dc__gap-2">
                        <span className="fs-12 cn-7 lh-1.5">Dockerfile Best Practices</span>
                        <span className="fs-14 fw-6 lh-1.5">Looks good!</span>
                    </div>

                    <div className="flexbox-col dc__gap-12">
                        <div className="bcn-1 br-4 h-8" />
                        <span>No recommendations suggested</span>
                    </div>
                </>
            ) : (
                <div className="flexbox-col">
                    <div className={`flexbox-col ${isModalView ? 'dc__gap-12 p-16' : 'dc__gap-16 p-20'}`}>
                        <div className="flexbox-col dc__gap-2">
                            {!isModalView && <span className="fs-12 cn-7 lh-1.5">Dockerfile Best Practices</span>}
                            <span className="fs-14 fw-6 lh-20 ">{totalCount} Recommendations</span>
                        </div>
                        <div className="flexbox-col">
                            <SegmentedBarChart
                                entities={[
                                    { color: 'var(--Y500)', label: 'Warnings', value: warning || 0 },
                                    { color: 'var(--R500)', label: 'Errors', value: error || 0 },
                                ]}
                                labelClassName="fs-13 fw-4 lh-20"
                                countClassName="fs-13 fw-6 lh-20 cn-7"
                                swapLegendAndBar={!isModalView}
                                showAnimationOnBar
                            />
                        </div>
                    </div>
                    {shouldShowLastScanTime ? (
                        <div className="flexbox dc__align-items-center dc__gap-6 py-8 dc__border-top py-8 px-16">
                            <Icon name="ic-clock" color={null} size={20} />
                            <span className="fs-12 fw-4 cn-8 lh-20">
                                Scanned on {dayjs(lastScanTime).format(DATE_TIME_FORMATS.TWELVE_HOURS_FORMAT)}{' '}
                            </span>
                        </div>
                    ) : (
                        ''
                    )}
                </div>
            )}
        </div>
    )
}
