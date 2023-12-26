import { PipelineFormType } from '../workflowEditor/types'

export enum DockerArgsAction {
    ADD = 'add_docker_arg',
    DELETE = 'delete_docker_arg',
    UPDATE_KEY = 'update_docker_arg_key',
    UPDATE_VALUE = 'update_docker_arg_value',
}

export interface DockerArgsProps {
    args: PipelineFormType['args']
    handleDockerArgsUpdate: ({ action, argData }: HandleDockerArgsUpdate) => void
}

export interface DockerArgsItemProps {
    arg: PipelineFormType['args'][number]
    index: number
    handleDockerArgsUpdate: ({ action, argData }: HandleDockerArgsUpdate) => void
}

export interface DockerArgsActionData {
    index?: number
    value?: string
}

export interface HandleDockerArgsUpdate {
    action: DockerArgsAction
    argData?: DockerArgsActionData
}
