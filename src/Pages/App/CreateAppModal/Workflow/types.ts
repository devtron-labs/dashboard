import { CommonNodeAttr, SelectPickerOptionType, WorkflowType } from '@devtron-labs/devtron-fe-common-lib'

import { EnvironmentListMinType } from '@Components/app/types'
import { createClusterEnvGroup } from '@Components/common'

import { CreateAppFormStateType } from '../types'

export interface WorkflowProps {
    templateId: string
    onChange?: (workflowConfig: CreateAppFormStateType['workflowConfig'], isError: boolean) => void
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
