import { PipelineFormType } from '../workflowEditor/types'

export enum DockerArgsAction {
    ADD = 'add_docker_arg',
    DELETE = 'delete_docker_arg',
    UPDATE_KEY = 'update_docker_arg_key',
    UPDATE_VALUE = 'update_docker_arg_value',
}

export interface DockerArgsProps {
    args: PipelineFormType['args']
    handleDockerArgsUpdate: ({ action, argData }: HandleDockerArgsUpdateType) => void
    fromBuildPack?: boolean
    disabled?: boolean
}

export interface DockerArgsItemProps {
    arg: PipelineFormType['args'][number]
    index: number
    handleDockerArgsUpdate: ({ action, argData }: HandleDockerArgsUpdateType) => void
}

export interface DockerArgsActionData {
    index?: number
    value?: string
}

export interface HandleDockerArgsUpdateType {
    action: DockerArgsAction
    argData?: DockerArgsActionData
}
