import { CDModalTabType, DeploymentNodeType, NodeAttr } from "../types"

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
    selectImage: (
        index: number,
        materialType: string,
        selectedCDDetail?: { id: number; type: DeploymentNodeType },
    ) => void
    toggleSourceInfo: (materialIndex: number, selectedCDDetail?: { id: number; type: DeploymentNodeType }) => void
    closeApprovalModal: (e) => void
    appId?: number
    pipelineId?: number
}