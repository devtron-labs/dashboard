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

import { FetchIdDataStatus, History } from '../cicdHistory/types'

export interface CIPipeline {
    name: string
    id: number
    parentCiPipeline: number
    parentAppId: number
    pipelineType: string
}
export interface BuildDetails {
    triggerHistory: Map<number, History>
    fullScreenView: boolean
    synchroniseState: (triggerId: number, triggerDetails: History, triggerDetailsError: any) => void
    isSecurityModuleInstalled: boolean
    isBlobStorageConfigured: boolean
    isJobView?: boolean
    isJobCI?: boolean
    appIdFromParent?: string
    appReleaseTags?: []
    tagsEditable: boolean
    hideImageTaggingHardDelete: boolean
    fetchIdData: FetchIdDataStatus
}

export interface HistoryLogsType {
    triggerDetails: History
    isBlobStorageConfigured?: boolean
    isJobView?: boolean
    isJobCI?: boolean
    appIdFromParent?: string
    appReleaseTags?: []
    tagsEditable: boolean
    hideImageTaggingHardDelete: boolean
}

export interface SecurityTabType {
    ciPipelineId: number
    artifactId: number
    status: string
    appIdFromParent?: string
}
