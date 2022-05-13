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
    selectedDeploymentTemplate: DeploymentTemplateOptions
    setSelectedDeploymentTemplate: (selected) => void
    setShowTemplate: React.Dispatch<React.SetStateAction<boolean>>
    setLoader: React.Dispatch<React.SetStateAction<boolean>>
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
    loader: boolean
    setLoader: React.Dispatch<React.SetStateAction<boolean>>
    deploymentHistoryList: DeploymentTemplateList[]
    setDeploymentHistoryList: React.Dispatch<React.SetStateAction<DeploymentTemplateList[]>>
}
export interface DeploymentTemplateList {
    id: number
    name: string
    childList?: string[]
}

export interface DeploymentHistory {
    id: number
    cd_workflow_id: number
    name: string
    status: string
    pod_status: string
    message: string
    started_on: string
    finished_on: string
    pipeline_id: number
    namespace: string
    log_file_path: string
    triggered_by: number
    email_id?: string
    image: string
    workflow_type?: string
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
