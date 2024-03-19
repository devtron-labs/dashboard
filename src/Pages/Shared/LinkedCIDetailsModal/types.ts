import { WorkflowType } from '../../../components/app/details/triggerView/types'
import { DEPLOYMENT_STATUS, TriggerType } from '../../../config'

export interface LinkedCIDetailModalProps {
    workflows: WorkflowType[]
    handleClose: () => void
}

export interface LinkedCIAppDto {
    appId: number
    appName: string
    deploymentStatus: (typeof DEPLOYMENT_STATUS)[keyof typeof DEPLOYMENT_STATUS]
    environmentId: number
    environmentName: string
    triggerMode: (typeof TriggerType)[keyof typeof TriggerType]
}

// Another interface to create segregation from LinkedCIAppDto
export interface LinkedCIApp extends LinkedCIAppDto {}
