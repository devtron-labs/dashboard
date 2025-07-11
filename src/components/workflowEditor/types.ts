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

import { RouteComponentProps } from 'react-router-dom'

import {
    AppConfigProps,
    ChangeCIPayloadType,
    CiPipeline,
    CIPipelineNodeType,
    CommonNodeAttr,
    DeploymentAppTypes,
    MandatoryPluginDataType,
    OptionType,
    PipelineFormType,
    PluginDataStoreType,
    SelectedNode,
    StepType,
    TaskErrorObj,
    UploadFileDTO,
    UploadFileProps,
    VariableType,
} from '@devtron-labs/devtron-fe-common-lib'

import { HostURLConfig } from '../../services/service.types'
import { CdPipelineResult } from '../app/details/triggerView/types'
import { InputVariablesFromInputListType } from '../cdPipeline/cdPipeline.types'
import { DeleteDialogType, ForceDeleteMessageType } from '../cdPipeline/types'
import { LoadingState } from '../ciConfig/types'
import { WorkflowProps } from './Workflow'

export interface BlackListedCI {
    [key: number]: CiPipeline
}

export interface WorkflowPositionState {
    nodes: CommonNodeAttr[]
    maxY: number
    selectedWorkflowId: number
}

export interface WorkflowEditState {
    view: string
    code: number
    workflows: any[]
    allCINodeMap: Map<string, CommonNodeAttr>
    allDeploymentNodeMap: Map<string, CommonNodeAttr>
    workflowId: number
    appName: string
    showDeleteDialog: boolean
    showCIMenu: boolean
    allCINodesMap: { id: number; value: any }
    hostURLConfig: HostURLConfig
    cIMenuPosition: {
        top: number
        left: number
    }
    showSuccessScreen: boolean
    environmentId?: number
    environmentName?: string
    successTitle?: string
    noGitOpsConfiguration?: boolean
    noGitOpsModuleInstalledAndConfigured?: boolean
    envToShowWebhookTippy?: number
    showOpenCIPipelineBanner?: boolean
    filteredCIPipelines?: any[]
    envIds?: number[]
    isGitOpsRepoNotConfigured?: boolean
    showWorkflowOptionsModal: boolean
    cachedCDConfigResponse: CdPipelineResult
    blackListedCI: BlackListedCI
    changeCIPayload: ChangeCIPayloadType
    selectedNode: SelectedNode
    workflowPositionState: WorkflowPositionState
}

export interface WorkflowEditProps
    extends RouteComponentProps<{ appId: string; workflowId: string; ciPipelineId: string; cdPipelineId: string }>,
        Required<Pick<AppConfigProps, 'isTemplateView'>> {
    configStatus: number
    isCDPipeline: boolean
    respondOnSuccess: () => void
    getWorkflows: () => void
    isJobView?: boolean
    envList?: any[]
    ciPipelines?: any[]
    filteredEnvIds?: string
    reloadEnvironments?: () => void
    reloadAppConfig?: () => void
}

export interface AddWorkflowState {
    id: number
    name: string
    showError: boolean
}
export interface EmptyWorkflowState {
    name: string
    loading: boolean
    showError: boolean
}

export interface AddWorkflowProps
    extends RouteComponentProps<{ appId: string; workflowId: string }>,
        Pick<AppConfigProps, 'isTemplateView'> {
    name: string
    onClose: () => void
    getWorkflows: () => void
}
export interface EmptyWorkflowProps extends RouteComponentProps<{ appId: string; workflowId: string }> {
    name: string
    onClose: () => void
    getWorkflows: () => void
}

export interface PipelineSelectProps {
    showMenu: boolean
    workflowId?: number | string
    styles: { left: string; top: string }
    toggleCIMenu: (event) => void
    addCIPipeline: (type: CIPipelineNodeType, workflowId?: number | string) => void
    addWebhookCD: (workflowId?: number | string) => void
}

export interface NoGitOpsConfiguredWarningType {
    closePopup: (isContinueWithHelm: boolean) => void
}

export interface NoGitOpsRepoConfiguredWarningType {
    closePopup: () => void
    appId: number
    text: string
    reload: () => void
}

export interface ReloadNoGitOpsRepoConfiguredModalType {
    closePopup: () => void
    reload: () => void
}
export interface CDNodeProps
    extends RouteComponentProps,
        Pick<WorkflowProps, 'handleDisplayLoader' | 'isOffendingPipelineView'>,
        Pick<CommonNodeAttr, 'showPluginWarning'>,
        Required<Pick<AppConfigProps, 'isTemplateView'>> {
    id: string
    deploymentStrategy: string
    triggerType: string
    workflowId: number
    x: number
    y: number
    width: number
    height: number
    title: string
    environmentName: string
    environmentId: number
    to: string
    toggleCDMenu: () => void
    cdNamesList?: string[]
    hideWebhookTippy?: () => void
    deploymentAppDeleteRequest: boolean
    deploymentAppCreated?: boolean
    match: RouteComponentProps['match']
    description: string
    isVirtualEnvironment?: boolean
    addNewPipelineBlocked?: boolean
    handleSelectedNodeChange: (selectedNode: SelectedNode) => void
    isLastNode?: boolean
    appName?: string
    deploymentAppType?: DeploymentAppTypes
    appId?: string
    getWorkflows?: () => void
    reloadEnvironments?: () => void
    selectedNode?: SelectedNode
    isDeploymentBlocked?: boolean
}

export interface WebhookNodeProps extends Required<Pick<AppConfigProps, 'isTemplateView'>> {
    x: number
    y: number
    width: number
    height: number
    id: number
    to?: string
    configDiffView?: boolean
    toggleCDMenu?: () => void
    hideWebhookTippy?: () => void
    addNewPipelineBlocked?: boolean
    handleSelectedNodeChange?: (selectedNode: SelectedNode) => void
    selectedNode?: SelectedNode
    isLastNode?: boolean
    /**
     * @default false
     */
    isReadonlyView?: boolean
    addImageButtonClick?: (webhookId: number) => void
}

export interface WebhookTippyType {
    link: string
    hideTippy: () => void
}

export interface CDNodeState {
    showDeletePipelinePopup: boolean
    showDeleteDialog: boolean
    deleteDialog: DeleteDialogType
    forceDeleteData: ForceDeleteMessageType
    clusterName: string
    deleteInProgress: boolean
    showDeploymentConfirmationDeleteDialog: boolean
    deploymentWindowConfimationValue: string
}

export interface PipelineFormDataErrorType {
    name: { message?: string; isValid: boolean }
    envNameError?: { message?: string; isValid: boolean }
    nameSpaceError?: { message?: string; isValid: boolean }
    containerRegistryError?: { isValid: boolean; message?: string }
    repositoryError?: { isValid: boolean; message?: string }
    dockerArgsError?: { isValid: boolean; message?: string }
    preBuildStage: {
        steps: TaskErrorObj[]
        isValid: boolean
    }
    buildStage: {
        isValid: boolean
    }
    postBuildStage: {
        steps: TaskErrorObj[]
        isValid: boolean
    }
    customTag?: {
        message: string[]
        isValid: boolean
    }
    counterX?: {
        message: string
        isValid: boolean
    }
}

interface HandleValidateMandatoryPluginsParamsType {
    newFormData?: PipelineFormType
    newPluginDataStore?: PluginDataStoreType
}

export interface PipelineContext {
    formData: PipelineFormType
    setFormData: React.Dispatch<React.SetStateAction<PipelineFormType>>
    selectedTaskIndex: number
    activeStageName: string
    calculateLastStepDetail: (
        isFromAddNewTask: boolean,
        _formData: PipelineFormType,
        activeStageName: string,
        startIndex?: number,
        isFromMoveTask?: boolean,
    ) => {
        index: number
        calculatedStageVariables: Map<string, VariableType>[]
    }
    formDataErrorObj: PipelineFormDataErrorType
    setFormDataErrorObj: React.Dispatch<React.SetStateAction<PipelineFormDataErrorType>>
    validateTask: (
        taskData: StepType,
        taskErrorobj: TaskErrorObj,
        options?: {
            isSaveAsPlugin?: boolean
            validateVariableDataTable?: boolean
            validateConditionDetails?: boolean
        },
    ) => void
    setSelectedTaskIndex: React.Dispatch<React.SetStateAction<number>>
    validateStage: (
        stageName: string,
        _formData: PipelineFormType,
        formDataErrorObject?: any,
        clonedPluginDataStore?: PluginDataStoreType,
    ) => void
    isCdPipeline?: boolean
    configMapAndSecrets?: {
        label: string
        options: any
    }[]
    loadingState?: LoadingState
    setLoadingState?: React.Dispatch<React.SetStateAction<LoadingState>>
    appId: string
    inputVariablesListFromPrevStep?: InputVariablesFromInputListType
    setInputVariablesListFromPrevStep?: (inputVariables: InputVariablesFromInputListType) => void
    addNewTask: () => void
    pageState?: string
    setPageState?: React.Dispatch<React.SetStateAction<string>>
    isEnvUsedState?: boolean
    setIsEnvUsedState?: React.Dispatch<React.SetStateAction<boolean>>
    handleStrategy?: (value: any) => void
    getPrePostStageInEnv?: (isVirtualEnvironment: boolean, isRunPrePostStageInEnv: boolean) => boolean
    isVirtualEnvironment?: boolean
    globalVariables: {
        stageType?: string
        label: string
        value: string
        format: string
        description?: string
        variableType?: string
    }[]
    savedCustomTagPattern?: string
    selectedCDStageTypeValue?: OptionType
    setSelectedCDStageTypeValue?: React.Dispatch<React.SetStateAction<OptionType>>
    setReloadNoGitOpsRepoConfiguredModal?: React.Dispatch<React.SetStateAction<boolean>>
    pluginDataStore: PluginDataStoreType
    handlePluginDataStoreUpdate: (pluginDataStore: PluginDataStoreType) => void
    availableTags: string[]
    handleUpdateAvailableTags: (tags: string[]) => void
    /**
     * If hideScopedVariableWidget is true, then the scoped variable widget will be forced to be hidden
     */
    handleHideScopedVariableWidgetUpdate?: (hideScopedVariableWidget: boolean) => void
    /**
     * If disableParentModalClose is true, then the parent modal close will method will act as noop
     * Use case: When we open another modal to create plugin and we don't want to close the parent modal on escape key press
     */
    handleDisableParentModalCloseUpdate?: (disableParentModalClose: boolean) => void
    handleValidateMandatoryPlugins: (params: HandleValidateMandatoryPluginsParamsType) => void
    mandatoryPluginData: MandatoryPluginDataType
    isBlobStorageConfigured?: boolean
    uploadFile: (file: UploadFileProps) => Promise<UploadFileDTO>
}

export interface ToggleCDSelectButtonProps extends Required<Pick<AppConfigProps, 'isTemplateView'>> {
    addNewPipelineBlocked: boolean
    onClickAddNode: (event: any) => void
    testId: string
    deleteConfig?: {
        appId: string
        appWorkflowId: number
        pipelineId: number
        pipelineName: string
    }
    getWorkflows?: () => void
    hideDeleteButton?: boolean
}
