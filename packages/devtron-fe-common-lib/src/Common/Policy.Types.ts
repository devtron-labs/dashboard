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

import { PipelineFormType } from '@Pages/Applications'
import { PluginDataStoreType, PluginDetailPayloadType, ResourceKindType } from '../Shared'
import { VariableType } from './CIPipeline.Types'
import { ServerErrors } from './ServerError'

export enum ApplyPolicyToStage {
    PRE_CI = 'PRE_CI',
    POST_CI = 'POST_CI',
    /**
     * @deprecated in mandatory plugin policy v2
     */
    PRE_OR_POST_CI = 'PRE_OR_POST_CI',
    PRE_CD = 'PRE_CD',
    POST_CD = 'POST_CD',
}

// FIXME: The name build is getting is used in CDPipeline.
// This enum is mapping values from BuildStageVariable
export enum PluginRequiredStage {
    PRE_STAGE = 'preBuildStage',
    POST_STAGE = 'postBuildStage',
    PRE_OR_POST_STAGE = 'PRE_OR_POST_CI',
}

export interface DefinitionSourceType {
    policyNames: string[]
    linkedCIPipelineNames?: string[]
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
    definitionSources?: DefinitionSourceType
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

export type ProcessPluginDataCIParamsType = {
    resourceKind: ResourceKindType.ciPipeline
    ciPipelineId: number
    /**
     * Comma separated branch names used for v1 api
     * For v2 format is [branchName1],[branchName2]
     */
    branchName?: string

    envName?: never
}

export type ProcessPluginDataCDParamsType = {
    resourceKind: ResourceKindType.cdPipeline
    envName?: string

    ciPipelineId?: never
    branchName?: never
}

export type ProcessPluginDataParamsType = {
    formData: PipelineFormType
    pluginDataStoreState: PluginDataStoreType
    appId: number
    appName: string
    /**
     * Would be sent in case we have to get data for steps
     */
    requiredPluginIds?: PluginDetailPayloadType['pluginId']
} & (ProcessPluginDataCIParamsType | ProcessPluginDataCDParamsType)

export enum ConsequenceAction {
    /**
     * This is used if the policy is enforced immediately.
     */
    BLOCK = 'BLOCK',
    /**
     * This is used if the policy will be enforced after a certain timestamp.
     */
    ALLOW_UNTIL_TIME = 'ALLOW_UNTIL_TIME',
    /**
     * This is used if the policy is not enforced yet (just to show waring).
     */
    ALLOW_FOREVER = 'ALLOW_FOREVER',
}

export type ConsequenceType =
    | {
          action: Exclude<ConsequenceAction, ConsequenceAction.ALLOW_UNTIL_TIME>
          metadataField?: never | null
      }
    | {
          action: ConsequenceAction.ALLOW_UNTIL_TIME
          /**
           * Denotes the time till which the policy enforcement is relaxed
           */
          metadataField: string
      }

export interface BlockedStateData {
    isOffendingMandatoryPlugin: boolean
    isCITriggerBlocked: boolean
    ciBlockState: ConsequenceType
}
