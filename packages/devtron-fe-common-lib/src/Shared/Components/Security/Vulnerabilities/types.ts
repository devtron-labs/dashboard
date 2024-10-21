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

import { ResponseType } from '@Common/Types'
import { ImageCardAccordionProps } from '@Shared/Components/ImageCardAccordion/types'
import { MaterialSecurityInfoType } from '../../../types'
import { ApiResponseResultType } from '../SecurityModal'

export interface VulnerabilitiesProps
    extends MaterialSecurityInfoType,
        Pick<ImageCardAccordionProps, 'SecurityModalSidebar' | 'getSecurityScan'> {
    artifactId: number
    applicationId: number
    environmentId: number
    setVulnerabilityCount: React.Dispatch<React.SetStateAction<number>>
}

export interface UseGetSecurityVulnerabilitiesProps extends Pick<ImageCardAccordionProps, 'getSecurityScan'> {
    artifactId: string
    appId: string
    envId: number
    isScanned: boolean
    isScanEnabled: boolean
    isScanV2Enabled: boolean
}

export interface UseGetSecurityVulnerabilitiesReturnType {
    scanDetailsLoading: boolean
    scanResultResponse: ResponseType<ApiResponseResultType>
    scanDetailsError: any
    reloadScanDetails: () => void
}
