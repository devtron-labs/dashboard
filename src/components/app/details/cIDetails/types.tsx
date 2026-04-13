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
import { FetchIdDataStatus, History, useScrollable } from '@devtron-labs/devtron-fe-common-lib'

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
    scrollToTop: ReturnType<typeof useScrollable>[1]
    scrollToBottom: ReturnType<typeof useScrollable>[2]
}

export interface HistoryLogsType
    extends Pick<
        BuildDetails,
        | 'scrollToTop'
        | 'scrollToBottom'
        | 'isBlobStorageConfigured'
        | 'isJobView'
        | 'isJobCI'
        | 'appIdFromParent'
        | 'appReleaseTags'
        | 'tagsEditable'
        | 'hideImageTaggingHardDelete'
        | 'fullScreenView'
    > {
    triggerDetails: History
}

export interface SecurityTabType {
    artifactId: number
    status: string
    appIdFromParent?: string
}
