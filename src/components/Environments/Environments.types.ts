import { CDMdalTabType, DeploymentNodeType, WebhookPayloads, WorkflowNodeType } from '../app/details/triggerView/types'
import { BulkResponseStatus } from './Constants'

export interface BulkCIDetailType {
    workFlowId: string
    appId: number
    name: string
    ciPipelineName: string
    ciPipelineId: string
    isFirstTrigger: boolean
    isCacheAvailable: boolean
    isLinkedCI: boolean
    isWebhookCI: boolean
    parentAppId: number
    parentCIPipelineId: number
    material: any[]
    warningMessage: string
    errorMessage: string
    isHideSearchHeader: boolean
    filteredCIPipelines: any
}

export interface BulkCDDetailType {
    workFlowId: string
    appId: number
    name: string
    cdPipelineName?: string
    cdPipelineId?: string
    stageType?: DeploymentNodeType
    envName: string
    parentPipelineId?: string
    parentPipelineType?: WorkflowNodeType
    parentEnvironmentName?: string
    material?: any[]
    notFoundMessage?: string
}

export interface ResponseRowType {
    appId: string
    appName: string
    status: BulkResponseStatus
    statusText: string
    message: string
}

export interface BulkCITriggerType {
    appList: BulkCIDetailType[]
    closePopup: (e) => void
    updateBulkInputMaterial: (materialList: Record<string, any[]>) => void
    onClickTriggerBulkCI: (appIgnoreCache: Record<number, boolean>, appsToRetry?: Record<number, boolean>) => void
    showWebhookModal: boolean
    toggleWebhookModal: (id, webhookTimeStampOrder) => void
    webhookPayloads: WebhookPayloads
    isWebhookPayloadLoading: boolean
    hideWebhookModal: (e?) => void
    isShowRegexModal: (_appId: number, ciNodeId: number, inputMaterialList: any[]) => boolean
    responseList: ResponseRowType[]
}

export interface BulkCDTriggerType {
    stage: DeploymentNodeType
    appList: BulkCDDetailType[]
    closePopup: (e) => void
    updateBulkInputMaterial: (materialList: Record<string, any[]>) => void
    onClickTriggerBulkCD: (appsToRetry?: Record<string, boolean>) => void
    changeTab: (
        materrialId: string | number,
        artifactId: number,
        tab: CDMdalTabType,
        selectedCDDetail?: { id: number; type: DeploymentNodeType },
    ) => void
    toggleSourceInfo: (materialIndex: number, selectedCDDetail?: { id: number; type: DeploymentNodeType }) => void
    selectImage: (
        index: number,
        materialType: string,
        selectedCDDetail?: { id: number; type: DeploymentNodeType },
    ) => void
    responseList: ResponseRowType[]
}
