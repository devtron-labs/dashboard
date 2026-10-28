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

import { ReactNode } from 'react'

import {
    ConditionDetails,
    ParentPluginType,
    PluginCreationType,
    PluginDataStoreType,
    RefVariableType,
    ScriptType,
    VariableTypeFormat,
} from '@devtron-labs/devtron-fe-common-lib'

import { PipelineContext } from '@Components/workflowEditor/types'

import type { PLUGIN_ROUTE_SEGMENTS, PluginListURLFilterKeys } from './constants'

export enum PluginStageType {
    CI = 'CI',
    CD = 'CD',
    CI_CD = 'CI_CD',
    SCANNER = 'SCANNER',
}

export enum PluginStepType {
    INLINE = 'INLINE',
    REF_PLUGIN = 'REF_PLUGIN',
}

export enum PluginStepConditionType {
    SKIP = 'SKIP',
    TRIGGER = 'TRIGGER',
    SUCCESS = 'SUCCESS',
    FAIL = 'FAIL',
}

export enum PluginVariableKind {
    INPUT = 'INPUT',
    OUTPUT = 'OUTPUT',
}

export interface PluginStepConditionDTO {
    id: number
    pluginStepId: number
    conditionVariableId: number
    conditionType: PluginStepConditionType
    conditionalOperator: string
    conditionalValue: string
    deleted: boolean
}

export interface FileReferenceMetadataDTO {
    id: number
    name: string
    size: number
    mimeType: string
    extension: string
}

export interface PluginVariableValueConstraintDTO {
    id?: number
    choices?: string[]
    blockCustomValue?: boolean
    constraint?: {
        fileProperty?: {
            allowedExtensions?: string[]
            maxUploadSize?: number
            sizeUnit?: 'KB' | 'MB'
        }
    }
}

export interface PluginVariableDTO {
    id?: number
    name: string
    format: VariableTypeFormat
    description: string
    isExposed: boolean
    allowEmptyValue: boolean
    defaultValue: string
    value?: string
    variableType: PluginVariableKind
    valueType?: RefVariableType
    previousStepIndex?: number
    variableStepIndex: number
    variableStepIndexInPlugin: number
    referenceVariableName?: string
    isRuntimeArg?: boolean
    fileReferenceId?: number
    fileMountDir?: string
    fileReferenceMetadata?: FileReferenceMetadataDTO
    valueConstraint?: PluginVariableValueConstraintDTO
    pluginStepCondition?: PluginStepConditionDTO[]
}

export interface ScriptPathArgPortMappingDTO {
    id?: number
    typeOfMapping: 'FILE_PATH' | 'DOCKER_ARG' | 'PORT'
    filePathOnDisk?: string
    filePathOnContainer?: string
    command?: string
    args?: string[]
    portOnLocal?: number
    portOnContainer?: number
    scriptId?: number
}

export interface PluginPipelineScriptDTO {
    id: number
    script: string
    storeScriptAt: string
    type: ScriptType
    dockerfileExists: boolean
    mountPath: string
    mountCodeToContainer: boolean
    mountCodeToContainerPath: string
    mountDirectoryFromHost: boolean
    containerImagePath: string
    imagePullSecretType: 'CONTAINER_REGISTRY' | 'SECRET_PATH' | ''
    imagePullSecret: string
    deleted: boolean
    pathArgPortMapping: ScriptPathArgPortMappingDTO[]
}

export interface PluginStepDTO {
    id: number
    name: string
    description: string
    index: number
    stepType: PluginStepType
    refPluginId: number
    outputDirectoryPath: string[]
    dependentOnStep: string
    pluginPipelineScript?: PluginPipelineScriptDTO
    pluginStepVariable?: PluginVariableDTO[]
}

export interface PluginVersionMinDTO {
    id: number
    name: string
    pluginVersion: string
    description: string
    docLink: string
    isLatest: boolean
    isDeprecated: boolean
    createdOn: string
}

export interface ParentPluginDetailDTO {
    id: number
    name: string
    pluginIdentifier: string
    description: string
    type: PluginCreationType | ''
    icon: string
    isExposed: boolean
}

/**
 * Response of plugin/global/detail/{pluginVersionId}
 */
export interface PluginVersionDetailDTO {
    id: number
    name: string
    description: string
    type?: PluginCreationType | ''
    icon?: string
    tags: string[]
    pluginStage?: PluginStageType
    pluginVersion: string
    docLink: string
    isLatest: boolean
    isDeprecated: boolean
    isExposed: boolean
    createdBy: string
    updatedBy: string
    createdOn: string
    updatedOn: string
    /**
     * Null only for legacy versions without a parent
     */
    parentPlugin: ParentPluginDetailDTO | null
    /**
     * All versions of the parent plugin, newest first, deprecated ones included
     */
    versions: PluginVersionMinDTO[]
    /**
     * Omitted when there is no step
     */
    pluginSteps?: PluginStepDTO[]
    /**
     * Includes the internal (non exposed) variables
     */
    inputVariables: PluginVariableDTO[]
    outputVariables: PluginVariableDTO[]
}

// ---------------------------------- Component types ----------------------------------

export enum PluginFormMode {
    CREATE = 'create',
    CLONE = 'clone',
    NEW_VERSION = 'newVersion',
}

export type PluginsURLParamsType = {
    pluginVersionId: string
}

export interface PluginListURLFiltersType {
    [PluginListURLFilterKeys.TAG]: string[]
}

export interface PluginListFiltersType extends PluginListURLFiltersType {
    searchKey: string
}

/**
 * Flattened plugin list derived from the paginated response
 */
export interface PluginListDataType {
    pluginDataStore: PluginDataStoreType
    parentPluginIdList: number[]
}

export type PluginListActionMenuOptionType = (typeof PLUGIN_ROUTE_SEGMENTS)['CLONE' | 'NEW_VERSION']

export interface PluginListRowProps {
    parentPlugin: ParentPluginType
    pluginDataStore: PluginDataStoreType
    handleActionMenuClick: (action: PluginListActionMenuOptionType, pluginVersionId: number) => void
}

export interface PluginFormDrawerProps {
    mode: PluginFormMode
    /**
     * Called with the id of the created plugin version
     */
    handleSuccess: (pluginVersionId: number) => void
}

export interface PluginTaskEditorProps
    extends Pick<PipelineContext, 'formData' | 'setFormData' | 'formDataErrorObj' | 'setFormDataErrorObj'> {}

export interface PluginDetailSectionProps {
    title: string
    isExpandedByDefault?: boolean
    children: ReactNode
}

export interface PluginVariablesTableProps {
    variables: PluginVariableDTO[]
    variableKind: PluginVariableKind
}

export interface PluginConditionsListProps {
    conditions: ConditionDetails[]
}
