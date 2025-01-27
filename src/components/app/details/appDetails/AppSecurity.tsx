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

import { useAsync, getSecurityScan } from '@devtron-labs/devtron-fe-common-lib'
import { UseGetAppSecurityDetailsProps, UseGetAppSecurityDetailsReturnType } from './appDetails.type'

export const useGetAppSecurityDetails = ({
    appId,
    envId,
    artifactId,
    installedAppId,
}: UseGetAppSecurityDetailsProps): UseGetAppSecurityDetailsReturnType => {
    const [scanResultLoading, scanResultResponse, scanResultError, reloadScanResult] = useAsync(
        () => getSecurityScan({ appId, envId, artifactId, installedAppId }),
        [appId, envId, installedAppId],
        !!appId || !!installedAppId,
    )

    return {
        scanResultLoading,
        scanResultResponse,
        scanResultError,
        reloadScanResult,
    }
}
