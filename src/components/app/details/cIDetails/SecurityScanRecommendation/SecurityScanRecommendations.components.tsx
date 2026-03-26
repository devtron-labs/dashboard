import { useState } from 'react'

import {
    ErrorScreenManager,
    Progressing,
    ScannedByToolModal,
    ScanRecommendationsDTO,
} from '@devtron-labs/devtron-fe-common-lib'

import { useGetAppSecurityDetailsRecommendations } from '../../appDetails/AppSecurity'
import { SecurityScanRecommendationBar } from './SecrityScanRecommendationBar'
import { SecurityScanModal } from './SecurityScanModal'
import { SecurityScansRecommendationsProps } from './types'

export const SecurityScansRecommendations = ({ appId, buildId }: SecurityScansRecommendationsProps) => {
    const { scanResultLoading, scanResultResponse, scanResultError, reloadScanResult } =
        useGetAppSecurityDetailsRecommendations({
            appId,
            buildId,
        })
    const [showSecurityScanModal, setShowSecurityScanModal] = useState(false)

    const recommendations: ScanRecommendationsDTO = scanResultResponse?.result

    if (!appId || !buildId) {
        return null
    }

    if (scanResultLoading) {
        return (
            <div className="security-recommendations">
                <div className="security-recommendations__state">
                    <Progressing />
                </div>
            </div>
        )
    }

    if (scanResultError) {
        return <ErrorScreenManager code={scanResultError.code} reload={reloadScanResult} />
    }

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
                        No recommendations available for this scan.
                    </span>
                </div>
            ) : (
                <div className="security-recommendations__list">
                    <div className="flex dc__content-space">
                        <h3 className="m-0 fs-13 fw-6 lh-20 dc__border-bottom-n1">Dockerfile Linting</h3>
                        <ScannedByToolModal
                            scanToolName="Hadolint"
                            scanToolUrl="https://hadolint.github.io/hadolint/"
                        />
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
