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

import { BulkEditVersion, OptionType, useMotionValue } from '@devtron-labs/devtron-fe-common-lib'

import { SERVER_MODE_TYPE } from '../../config'

interface BaseOperationResponseType {
    appId: number
    appName: string
    envId: number
    envName?: string // Only received for v1beta2
}

export interface DTImpactedObjects extends BaseOperationResponseType {}

export interface CMandSecretImpactedObjects extends BaseOperationResponseType {
    names: string[]
}

export interface ImpactedObjects {
    deploymentTemplate: DTImpactedObjects[]
    configMap: CMandSecretImpactedObjects[]
    secret: CMandSecretImpactedObjects[]
}

export interface DtOutputKeys extends BaseOperationResponseType {
    message: string
}

export interface CMandSecretOutputKeys extends BaseOperationResponseType {
    names: string[]
    message: string
}

export interface DTBulkOutput {
    message: string[]
    failure: DtOutputKeys[]
    successful: DtOutputKeys[]
}

export interface CMandSecretBulkOutput {
    message: string[]
    failure: CMandSecretOutputKeys[]
    successful: CMandSecretOutputKeys[]
}

export interface BulkOutput {
    deploymentTemplate: DTBulkOutput
    configMap: CMandSecretBulkOutput
    secret: CMandSecretBulkOutput
}

export enum BulkEditViewType {
    FORM = 'FORM',
    LOADING_IMPACTED_OUTPUT = 'LOADING_IMPACTED_OUTPUT',
    LOADING_OUTPUT = 'LOADING_OUTPUT',
}

export interface BulkEditsState {
    view: BulkEditViewType
    statusCode: number
    isReadmeLoading: boolean
    impactedObjects: ImpactedObjects
    readmeVersionOptions: OptionType<BulkEditVersion>[]
    readmeResult: {
        [key in BulkEditVersion]: string
    }
    outputResult: BulkOutput
    showExamples: boolean
    activeOutputTab: 'output' | 'impacted' | 'none'
    codeEditorPayload: string
    selectedReadmeVersionOption: OptionType<BulkEditVersion>
    schema: Record<string, any> | null
}

export interface OutputTabType {
    handleOutputTabs: (e) => void
    outputName: string
    value: string
    name: string
}

export interface BulkEditsProps {
    serverMode: SERVER_MODE_TYPE
    outputHeightMV: ReturnType<typeof useMotionValue<number>>
    gridTemplateRows: ReturnType<typeof useMotionValue<string>>
}
