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

import moment from 'moment'
import { numberComparatorBySortOrder } from '@Shared/Helpers'
import { DATE_TIME_FORMAT_STRING } from '../../../constants'
import { SortingOrder, useAsync, VULNERABILITIES_SORT_PRIORITY, ZERO_TIME_STRING } from '../../../../Common'
import { LastExecutionResponseType, LastExecutionResultType } from '../../../types'
import { UseGetSecurityVulnerabilitiesProps, UseGetSecurityVulnerabilitiesReturnType } from './types'
import { getExecutionDetails } from '../SecurityModal'

export const getSortedVulnerabilities = (vulnerabilities) =>
    vulnerabilities.sort((a, b) =>
        numberComparatorBySortOrder(
            VULNERABILITIES_SORT_PRIORITY[a.severity],
            VULNERABILITIES_SORT_PRIORITY[b.severity],
            SortingOrder.ASC,
        ),
    )

export const getParsedScanResult = (scanResult): LastExecutionResultType => {
    const vulnerabilities = scanResult?.vulnerabilities || []
    const sortedVulnerabilities = getSortedVulnerabilities(vulnerabilities)

    return {
        ...(scanResult || {}),
        lastExecution:
            scanResult?.executionTime && scanResult.executionTime !== ZERO_TIME_STRING
                ? moment(scanResult.executionTime).format(DATE_TIME_FORMAT_STRING)
                : '',
        severityCount: {
            critical: scanResult?.severityCount?.critical ?? 0,
            high: scanResult?.severityCount?.high ?? 0,
            medium: scanResult?.severityCount?.medium ?? 0,
            low: scanResult?.severityCount?.low ?? 0,
            unknown: scanResult?.severityCount?.unknown ?? 0,
        },
        vulnerabilities: sortedVulnerabilities.map((cve) => ({
            name: cve.cveName,
            severity: cve.severity,
            package: cve.package,
            version: cve.currentVersion,
            fixedVersion: cve.fixedVersion,
            policy: cve.permission,
        })),
    }
}

export const parseLastExecutionResponse = (response): LastExecutionResponseType => ({
    ...response,
    result: getParsedScanResult(response.result),
})

export const useGetSecurityVulnerabilities = ({
    artifactId,
    appId,
    envId,
    isScanned,
    isScanEnabled,
    isScanV2Enabled,
    getSecurityScan,
}: UseGetSecurityVulnerabilitiesProps): UseGetSecurityVulnerabilitiesReturnType => {
    const [executionDetailsLoading, executionDetailsResponse, executionDetailsError, reloadExecutionDetails] = useAsync(
        () => getExecutionDetails({ artifactId, appId, envId }),
        [],
        isScanned && isScanEnabled && !isScanV2Enabled,
        {
            resetOnChange: false,
        },
    )

    const [scanResultLoading, scanResultResponse, scanResultError, reloadScanResult] = useAsync(
        () => getSecurityScan({ artifactId, appId, envId }),
        [],
        isScanned && isScanEnabled && isScanV2Enabled && !!getSecurityScan,
        {
            resetOnChange: false,
        },
    )

    return {
        scanDetailsLoading: scanResultLoading || executionDetailsLoading,
        scanResultResponse: isScanV2Enabled ? scanResultResponse : executionDetailsResponse,
        scanDetailsError: scanResultError || executionDetailsError,
        reloadScanDetails: isScanV2Enabled ? reloadScanResult : reloadExecutionDetails,
    }
}
