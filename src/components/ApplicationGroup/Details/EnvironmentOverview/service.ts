import { get, getUrlWithSearchParams, post } from '@devtron-labs/devtron-fe-common-lib'
import { RotatePodsRequest } from '../../../v2/appDetails/sourceInfo/rotatePods/rotatePodsModal.type'
import { Routes } from '../../../../config'

export const manageApps = async (
    appIds: number[],
    envId: number,
    envName: string,
    action: 'hibernate' | 'unhibernate',
) => post(`batch/v1beta1/${action}`, { appIdIncludes: appIds, envId, envName })

export function getRestartWorkloadRotatePods(
    appIds: string,
    envId: string,
    signal: AbortSignal,
) {
     return get(getUrlWithSearchParams(Routes.BULK_ROTATE_POD, {appIds, envId}), { signal })
}
export const postRestartWorkloadRotatePods = async (request: RotatePodsRequest) =>
    post(Routes.ROTATE_PODS, { ...request })
