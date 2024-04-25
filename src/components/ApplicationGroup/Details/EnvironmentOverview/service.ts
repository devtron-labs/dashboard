import { get, getUrlWithSearchParams, post } from '@devtron-labs/devtron-fe-common-lib'
import { RotatePodsRequest } from '../../../v2/appDetails/sourceInfo/rotatePods/rotatePodsModal.type'
import { Routes } from '../../../../config'
import {
    AppGroupRotatePodsDTO,
} from '../../AppGroup.types'
import { StringifyOptions } from 'node:querystring'
import { mockDTO } from './constants'

export const manageApps = async (
    appIds: number[],
    envId: number,
    envName: string,
    action: 'hibernate' | 'unhibernate',
) => post(`batch/v1beta1/${action}`, { appIdIncludes: appIds, envId, envName })

export function getRestartWorkloadRotatePods(
    selectedAppIds: number[],
    envId: StringifyOptions,
): Promise<AppGroupRotatePodsDTO> {
    return get(
        getUrlWithSearchParams(Routes.ROTATE_PODS, { appIdIncludes: selectedAppIds, envId }),
    ) as Promise<AppGroupRotatePodsDTO>
}

// Mock function to generate data
export function getMockRestartWorkloadRotatePods(
    selectedAppIds: number[],
    envId: string,
): Promise<AppGroupRotatePodsDTO> {
    // Resolve Promise with the mock data
    //  return get(getUrlWithSearchParams(Routes.ROTATE_PODS, {selectedAppIds, envId}))
    return Promise.resolve(mockDTO)
}
export const postRestartWorkloadRotatePods = async (request: RotatePodsRequest) =>
    post(Routes.ROTATE_PODS, { ...request })
