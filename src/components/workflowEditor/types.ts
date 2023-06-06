import { RouteComponentProps } from 'react-router'
import { HostURLConfig } from '../../services/service.types'
import { CIPipelineNodeType, NodeAttr } from '../app/details/triggerView/types'

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
}

export interface WorkflowEditProps
    extends RouteComponentProps<{ appId: string; workflowId: string; ciPipelineId: string; cdPipelineId: string }> {
    configStatus: number
    isCDPipeline: boolean
    respondOnSuccess: () => void
    getWorkflows: () => void
    isJobView?: boolean
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
