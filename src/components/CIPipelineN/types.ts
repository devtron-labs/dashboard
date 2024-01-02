import { PipelineFormType } from '../workflowEditor/types'

export enum DockerArgsAction {
    ADD = 'add_docker_arg',
    DELETE = 'delete_docker_arg',
    UPDATE_KEY = 'update_docker_arg_key',
    UPDATE_VALUE = 'update_docker_arg_value',
}

interface DockerArgsCommonType {
    handleDockerArgsUpdate: ({ action, argData }: HandleDockerArgsUpdateType) => void
    fromBuildPack?: boolean
    readOnly?: boolean
}

export interface DockerArgsProps extends DockerArgsCommonType {
    args: PipelineFormType['args']
}

export interface DockerArgsItemProps extends DockerArgsCommonType {
    arg: PipelineFormType['args'][number]
    index: number
}

export interface DockerArgsActionData {
    index?: number
    value?: string
}

export interface HandleDockerArgsUpdateType {
    action: DockerArgsAction
    argData?: DockerArgsActionData
}
