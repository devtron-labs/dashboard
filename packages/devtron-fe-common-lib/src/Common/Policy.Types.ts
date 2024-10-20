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

import { PluginDataStoreType } from '../Shared'
import { VariableType } from './CIPipeline.Types'
import { ServerErrors } from './ServerError'
import { ResponseType } from './Types'

export enum ApplyPolicyToStage {
    PRE_CI = 'PRE_CI',
    POST_CI = 'POST_CI',
    PRE_OR_POST_CI = 'PRE_OR_POST_CI',
}

export enum PluginRequiredStage {
    PRE_CI = 'preBuildStage',
    POST_CI = 'postBuildStage',
    PRE_OR_POST_CI = 'PRE_OR_POST_CI',
}

export interface DefinitionSourceType {
    projectName: string
    isDueToProductionEnvironment: boolean
    isDueToLinkedPipeline: boolean
    policyName: string
    appName?: string
    clusterName?: string
    environmentName?: string
    branchNames?: string[]
    ciPipelineName?: string
}
export interface MandatoryPluginDetailType {
    id: number
    parentPluginId: number
    icon: string
    name: string
    description?: string
    requiredIn: PluginRequiredStage
    applied?: boolean
    inputVariables?: VariableType[]
    outputVariables?: VariableType[]
    definitionSources?: DefinitionSourceType[]
}
export interface MandatoryPluginDataType {
    pluginData: MandatoryPluginDetailType[]
    isValidPre: boolean
    isValidPost: boolean
}

export interface ProcessPluginDataReturnType {
    mandatoryPluginData: MandatoryPluginDataType
    pluginDataStore: PluginDataStoreType
    mandatoryPluginsError?: ServerErrors
}

export enum ConsequenceAction {
    BLOCK = 'BLOCK',
    ALLOW_UNTIL_TIME = 'ALLOW_UNTIL_TIME',
    ALLOW_FOREVER = 'ALLOW_FOREVER',
}

export interface ConsequenceType {
    action: ConsequenceAction
    metadataField: string
}

export interface BlockedStateData {
    isOffendingMandatoryPlugin: boolean
    isCITriggerBlocked: boolean
    ciBlockState: ConsequenceType
}

export interface GetBlockedStateResponse extends ResponseType {
    result?: BlockedStateData
}
