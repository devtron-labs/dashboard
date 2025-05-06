/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Dispatch, SetStateAction } from 'react'

import {
    CHECKBOX_VALUE,
    DeploymentStrategy,
    GVKType,
    Nodes,
    NodeType,
    ResponseType,
} from '@devtron-labs/devtron-fe-common-lib'

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
    isDeploymentBlocked: boolean
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
