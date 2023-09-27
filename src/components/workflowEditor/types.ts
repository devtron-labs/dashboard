import { FormType, StepType, TaskErrorObj, VariableType } from '@devtron-labs/devtron-fe-common-lib'
import { RouteComponentProps } from 'react-router'
import { HostURLConfig } from '../../services/service.types'
import { CIPipelineNodeType, NodeAttr } from '../app/details/triggerView/types'
import { CDFormType, InputVariablesFromInputListType } from '../cdPipeline/cdPipeline.types'
import { LoadingState } from '../ciConfig/types'

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
    envToShowWebhookTippy?: number
    showOpenCIPipelineBanner?: boolean
    filteredCIPipelines?: any[]
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
}

export interface AddWorkflowState {
    id: number
    name: string
    showError: boolean
}

export interface AddWorkflowProps extends RouteComponentProps<{ appId: string; workflowId: string }> {
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

export interface CDNodeProps{
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
    hideWebhookTippy?:  () => void
}

export interface WebhookTippyType {
    link: string
    hideTippy: ()=> void
}

export interface DeprecatedWarningModalType {
  closePopup: () => void
}

export interface CDNodeState{
  showDeletePipelinePopup: boolean
}

export interface PipelineBuildStageType {
    id: number;
    triggerType?: string
    steps: StepType[];
}

export interface PipelineFormType extends Partial<FormType> , Partial<CDFormType> {
    name: string;
    triggerType: string;
    preBuildStage?: PipelineBuildStageType;
    postBuildStage?: PipelineBuildStageType;
}

export interface PipelineFormDataErrorType {
    name: { message?: string, isValid: boolean },
    envNameError?: { message?: string, isValid: boolean },
    nameSpaceError?: { message?: string, isValid: boolean },
    containerRegistryError?: { isValid: boolean, message?: string },
    repositoryError?: { isValid: boolean, message?: string },
    preBuildStage: {
        steps: any[],
        isValid: boolean,
    },
    buildStage: {
        isValid: boolean,
    },
    postBuildStage: {
        steps: any[],
        isValid: boolean,
    },
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
        isFromMoveTask?: boolean
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
    isCdPipeline?: boolean,
    configMapAndSecrets?: {
        label: string;
        options: any;
    }[],
    loadingState?: LoadingState
    setLoadingState?: React.Dispatch<React.SetStateAction<LoadingState>>
    appId: string
    inputVariablesListFromPrevStep?: InputVariablesFromInputListType,
    setInputVariablesListFromPrevStep?: (inputVariables: InputVariablesFromInputListType) => void,
    addNewTask: () => void,
    pageState?: string
    setPageState?: React.Dispatch<React.SetStateAction<string>>
    handleStrategy?: (value: any) => void
    getPrePostStageInEnv?: (isVirtualEnvironment: boolean, isRunPrePostStageInEnv: boolean) => boolean
    isVirtualEnvironment?: boolean
    globalVariables: {
        stageType?: string, label: string; value: string; format: string; description?: string; variableType?: string
}[]
}
