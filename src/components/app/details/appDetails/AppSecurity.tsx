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

import { getSecurityScan, getSecurityScanRecommendations, useAsync } from '@devtron-labs/devtron-fe-common-lib'

import {
    UseGetAppSecurityDetailsProps,
    UseGetAppSecurityDetailsReturnType,
    UseSecurityRecommendationReturnType,
} from './appDetails.type'

const SECURITY_SCAN_RECOMMENDATIONS_POLLING_INTERVAL = 5000

export const useGetAppSecurityDetails = ({
    appId,
    envId,
    artifactId,
    installedAppId,
}: UseGetAppSecurityDetailsProps): UseGetAppSecurityDetailsReturnType => {
    const [scanResultLoading, scanResultResponse, scanResultError, reloadScanResult] = useAsync(
        () => getSecurityScan({ appId, envId, artifactId, installedAppId }),
        [appId, envId, artifactId, installedAppId],
        !!appId || !!installedAppId,
    )

    return {
        scanResultLoading,
        scanResultResponse,
        scanResultError,
        reloadScanResult,
    }
}

export const useGetAppSecurityDetailsRecommendations = ({
    appId,
    buildId,
}: UseGetAppSecurityDetailsProps): UseSecurityRecommendationReturnType => {
    const [
        scanRecommendationsResultLoading,
        scanRecommendationsResultResponse,
        scanRecommendationsResultError,
        reloadScanRecommendationsResult,
    ] = useAsync(() => getSecurityScanRecommendations({ appId, buildId }), [appId, buildId], !!appId && !!buildId)

    const recommendationStatus = scanRecommendationsResultResponse?.result?.status
    const isDockerfileScanEnabled = scanRecommendationsResultResponse?.result?.scanEnabled

    useEffect(() => {
        if (!appId || !buildId || !isDockerfileScanEnabled || recommendationStatus === 3) {
            return undefined
        }

        const timeoutId = window.setTimeout(() => {
            reloadScanRecommendationsResult()
        }, SECURITY_SCAN_RECOMMENDATIONS_POLLING_INTERVAL)

        return () => {
            window.clearTimeout(timeoutId)
        }
    }, [appId, buildId, isDockerfileScanEnabled, recommendationStatus, reloadScanRecommendationsResult])

    return {
        scanRecommendationsResultLoading,
        scanRecommendationsResultResponse,
        scanRecommendationsResultError,
        reloadScanRecommendationsResult,
    }
}
