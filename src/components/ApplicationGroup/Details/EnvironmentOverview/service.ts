import { get, getUrlWithSearchParams, noop, post, ResponseType } from '@devtron-labs/devtron-fe-common-lib'
import { RotatePodsRequest } from '../../../v2/appDetails/sourceInfo/rotatePods/rotatePodsModal.type'
import { Routes } from '../../../../config'
import {
    ApiQueuingBatchStatusType,
    AppGroupListType,
    ManageAppsResponseType,
    WorkloadListResultDTO,
} from '../../AppGroup.types'
import { ApiQueuingWithBatch } from '../../AppGroup.service'
import { BULK_CD_RESPONSE_STATUS_TEXT, BulkResponseStatus } from '../../Constants'

export const manageApps = async (
    appIds: number[],
    appDetailsList: AppGroupListType['apps'],
    envId: number,
    envName: string,
    action: 'hibernate' | 'unhibernate',
    httpProtocol: string,
) => {
    const appIdsSet = new Set(appIds)
    const appNames = appDetailsList
        .filter((item) => appIdsSet.has(item.appId))
        .map((item) => ({
            name: item.appName,
            id: item.appId,
        }))
        .sort((a, b) => a.id - b.id)
    appIds.sort((a, b) => a - b)
    return new Promise<ManageAppsResponseType[]>((resolve) => {
        ApiQueuingWithBatch(
            appIds.map(
                (appId) => () =>
                    post(
                        `batch/v1beta1/${action}`,
                        { appIdIncludes: [appId], envId, envName },
                        { timeout: window._env_.TRIGGER_API_TIMEOUT },
                    ),
            ),
            httpProtocol,
        )
            .then((results) => {
                resolve(
                    results.map((result, index) => {
                        if (result.status === ApiQueuingBatchStatusType.FULFILLED) {
                            return result.value?.result.response[0]
                        }
                        const response = {
                            success: false,
                            id: appIds[index],
                            appName: appNames[index].name,
                            error: '',
                        }
                        const errorReason = result.reason
                        switch (errorReason.code) {
                            case 403:
                            case 422:
                                response.error = BULK_CD_RESPONSE_STATUS_TEXT[BulkResponseStatus.UNAUTHORIZE]
                                break
                            case 409:
                            default:
                                response.error = BULK_CD_RESPONSE_STATUS_TEXT[BulkResponseStatus.FAIL]
                        }
                        return response
                    }),
                )
            })
            .catch(noop)
    })
}

export function getRestartWorkloadRotatePods(
    appIds: string,
    envId: string,
    signal: AbortSignal,
): Promise<ResponseType<WorkloadListResultDTO>> {
    return get(getUrlWithSearchParams(Routes.BULK_ROTATE_POD, { appIds, envId }), {
        signal,
        timeout: 2 * 60 * 1000,
    }) as Promise<ResponseType<WorkloadListResultDTO>>
}
export const postRestartWorkloadRotatePods = async (request: RotatePodsRequest) =>
    post(Routes.ROTATE_PODS, { ...request })
