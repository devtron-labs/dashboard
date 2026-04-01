import { useState } from 'react'

import { Icon, ReportTabEmptyState, ScanRecommendationsDTO } from '@devtron-labs/devtron-fe-common-lib'

import { DockerfileScanModal } from './DockerfileScanModal'
import { DockerfileScanRecommendationBar } from './DockerfileScanRecommendationBar'
import { DockerfileScansRecommendationsProps } from './types'

export const DockerfileScansRecommendations = ({ scanRecommendationResponse }: DockerfileScansRecommendationsProps) => {
    const [showSecurityScanModal, setShowSecurityScanModal] = useState(false)

    const recommendations: ScanRecommendationsDTO | undefined = scanRecommendationResponse?.result

    const { results, severity_summary: severitySummary, dockerfileScanEnabled } = recommendations

    const hasRecommendations = !!results?.length

    const { error, warning } = severitySummary

    const hasThreats = error || warning

    if (!dockerfileScanEnabled && !hasRecommendations) {
        return (
            <ReportTabEmptyState
                title="Dockerfile scan is disabled"
                subtitle="Contact your administrator to enable Dockerfile scan"
            />
        )
    }

    const handleSecurityScanModal = () => {
        setShowSecurityScanModal((currentState) => !currentState)
    }

    return (
        <div className="security-recommendations">
            {!hasThreats || !hasRecommendations ? (
                <div
                    className={`security-scanner-bar__no-recommendations ${hasThreats ? 'security-scanner-bar__recommendations' : ''}  p-16`}
                >
                    <div className="flexbox dc__content-space dc__gap-2">
                        <div className="flexbox-col dc__gap-2">
                            <span className="fs-12 cn-7 lh-1.5">Dockerfile Best Practices</span>
                            <span className="fs-14 fw-6 lh-1.5">Looks good!</span>
                        </div>
                        <Icon name="ic-code-wrapped" color="G500" size={20} />
                    </div>

                    <div className="flexbox-col dc__gap-12">
                        <div className="bcn-1 br-4 h-8" />
                        <span>No recommendations suggested</span>
                    </div>
                </div>
            ) : (
                <div className="flexbox-col dc__gap-12">
                    <DockerfileScanRecommendationBar
                        summary={severitySummary}
                        handleSecurityScanModal={handleSecurityScanModal}
                    />
                    {showSecurityScanModal && (
                        <DockerfileScanModal
                            summary={severitySummary}
                            recommendations={recommendations.results}
                            handleSecurityScanModal={handleSecurityScanModal}
                            isModalView={false}
                            lastScanTime={recommendations.createdOn}
                        />
                    )}
                </div>
            )}
        </div>
    )
}
