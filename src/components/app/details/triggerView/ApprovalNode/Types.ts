import { CDModalTabType, DeploymentNodeType, NodeAttr, UserApprovalMetadataType } from '../types'

export interface ApprovalMaterialModalProps {
    isLoading: boolean
    node: NodeAttr
    materialType: string
    stageType: DeploymentNodeType
    changeTab?: (
        materrialId: string | number,
        artifactId: number,
        tab: CDModalTabType,
        selectedCDDetail?: { id: number; type: DeploymentNodeType },
        appId?: number,
    ) => void
    toggleSourceInfo: (materialIndex: number, selectedCDDetail?: { id: number; type: DeploymentNodeType }) => void
    closeApprovalModal: (e) => void
    appId?: number
    pipelineId?: number
}

export interface ApprovalMaterialProps {
    material: any[]
    envName: string
    stageType: DeploymentNodeType
    changeTab: (
        materrialId: string | number,
        artifactId: number,
        tab: CDModalTabType,
        selectedCDDetail?: {
            id: number
            type: DeploymentNodeType
        },
        appId?: number,
    ) => void
    toggleSourceInfo: (
        materialIndex: number,
        selectedCDDetail?: {
            id: number
            type: DeploymentNodeType
        },
    ) => void
    appId: number
    pipelineId: number
    parentEnvironmentName: string
    node: NodeAttr
    selectedTabIndex: number
}

export interface ApprovedTippyContentProps {
    matId: string
    requestedUserId: number
    userApprovalMetadata: UserApprovalMetadataType
    cancelRequest: (e: any, noConfirmation?: boolean) => void
    requestInProgress: boolean
}

export enum ApprovalRequestType {
    SUBMIT = 'SUBMIT',
    APPROVE = 'APPROVE',
    CANCEL = 'CANCEL',
}
