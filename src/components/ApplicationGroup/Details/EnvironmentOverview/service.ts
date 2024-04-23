import { get, getUrlWithSearchParams, post } from '@devtron-labs/devtron-fe-common-lib'
import { RotatePodsRequest } from '../../../v2/appDetails/sourceInfo/rotatePods/rotatePodsModal.type'
import { Routes } from '../../../../config'
import { AppGroupRotatePodsDTO, WorkloadListResult, ResourceIdentifiers } from '../../AppGroup.types'
import { mock } from 'node:test'
import { env } from 'node:process'
import { StringifyOptions } from 'node:querystring'

export const manageApps = async (
    appIds: number[],
    envId: number,
    envName: string,
    action: 'hibernate' | 'unhibernate',
) => post(`batch/v1beta1/${action}`, { appIdIncludes: appIds, envId, envName })

export function getRestartWorkloadRotatePods(selectedAppIds: number[], envId: StringifyOptions): Promise<AppGroupRotatePodsDTO> {
    return get(getUrlWithSearchParams(Routes.ROTATE_PODS, { appIdIncludes: selectedAppIds, envId })) as Promise<AppGroupRotatePodsDTO>
}


// Mock function to generate data
export function getMockRestartWorkloadRotatePods(selectedAppIds: number[], envId: string): Promise<AppGroupRotatePodsDTO> {
    // Construct mock data
    const mockResourceIdentifiers: ResourceIdentifiers[] = [
        {
            name: "exampleName",
            namespace: "exampleNamespace",
            groupVersionKind: {
                Group: "exampleGroup",
                Version: "exampleVersion",
                Kind: "Deployment"
            },
        },
        {
            name: "aspdotnetapp-qa-devtroncd",
            namespace: "exampleNamespace2",
            groupVersionKind: {
                Group: "exampleGroup2",
                Version: "exampleVersion2",
                Kind: "StatefulSet"
            },
        },
        {
            name: "aspdotnetapp-qa-devtroncd-7d8fbd4586",
            namespace: "exampleNamespace2",
            groupVersionKind: {
                Group: "exampleGroup2",
                Version: "exampleVersion2",
                Kind: "ReplicaSet"
            },
        },
        {
            name: "exampleName2",
            namespace: "exampleNamespace2",
            groupVersionKind: {
                Group: "exampleGroup2",
                Version: "exampleVersion2",
                Kind: "ReplicaSet"
            },
        }
    ];

    const mockResult: WorkloadListResult = {
        environmentId: 1,
        resourceIdentifiers: mockResourceIdentifiers,
        userId: 2,
        resourceIdentifierMap : {
            "1": {
                resourceIdentifiers: mockResourceIdentifiers,
                appName: "argoexec-build",
                environmentId: 1,
            },
            "2": {
                resourceIdentifiers: mockResourceIdentifiers,
                appName: "argo-rollout",
                environmentId: 1,
            }
        }
    }

    const mockDTO: AppGroupRotatePodsDTO = {
        result: mockResult,
        code: 200,
        status: "OK"
    };

    // Resolve Promise with the mock data
    return Promise.resolve(mockDTO);
}
export const postRestartWorkloadRotatePods = async (request: RotatePodsRequest) =>
    post(Routes.ROTATE_PODS, { ...request})