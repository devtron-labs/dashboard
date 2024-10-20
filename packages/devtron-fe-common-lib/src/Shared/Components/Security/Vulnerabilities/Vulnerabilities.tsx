/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useEffect } from 'react'
import { EMPTY_STATE_STATUS, SCAN_TOOL_ID_CLAIR, SCAN_TOOL_ID_TRIVY } from '@Shared/constants'
import { SeverityCount } from '@Shared/types'
import { Progressing } from '../../../../Common'
import { ScannedByToolModal } from '../../ScannedByToolModal'
import { VulnerabilitiesProps } from './types'
import { SecuritySummaryCard } from '../SecuritySummaryCard'
import { getSeverityCountFromSummary, getTotalSeverityCount } from '../utils'
import { useGetSecurityVulnerabilities } from './utils'

const Vulnerabilities = ({
    isScanned,
    isScanEnabled,
    artifactId,
    applicationId,
    environmentId,
    setVulnerabilityCount,
    SecurityModalSidebar,
    getSecurityScan,
}: VulnerabilitiesProps) => {
    const isScanV2Enabled = window._env_.ENABLE_RESOURCE_SCAN_V2
    const { scanDetailsLoading, scanResultResponse, scanDetailsError, reloadScanDetails } =
        useGetSecurityVulnerabilities({
            appId: String(applicationId),
            artifactId: String(artifactId),
            envId: environmentId,
            isScanEnabled,
            isScanned,
            isScanV2Enabled,
            getSecurityScan,
        })

    useEffect(() => {
        if (scanResultResponse) {
            setVulnerabilityCount(scanResultResponse.result.imageScan.vulnerability?.list?.[0].list?.length)
        }
    }, [scanResultResponse])

    if (!isScanEnabled) {
        return (
            <div className="security-tab-empty">
                <p className="security-tab-empty__title">Scan is Disabled</p>
            </div>
        )
    }

    if (scanDetailsLoading) {
        return (
            <div className="security-tab-empty">
                <Progressing />
            </div>
        )
    }

    if (!isScanned || (scanResultResponse && !scanResultResponse?.result.scanned)) {
        return (
            <div className="security-tab-empty">
                <p className="security-tab-empty__title">Image was not scanned</p>
            </div>
        )
    }

    if (scanDetailsError) {
        return (
            <div className="security-tab-empty">
                <p className="security-tab-empty__title">Failed to fetch vulnerabilities</p>
                <button className="cta secondary" type="button" onClick={reloadScanDetails}>
                    Reload
                </button>
            </div>
        )
    }

    const scanToolId =
        scanResultResponse?.result.imageScan.vulnerability?.list[0].scanToolName === 'TRIVY'
            ? SCAN_TOOL_ID_TRIVY
            : SCAN_TOOL_ID_CLAIR
    const scanResultSeverities = scanResultResponse?.result.imageScan.vulnerability?.summary.severities
    const severityCount: SeverityCount = getSeverityCountFromSummary(scanResultSeverities)

    const totalCount = getTotalSeverityCount(severityCount)

    if (!totalCount) {
        return (
            <div className="security-tab-empty">
                <p className="security-tab-empty__title">
                    {EMPTY_STATE_STATUS.CI_DEATILS_NO_VULNERABILITY_FOUND.TITLE}
                </p>
                <p>{EMPTY_STATE_STATUS.CI_DEATILS_NO_VULNERABILITY_FOUND.SUBTITLE}</p>
                <p className="security-tab-empty__subtitle">
                    {scanResultResponse?.result.imageScan.vulnerability?.list[0].StartedOn}
                </p>
                <div className="pt-8 pb-8 pl-16 pr-16 flexbox dc__align-items-center">
                    <ScannedByToolModal scanToolId={scanToolId} />
                </div>
            </div>
        )
    }

    return (
        <div className="p-12">
            <SecuritySummaryCard
                severityCount={severityCount}
                scanToolId={scanToolId}
                responseData={scanResultResponse?.result}
                isHelmApp={false} // Image card is not visible for helm app
                isSecurityScanV2Enabled={isScanV2Enabled}
                SecurityModalSidebar={SecurityModalSidebar}
                hidePolicy={!environmentId}
            />
        </div>
    )
}

export default Vulnerabilities
