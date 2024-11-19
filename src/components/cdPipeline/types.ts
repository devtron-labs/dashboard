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

import { Dispatch, MutableRefObject, SetStateAction } from 'react'
import { PipelineFormType, PluginDetailPayloadType, ReleaseMode } from '@devtron-labs/devtron-fe-common-lib'
import { ChangeCIPayloadType } from '../workflowEditor/types'

// Have added any type for most of these since they were legacy do not know the implications of changing them
export interface CDPipelineProps {
    match: any
    location: any
    appName: any
    close: any
    getWorkflows: any
    refreshParentWorkflows: any
    envIds: any
    changeCIPayload?: ChangeCIPayloadType
    noGitOpsModuleInstalledAndConfigured: any
    isGitOpsRepoNotConfigured: any
    reloadAppConfig: () => void
    handleDisplayLoader: () => void
}

export enum DeleteDialogType {
    showForceDeleteDialog = 'showForceDeleteDialog',
    showNonCascadeDeleteDialog = 'showNonCascadeDeleteDialog',
    showNormalDeleteDialog = 'showNormalDeleteDialog',
}

export interface ForceDeleteMessageType {
    forceDeleteDialogMessage: string
    forceDeleteDialogTitle: string
}

export interface DeleteCDNodeProps {
    deleteDialog: DeleteDialogType
    setDeleteDialog: React.Dispatch<React.SetStateAction<DeleteDialogType>> | ((deleteDialog: DeleteDialogType) => void)
    clusterName: string
    appName: string
    hideDeleteModal: () => void
    deleteCD: (force: boolean, cascadeDelete: boolean) => void
    deploymentAppType: string
    forceDeleteData: ForceDeleteMessageType
    deleteTitleName: string
    isLoading?: boolean
}

export interface PullImageDigestToggleType {
    formData: PipelineFormType
    setFormData: React.Dispatch<React.SetStateAction<PipelineFormType>>
}

export interface BuildCDProps
    extends Pick<CDPipelineProps, 'envIds' | 'isGitOpsRepoNotConfigured' | 'noGitOpsModuleInstalledAndConfigured'> {
    isAdvanced: boolean
    setIsVirtualEnvironment: Dispatch<SetStateAction<boolean>>
    noStrategyAvailable: MutableRefObject<boolean>
    allStrategies: MutableRefObject<{
        [key: string]: any
    }>
    parentPipelineId: string
    isWebhookCD: boolean
    dockerRegistries: any[]
    releaseMode: ReleaseMode
    getMandatoryPluginData: (
        form: PipelineFormType,
        requiredPluginIds?: PluginDetailPayloadType['pluginIds'],
    ) => Promise<void>
}
