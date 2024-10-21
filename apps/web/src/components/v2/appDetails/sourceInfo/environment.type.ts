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

import { DeploymentStatusDetailsBreakdownDataType } from '../../../app/details/appDetails/appDetails.type'
import { HelmReleaseStatus } from '../../../external-apps/ExternalAppService'
import { AppDetails } from '../appDetails.type'

export interface EnvironmentStatusComponentType {
    loadingDetails: boolean
    loadingResourceTree: boolean
    deploymentStatusDetailsBreakdownData: DeploymentStatusDetailsBreakdownDataType
    isVirtualEnvironment?: boolean
    refetchDeploymentStatus: (showTimeline?: boolean) => void
}
export interface AppEnvironment {
    environmentName: string
    environmentId: number
    appMetrics: boolean
    infraMetrics: boolean
    prod: boolean
    isSelected?: boolean
}

export interface NodeStreamMap {
    group: string
    kind: string
    message: string
    name: string
    namespace: string
    status: string
    syncPhase: string
    version: string
}

export interface ChartUsedCardType {
    appDetails: AppDetails
    notes: string
    onClickShowNotes: () => void
    cardLoading: boolean
}

export interface HelmAppConfigApplyStatusCardType {
    releaseStatus: HelmReleaseStatus
    cardLoading: boolean
}
