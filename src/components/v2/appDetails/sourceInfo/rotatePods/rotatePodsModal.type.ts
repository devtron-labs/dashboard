import { CHECKBOX_VALUE, ResponseType } from '@devtron-labs/devtron-fe-common-lib'
import { Dispatch, SetStateAction } from 'react'
import { Nodes, NodeType } from '../../../../app/types'
import { DeploymentStrategy } from '../../../../cdPipeline/cdPipeline.types'
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
    kind: Nodes | NodeType
    version: string
    name: string
    namespace: string
}

export interface RotatePodsModalProps {
    onClose: () => void
    callAppDetailsAPI: () => void
}

export interface RotateResponseModalProps {
    onClose: () => void
    response: RotatePodsResponseTargetObject[]
    setResult: Dispatch<SetStateAction<RotatePodsStatus>>
    callAppDetailsAPI: () => void
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

export interface DeploymentStrategyResponse extends ResponseType {
    result?: DeploymentStrategy
}

export interface RotatePodsRequest {
    appId: number
    resources: RotatePodsTargetObject[]
    environmentId: number
}

