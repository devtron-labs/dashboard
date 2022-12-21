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
