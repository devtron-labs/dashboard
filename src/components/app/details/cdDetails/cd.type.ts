interface DeploymentTemplateCommon {
    id: number
    appId: number
    isAppMetricsEnabled: boolean
    deployed: boolean
    deployedOn: string
    deployedBy: number
    emailId: string
}

export interface DeploymentTemplateConfiguration extends DeploymentTemplateCommon {
    deploymentStatus: string
    wfrId: number
    workflowType: string
}

export interface DeploymentHistorySingleValue {
    displayName: string
    value: string
}
export interface DeploymentHistoryDetail {
    values: Record<string, DeploymentHistorySingleValue>
    codeEditorValue: DeploymentHistorySingleValue
}
export interface DeploymentTemplateHistoryType {
    currentConfiguration: DeploymentHistoryDetail
    baseTemplateConfiguration: DeploymentHistoryDetail
    codeEditorLoading: boolean
    loader?: boolean
}
export interface DeploymentTemplateOptions {
    label: string
    value: string
    author: string
    status: string
}
export interface CompareWithBaseConfiguration {
    // deploymentTemplatesConfiguration: DeploymentTemplateConfiguration[]
    selectedDeploymentTemplate: DeploymentTemplateOptions
    setSelectedDeploymentTemplate: (selected) => void
    setShowTemplate: React.Dispatch<React.SetStateAction<boolean>>
    baseTimeStamp: string
    baseTemplateId: string
    setBaseTemplateId: React.Dispatch<React.SetStateAction<string>>
    deploymentTemplatesConfigSelector: HistoryDiffSelectorList[]
}
export interface HistoryDiffSelectorList {
    id: number
    deployedOn: string
    deployedBy: string
    deploymentStatus: string
    wfrId?: number
}
export interface CompareViewDeploymentType {
    showTemplate: boolean
    setShowTemplate: React.Dispatch<React.SetStateAction<boolean>>
    baseTimeStamp: string
    baseTemplateId: string
    setBaseTemplateId: React.Dispatch<React.SetStateAction<string>>
    // deploymentTemplatesConfiguration: DeploymentTemplateConfiguration[]
    loader: boolean
    setLoader: React.Dispatch<React.SetStateAction<boolean>>
    deploymentTemplatesConfigSelector: HistoryDiffSelectorList[]
    deploymentHistoryList: DeploymentTemplateList[]
    setDepolymentHistoryList: React.Dispatch<React.SetStateAction<DeploymentTemplateList[]>>
}
export interface DeploymentTemplateList {
    id: number
    name: string
    childList?: string[]
}
