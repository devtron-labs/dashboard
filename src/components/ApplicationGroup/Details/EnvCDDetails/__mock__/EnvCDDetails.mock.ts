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

import { ResponseType } from '@devtron-labs/devtron-fe-common-lib'
import { ModuleConfigResponse } from '../../../../app/details/appDetails/appDetails.type'

export async function mockCDList(): Promise<ResponseType> {
    const response = {
        code: 200,
        status: 'OK',
        result: [
            {
                id: 6,
                environmentId: 4,
                description: '',
                preStage: {},
                postStage: {},
                preStageConfigMapSecretNames: { configMaps: null, secrets: null },
                postStageConfigMapSecretNames: { configMaps: null, secrets: null },
                isClusterCdActive: false,
                parentPipelineId: 0,
                parentPipelineType: '',
                deploymentAppType: 'argo_cd',
                appName: 'hellow-world-1',
                deploymentAppDeleteRequest: false,
                deploymentAppCreated: false,
                appId: 7,
            },
            {
                id: 7,
                environmentId: 4,
                description: '',
                preStage: {},
                postStage: {},
                preStageConfigMapSecretNames: { configMaps: null, secrets: null },
                postStageConfigMapSecretNames: { configMaps: null, secrets: null },
                isClusterCdActive: false,
                parentPipelineId: 0,
                parentPipelineType: '',
                deploymentAppType: 'argo_cd',
                appName: 'hello-world-2',
                deploymentAppDeleteRequest: false,
                deploymentAppCreated: false,
                appId: 8,
            },
            {
                id: 8,
                environmentId: 4,
                description: '',
                preStage: {},
                postStage: {},
                preStageConfigMapSecretNames: { configMaps: null, secrets: null },
                postStageConfigMapSecretNames: { configMaps: null, secrets: null },
                isClusterCdActive: false,
                parentPipelineId: 0,
                parentPipelineType: '',
                deploymentAppType: 'argo_cd',
                appName: 'hello-world-3',
                deploymentAppDeleteRequest: false,
                deploymentAppCreated: false,
                appId: 9,
            },
            {
                id: 9,
                environmentId: 4,
                description: '',
                preStage: {},
                postStage: {},
                preStageConfigMapSecretNames: { configMaps: null, secrets: null },
                postStageConfigMapSecretNames: { configMaps: null, secrets: null },
                isClusterCdActive: false,
                parentPipelineId: 0,
                parentPipelineType: '',
                deploymentAppType: 'argo_cd',
                appName: 'hello-world-4',
                deploymentAppDeleteRequest: false,
                deploymentAppCreated: false,
                appId: 10,
            },
            {
                id: 11,
                environmentId: 4,
                description: '',
                preStage: {},
                postStage: {},
                preStageConfigMapSecretNames: { configMaps: null, secrets: null },
                postStageConfigMapSecretNames: { configMaps: null, secrets: null },
                isClusterCdActive: false,
                parentPipelineId: 0,
                parentPipelineType: '',
                deploymentAppType: 'argo_cd',
                appName: 'hello-world-5',
                deploymentAppDeleteRequest: false,
                deploymentAppCreated: false,
                appId: 12,
            },
        ],
    }
    return response
}

export async function mockCDModuleConfig(): Promise<ModuleConfigResponse> {
    const response = {
        code: 200,
        status: 'OK',
        result: {
            enabled: false,
        },
    }
    return response
}
