import { DeploymentStatusDetailsBreakdownDataType } from '../../../app/details/appDetails/appDetails.type'
import { HelmReleaseStatus } from '../../../external-apps/ExternalAppService'
import { AppDetails, AppStreamData } from '../appDetails.type'

export interface EnvironmentStatusComponentType {
    loadingDetails: boolean
    loadingResourceTree: boolean
    deploymentStatusDetailsBreakdownData: DeploymentStatusDetailsBreakdownDataType
    isVirtualEnvironment?: boolean
    isHelmApp?: boolean
    refetchDeploymentStatus: (showTimeline?: boolean) => void
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
    resourcesSyncResult: Object
    filterRemoveHealth?: boolean
    showFooter: boolean
}

export interface ChartUsedCardType {
    appDetails: AppDetails
    notes: string
    onClickShowNotes: () => void
    cardLoading: boolean
}

export interface HelmAppConfigApplyStatusCardType {
    releaseStatus: HelmReleaseStatus
    cardLoading: boolean
}
