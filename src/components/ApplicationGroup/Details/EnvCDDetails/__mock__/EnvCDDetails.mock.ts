import { ModuleConfigResponse } from '../../../../app/details/appDetails/appDetails.type'
import { ResponseType } from '@devtron-labs/devtron-fe-common-lib'

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
