import { ResponseType } from '@devtron-labs/devtron-fe-common-lib'

export interface WorkloadCheckType {
    isChecked: boolean
    value: 'INTERMEDIATE' | 'CHECKED'
}

export interface ScaleWorkloadsType extends HibernateTargetObject, WorkloadCheckType {
    errorMessage?: string
}

export interface ScaleWorkloadsModalProps {
    appId: string
    onClose: () => void
    history: any
}

export interface HibernateTargetObject {
    group: string
    kind: string
    version: string
    name: string
    namespace: string
}

export interface HibernateStatus {
    success: boolean
    errorMessage: string
    targetObject: HibernateTargetObject
}

export interface HibernateResponse extends ResponseType {
    result?: HibernateStatus[]
}

export interface HibernateRequest {
    appId: string
    resources: HibernateTargetObject[]
}

export const LoadingText = {
    LOOKING_FOR_SCALABLE_WORKLOADS: 'Looking for scalable workloads',
    SCALING_DOWN_WORKLOADS: 'Scaling down workloads. Please wait...',
    RESTORING_WORKLOADS: 'Restoring workloads. Please wait...',
    NO_SCALABLE_WORKLOADS: 'No scalable workloads found',
    NO_ACTIVE_WORKLOADS: 'No active workloads available',
    NO_SCALED_DOWN_WORKLOADS: 'No scaled down workloads available',
}
