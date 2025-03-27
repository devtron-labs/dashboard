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

import { CommonNodeAttr, SelectPickerOptionType, WorkflowType } from '@devtron-labs/devtron-fe-common-lib'

import { EnvironmentListMinType } from '@Components/app/types'
import { createClusterEnvGroup } from '@Components/common'

import { CreateAppFormErrorStateType, CreateAppFormStateType } from '../types'

export interface WorkflowProps {
    templateId: string
    onChange?: (
        workflowConfig: CreateAppFormStateType['workflowConfig'],
        workflowIdToErrorMessageMap: CreateAppFormErrorStateType['workflowConfig'],
    ) => void
    workflowIdToErrorMessageMap: CreateAppFormErrorStateType['workflowConfig']
}

export type CDNodeEnvironmentSelectPickerOptionType = SelectPickerOptionType & {
    isVirtualEnvironment: boolean
}

export enum NodeUpdateActionType {
    UPDATE_CD_PIPELINE = 'UPDATE_CD_PIPELINE',
}

type NodeUpdateActionPropsMap = {
    [NodeUpdateActionType.UPDATE_CD_PIPELINE]: {
        id: string
        wfId: string
        value: CDNodeEnvironmentSelectPickerOptionType
    }
}

export type HandleNodeUpdateActionProps<T extends keyof NodeUpdateActionPropsMap = keyof NodeUpdateActionPropsMap> =
    T extends keyof NodeUpdateActionPropsMap ? { actionType: T } & NodeUpdateActionPropsMap[T] : never

export interface GetWorkflowGraphVisualizerNodesProps {
    workflows: WorkflowType[]
    environmentList: EnvironmentListMinType[]
    handleNodeUpdateAction: (props: HandleNodeUpdateActionProps) => void
}

export interface ConvertWorkflowNodesToGraphVisualizerNodesProps
    extends Pick<GetWorkflowGraphVisualizerNodesProps, 'handleNodeUpdateAction'> {
    workflowNodes: CommonNodeAttr[]
    workflowId: string
    environmentListOptions: ReturnType<typeof createClusterEnvGroup<EnvironmentListMinType>>
}
