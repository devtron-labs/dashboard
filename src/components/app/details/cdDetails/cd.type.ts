import { DeploymentAppType } from "../../../v2/appDetails/appDetails.type"

export interface DeploymentHistorySingleValue {
    displayName: string
    value: string
}
export interface DeploymentHistoryDetail {
    componentName?: string
    values: Record<string, DeploymentHistorySingleValue>
    codeEditorValue: DeploymentHistorySingleValue
}
export interface HistoryDiffSelectorList {
    id: number
    deployedOn: string
    deployedBy: string
    deploymentStatus: string
    wfrId?: number
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

export interface DeploymentDetailStepsType{
  deploymentStatus?: string
  deploymentAppType?: DeploymentAppType
  isGitops?: boolean
  installedAppVersionHistoryId?: number
}