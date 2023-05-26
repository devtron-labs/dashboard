import { CHECKBOX_VALUE, ResponseType } from '@devtron-labs/devtron-fe-common-lib'
import { Dispatch, SetStateAction } from 'react'
import {GVKType} from '../../../../ResourceBrowser/Types'

export interface WorkloadCheckType {
    isChecked: boolean
    value: CHECKBOX_VALUE
}

export interface RotatePodsType extends HibernateTargetObject, WorkloadCheckType {
    errorMessage?: string
}

export interface HibernateTargetObject {
    group: string
    kind: string
    version: string
    name: string
    namespace: string
}

export interface RotatePodsModalProps {
    onClose: () => void
}

export interface RotateResponseModalProps {
    onClose: () => void
    response: RotatePodsResponseTargetObject[]
    setResult: Dispatch<SetStateAction<RotatePodsStatus>>
}

export interface RotatePodsTargetObject {
    name: string
    namespace: string
    groupVersionKind: GVKType
}

export interface RotatePodsResponseTargetObject {
    name: string
    namespace: string
    groupVersionKind: GVKType
    errorResponse: string
}

export interface RotatePodsStatus {
    responses: RotatePodsResponseTargetObject[]
    containsError: boolean
}

export interface RotatePodsResponse extends ResponseType {
    result?: RotatePodsStatus
}

export interface RotatePodsRequest {
    appId: number
    resources: RotatePodsTargetObject[]
    environmentId: number
}

