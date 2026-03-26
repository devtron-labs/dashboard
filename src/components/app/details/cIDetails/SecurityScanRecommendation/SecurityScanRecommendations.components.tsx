import { useState } from 'react'

import { ScannedByToolModal, ScanRecommendationsDTO } from '@devtron-labs/devtron-fe-common-lib'

import { SecurityScanRecommendationBar } from './SecrityScanRecommendationBar'
import { HADOLINT_LINK } from './SecurityRecommendation.utils'
import { SecurityScanModal } from './SecurityScanModal'
import { SecurityScansRecommendationsProps } from './types'

export const SecurityScansRecommendations = ({ scanRecommendationResponse }: SecurityScansRecommendationsProps) => {
    const [showSecurityScanModal, setShowSecurityScanModal] = useState(false)

    const recommendations: ScanRecommendationsDTO | undefined = scanRecommendationResponse?.result

    if (!recommendations) {
        return null
    }

    const { results, severity_summary: severitySummary } = recommendations
    const hasRecommendations = !!results?.length

    const handleSecurityScanModal = () => {
        setShowSecurityScanModal((currentState) => !currentState)
    }

    return (
        <div className="security-recommendations">
            {!hasRecommendations ? (
                <div className="security-recommendations__state">
                    <span className="security-recommendations__state-text">
                        No recommendations available for this scanRecommendation.
                    </span>
                </div>
            ) : (
                <div className="flexbox-col dc__gap-12">
                    <div className="flex dc__content-space dc__border-bottom-n1 pb-8">
                        <h3 className="m-0 fs-13 fw-6 lh-20">Dockerfile Linting</h3>
                        <ScannedByToolModal scanToolName="Hadolint" scanToolUrl={HADOLINT_LINK} />
                    </div>
                    <SecurityScanRecommendationBar
                        summary={severitySummary}
                        hasRecommendations={hasRecommendations}
                        handleSecurityScanModal={handleSecurityScanModal}
                    />
                    {showSecurityScanModal && (
                        <SecurityScanModal
                            summary={severitySummary}
                            hasRecommendations={hasRecommendations}
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
