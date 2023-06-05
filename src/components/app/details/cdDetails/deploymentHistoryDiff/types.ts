import { DeploymentHistoryDetail, DeploymentTemplateList } from "../cd.type"

export interface DeploymentHistorySingleValue {
    displayName: string
    value: string
}

export interface DeploymentTemplateHistoryType {
    currentConfiguration: DeploymentHistoryDetail
    baseTemplateConfiguration: DeploymentHistoryDetail
    previousConfigAvailable: boolean
}

export interface DeploymentTemplateOptions {
    label: string
    value: string
    author: string
    status: string
}

export interface CompareWithBaseConfiguration {
    selectedDeploymentTemplate: DeploymentTemplateOptions
    setSelectedDeploymentTemplate: (selected) => void
    setFullScreenView: React.Dispatch<React.SetStateAction<boolean>>
    setLoader: React.Dispatch<React.SetStateAction<boolean>>
    setPreviousConfigAvailable: React.Dispatch<React.SetStateAction<boolean>>
}

export interface CompareViewDeploymentType {
    setFullScreenView: React.Dispatch<React.SetStateAction<boolean>>
    deploymentHistoryList: DeploymentTemplateList[]
    setDeploymentHistoryList: React.Dispatch<React.SetStateAction<DeploymentTemplateList[]>>
}

export interface DeploymentHistoryParamsType {
    appId: string
    pipelineId?: string
    historyComponent?: string
    baseConfigurationId?: string
    historyComponentName?: string
    envId?: string
    triggerId?: string
}

export interface DeploymentHistorySidebarType {
    deploymentHistoryList: DeploymentTemplateList[]
    setDeploymentHistoryList: React.Dispatch<React.SetStateAction<DeploymentTemplateList[]>>
}