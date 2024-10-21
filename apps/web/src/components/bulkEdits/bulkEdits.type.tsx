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

import { RouteComponentProps } from 'react-router-dom'
import { OptionType } from '@devtron-labs/devtron-fe-common-lib'
import { SERVER_MODE_TYPE } from '../../config'

export interface CodeEditorScript {
    apiVersion: string
    kind: string
    spec: {
        include: {
            names: string[]
        }
        exclude: {
            names: string[]
        }
        envId: number[]
        global: boolean
        deploymentTemplate: {
            spec: {
                patchJson: any
            }
        }
        configMap: {
            spec: {
                names: string[]
                patchJson: any
            }
        }
        secret: {
            spec: {
                names: string[]
                patchJson: any
            }
        }
    }
}

export interface BulkConfiguration {
    operation: string
    script: CodeEditorScript
    readme: string
}

export interface DTImpactedObjects {
    appId: number
    appName: string
    envId: number
}

export interface CMandSecretImpactedObjects {
    appId: number
    appName: string
    envId: number
    names: string[]
}

export interface ImpactedObjects {
    deploymentTemplate: DTImpactedObjects[]
    configMap: CMandSecretImpactedObjects[]
    secret: CMandSecretImpactedObjects[]
}

export interface DtOutputKeys {
    appId: number
    appName: string
    envId: number
    message: string
}

export interface CMandSecretOutputKeys {
    appId: number
    appName: string
    envId: number
    message: string
    names: string[]
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

export interface BulkEditsState {
    view: string
    statusCode: number
    outputName: string
    isReadmeLoading: boolean
    impactedObjects: ImpactedObjects
    updatedTemplate: OptionType[]
    readmeResult: string[]
    outputResult: BulkOutput
    showExamples: boolean
    showImpactedData: boolean
    showOutputData: boolean
    bulkConfig: BulkConfiguration[]
    codeEditorPayload: string
}

export interface OutputTabType {
    handleOutputTabs: (e) => void
    outputName: string
    value: string
    name: string
}

export interface BulkEditsProps extends RouteComponentProps<{}> {
    // close: (event) => void;
    serverMode: SERVER_MODE_TYPE
}
