import { SCAN_TOOL_ID_TRIVY } from '../../../config'
import { IMAGE_SCAN_TOOL } from '../../app/details/triggerView/Constants'
import { ReactComponent as Clair } from '../../../assets/icons/ic-clair.svg'
import { ReactComponent as Trivy } from '../../../assets/icons/ic-trivy.svg'
import React from 'react'

export function ScannedByToolModal({ scanToolId }: { scanToolId: number }) {
    const isTrivy = scanToolId === SCAN_TOOL_ID_TRIVY
    return (
        <>
            <span className="dc__italic-font-style fs-13">
                Scanned by
                <span className="fw-6 ml-4" data-testid="scanned-by-tool">
                    {isTrivy ? IMAGE_SCAN_TOOL.Trivy : IMAGE_SCAN_TOOL.Clair}
                </span>
            </span>
            {isTrivy ? <Trivy className="h-20 w-20 ml-6" /> : <Clair className="h-20 w-20 ml-6" />}
        </>
    )
}
