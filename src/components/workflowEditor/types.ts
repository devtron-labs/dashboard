import {
    CommonNodeAttr,
    DeploymentAppTypes,
    FormType,
    OptionType,
    StepType,
    TaskErrorObj,
    VariableType,
    SelectedNode,
} from '@devtron-labs/devtron-fe-common-lib'
import { RouteComponentProps } from 'react-router'
import { HostURLConfig } from '../../services/service.types'
import {
    CIPipelineNodeType,
    CdPipelineResult,
    CiPipeline,
    NodeAttr,
    WorkflowType,
} from '../app/details/triggerView/types'
import { CDFormType, InputVariablesFromInputListType } from '../cdPipeline/cdPipeline.types'
import { LoadingState } from '../ciConfig/types'
import { DeleteDialogType, ForceDeleteMessageType } from '../cdPipeline/types'
import { WorkflowProps } from './Workflow'

export enum DisableType {
    COMING_SOON = 'COMING SOON',
}

export interface BlackListedCI {
    [key: number]: CiPipeline
}

export interface ChangeCIPayloadType {
    appWorkflowId: number
    switchFromCiPipelineId?: number
    appId: number
    switchFromExternalCiPipelineId?: number
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
    allCINodeMap: Map<string, NodeAttr>
    allDeploymentNodeMap: Map<string, NodeAttr>
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
    showNoGitOpsWarningPopup?: boolean
    cdLink?: string
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
    extends RouteComponentProps<{ appId: string; workflowId: string; ciPipelineId: string; cdPipelineId: string }> {
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

export interface AddWorkflowProps extends RouteComponentProps<{ appId: string; workflowId: string }> {
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
export interface CDNodeProps extends Pick<WorkflowProps, 'handleDisplayLoader'> {
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
}

export interface WebhookNodeProps {
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
}

export interface WebhookTippyType {
    link: string
    hideTippy: () => void
}

export interface DeprecatedWarningModalType {
    closePopup: () => void
}

export interface CDNodeState {
    showDeletePipelinePopup: boolean
    showDeleteDialog: boolean
    deleteDialog: DeleteDialogType
    forceDeleteData: ForceDeleteMessageType
    clusterName: string
    deleteInProgress: boolean
}

export interface PipelineBuildStageType {
    id: number
    triggerType?: string
    steps: StepType[]
}

export interface CustomTagType {
    tagPattern: string
    counterX: string
}
export interface PipelineFormType extends Partial<FormType>, Partial<CDFormType> {
    name: string
    triggerType: string
    preBuildStage?: PipelineBuildStageType
    postBuildStage?: PipelineBuildStageType
    defaultTag?: string[]
    customTag?: CustomTagType
    enableCustomTag?: boolean
    customTagStage?: string
    isDigestEnforcedForPipeline?: boolean
    isDigestEnforcedForEnv?: boolean
}

export interface PipelineFormDataErrorType {
    name: { message?: string; isValid: boolean }
    envNameError?: { message?: string; isValid: boolean }
    nameSpaceError?: { message?: string; isValid: boolean }
    containerRegistryError?: { isValid: boolean; message?: string }
    repositoryError?: { isValid: boolean; message?: string }
    preBuildStage: {
        steps: any[]
        isValid: boolean
    }
    buildStage: {
        isValid: boolean
    }
    postBuildStage: {
        steps: any[]
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
    validateTask: (taskData: StepType, taskErrorobj: TaskErrorObj) => void
    configurationType: string
    setConfigurationType: React.Dispatch<React.SetStateAction<string>>
    setSelectedTaskIndex: React.Dispatch<React.SetStateAction<number>>
    validateStage: (stageName: string, _formData: PipelineFormType, formDataErrorObject?: any) => void
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
}

export interface SourceTypeCardProps {
    title: string
    subtitle: string
    image: string
    alt: string
    handleCardAction: (e: React.MouseEvent | React.KeyboardEvent) => void
    dataTestId: string
    type: string
    disableInfo: string
}

export interface WorkflowOptionsModalProps {
    handleCloseWorkflowOptionsModal: () => void
    addCIPipeline: (type: CIPipelineNodeType, workflowId?: number | string) => void
    addWebhookCD: (workflowId?: number | string) => void
    addLinkedCD: (changeCIPayload: ChangeCIPayloadType) => void
    showLinkedCDSource: boolean
    // ------------------ Optional types ------------------
    changeCIPayload?: ChangeCIPayloadType
    workflows?: WorkflowType[]
    getWorkflows?: () => void
}

export interface ToggleCDSelectButtonProps {
    addNewPipelineBlocked: boolean
    onClickAddNode: (event: any) => void
    testId: string
}
