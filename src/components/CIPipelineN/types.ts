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

import { OptionType, PluginDetailType, StepType } from '@devtron-labs/devtron-fe-common-lib'
import { PipelineFormType } from '../workflowEditor/types'

export enum DockerArgsAction {
    ADD = 'add_docker_arg',
    DELETE = 'delete_docker_arg',
    UPDATE_KEY = 'update_docker_arg_key',
    UPDATE_VALUE = 'update_docker_arg_value',
}

export interface DockerArgsActionData {
    index?: number
    value?: string
}

export interface HandleDockerArgsUpdateType {
    action: DockerArgsAction
    argData?: DockerArgsActionData
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

export interface PluginDetailHeaderProps {
    handlePluginVersionChange: (pluginId: number) => Promise<void>
}

export interface PluginVersionSelectOptionType extends OptionType<number, string>, Pick<PluginDetailType, 'isLatest'> {}
export interface TaskDetailComponentParamsType {
    appId: string
}

export interface TaskTitleProps {
    taskDetail: StepType
}

export interface TaskTitleTippyContentProps {
    isLatest: boolean
    pluginVersion: string
    pluginName: string
    displayName: string
}
