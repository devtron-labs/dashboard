import { DeploymentStatusDetailsBreakdownDataType } from "../../../app/details/appDetails/appDetails.type"
import { AppStreamData } from "../appDetails.type"
export interface EnvironmentStatusComponentType {
    appStreamData: any
    loadingDetails: boolean
    loadingResourceTree: boolean
    deploymentStatusDetailsBreakdownData: DeploymentStatusDetailsBreakdownDataType
}
export interface AppEnvironment {
    environmentName: string
    environmentId: number
    appMetrics: boolean
    infraMetrics: boolean
    prod: boolean
    isSelected?: boolean
}

export interface NodeStreamMap {
    group: string
    kind: string
    message: string
    name: string
    namespace: string
    status: string
    syncPhase: string
    version: string
}

export interface AppStatusDetailsChartType {
    appStreamData: AppStreamData
    filterRemoveHealth?: boolean
    showFooter: boolean
}
