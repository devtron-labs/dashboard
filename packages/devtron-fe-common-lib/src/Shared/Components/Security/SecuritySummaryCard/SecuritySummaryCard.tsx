import { SegmentedBarChart } from '@Common/SegmentedBarChart'
import { useState } from 'react'
import { ScannedByToolModal } from '../../ScannedByToolModal'
import { SecuritySummaryCardProps } from './types'
import { SecurityModal } from '../SecurityModal'
import { SEVERITIES } from '../SecurityModal/constants'

const SecuritySummaryCard = ({
    severityCount,
    scanToolId,
    rootClassName,
    isHelmApp = false,
    SecurityModalSidebar,
    responseData,
    isSecurityScanV2Enabled,
    hidePolicy = false,
}: SecuritySummaryCardProps) => {
    const [showSecurityModal, setShowSecurityModal] = useState<boolean>(false)
    const { critical = 0, high = 0, medium = 0, low = 0, unknown = 0 } = severityCount
    const totalCount = critical + high + medium + low + unknown
    const entities = [
        { label: SEVERITIES.CRITICAL.label, color: SEVERITIES.CRITICAL.color, value: critical },
        { label: SEVERITIES.HIGH.label, color: SEVERITIES.HIGH.color, value: high },
        { label: SEVERITIES.MEDIUM.label, color: SEVERITIES.MEDIUM.color, value: medium },
        { label: SEVERITIES.LOW.label, color: SEVERITIES.LOW.color, value: low },
        { label: SEVERITIES.UNKNOWN.label, color: SEVERITIES.UNKNOWN.color, value: unknown },
    ]

    const handleOpenSecurityModal = () => {
        setShowSecurityModal(true)
    }

    const handleCloseSecurityModal = () => {
        setShowSecurityModal(false)
    }

    return (
        <>
            <div
                className={`flexbox-col bcn-0 dc__border br-8 dc__tab-focus ${rootClassName}`}
                role="button"
                tabIndex={0}
                onClick={handleOpenSecurityModal}
            >
                <div className="p-16 flexbox-col dc__gap-12 dc__border-bottom">
                    <div>
                        <div className="fw-4 fs-13 lh-1-5 cn-9">Security scan summary</div>
                        <div className="fw-6 fs-14 lh-21 cn-9">{totalCount} Vulnerabilities found in image scan</div>
                    </div>
                    <SegmentedBarChart
                        entities={entities}
                        labelClassName="fw-4 fs-13 lh-20 cn-9"
                        rootClassName="fw-6 fs-13 lh-20 cn-7"
                    />
                </div>
                <div className="flexbox dc__content-space px-16 py-8">
                    <span className="fw-6 fs-13 lh-18 cb-5">Details</span>
                    <ScannedByToolModal scanToolId={scanToolId} />
                </div>
            </div>
            {showSecurityModal && (
                <SecurityModal
                    handleModalClose={handleCloseSecurityModal}
                    isHelmApp={isHelmApp}
                    isSecurityScanV2Enabled={isSecurityScanV2Enabled}
                    Sidebar={SecurityModalSidebar}
                    isLoading={false} // Loading and error are handled on parent components
                    error={null}
                    responseData={responseData}
                    hidePolicy={hidePolicy}
                />
            )}
        </>
    )
}

export default SecuritySummaryCard
