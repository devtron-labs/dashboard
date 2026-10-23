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

import {
    DEFAULT_PLUGIN_DATA_STORE,
    PluginType,
    ROUTER_URLS,
    ScriptType,
    StepType,
    TaskErrorObj,
} from '@devtron-labs/devtron-fe-common-lib'

import { PipelineFormDataErrorType } from '@Components/workflowEditor/types'

import { PluginFormMode, PluginListDataType } from './types'

export const PLUGINS_ROOT_URL = ROUTER_URLS.GLOBAL_CONFIG_PLUGINS

export const PLUGIN_ROUTE_SEGMENTS = {
    CREATE: 'create',
    CLONE: 'clone',
    NEW_VERSION: 'new-version',
} as const

export const PLUGIN_QUERY_KEYS = {
    LIST: 'global-config-plugin-list',
    TAGS: 'global-config-plugin-tags',
    PARENT_LIST: 'global-config-parent-plugin-list',
    VERSION_DETAIL: 'global-config-plugin-version-detail',
    GLOBAL_VARIABLES: 'global-config-plugin-global-variables',
} as const

export enum PluginListURLFilterKeys {
    TAG = 'tag',
}

export const DEFAULT_PLUGIN_LIST_DATA: PluginListDataType = {
    pluginDataStore: DEFAULT_PLUGIN_DATA_STORE,
    parentPluginIdList: [],
}

export const PLUGIN_DRAWER_WIDTH = '900px'

export const DEFAULT_PLUGIN_SCRIPT = '#!/bin/sh \nset -eo pipefail \n#set -v  ## uncomment this to debug the script \n'

/**
 * Stage under which the plugin task is kept inside the local pipeline context
 */
export const PLUGIN_TASK_STAGE_NAME = 'preBuildStage'

/**
 * Should be cloned before use, since the pipeline task editors mutate the nested error objects
 */
export const DEFAULT_PLUGIN_TASK_ERROR_OBJ: TaskErrorObj = {
    name: { isValid: true, message: null },
    isValid: true,
    inlineStepDetail: { inputVariables: [], outputVariables: [] },
}

/**
 * Should be cloned before use, since the pipeline task editors mutate the nested error objects
 */
export const DEFAULT_PLUGIN_FORM_DATA_ERROR_OBJ: PipelineFormDataErrorType = {
    name: { isValid: true, message: null },
    preBuildStage: { steps: [DEFAULT_PLUGIN_TASK_ERROR_OBJ], isValid: true },
    buildStage: { isValid: true },
    postBuildStage: { steps: [], isValid: true },
}

export const getDefaultPluginStep = (): StepType => ({
    id: 1,
    index: 1,
    name: 'Task 1',
    description: '',
    stepType: PluginType.INLINE,
    outputDirectoryPath: [],
    triggerIfParentStageFail: false,
    inlineStepDetail: {
        scriptType: ScriptType.SHELL,
        script: DEFAULT_PLUGIN_SCRIPT,
        conditionDetails: [],
        inputVariables: [],
        outputVariables: [],
        commandArgsMap: [{ command: '', args: [] }],
        portMap: [],
        mountCodeToContainer: false,
        mountDirectoryFromHost: false,
    },
})

export const PLUGIN_FORM_DRAWER_TITLE: Record<PluginFormMode, string> = {
    [PluginFormMode.CREATE]: 'Create plugin',
    [PluginFormMode.CLONE]: 'Clone plugin',
    [PluginFormMode.NEW_VERSION]: 'New plugin version',
}

export const PLUGIN_FORM_SUBMIT_TEXT: Record<PluginFormMode, string> = {
    [PluginFormMode.CREATE]: 'Create Plugin',
    [PluginFormMode.CLONE]: 'Create Plugin',
    [PluginFormMode.NEW_VERSION]: 'Save as new version',
}

export const CLONED_PLUGIN_NAME_SUFFIX = '_cloned'
