import { noop, post } from '@devtron-labs/devtron-fe-common-lib'
import {
    ApiQueuingBatchStatusType,
    AppGroupListType,
    ManageAppsResponseType,
} from '../../AppGroup.types'
import { ApiQueuingWithBatch } from '../../AppGroup.service'
import { BULK_HIBERNATE_ERROR_MESSAGE, BULK_UNHIBERNATE_ERROR_MESSAGE, BulkResponseStatus } from '../../Constants'

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
                                response.error =
                                    action === 'hibernate'
                                        ? BULK_HIBERNATE_ERROR_MESSAGE[BulkResponseStatus.UNAUTHORIZE]
                                        : BULK_UNHIBERNATE_ERROR_MESSAGE[BulkResponseStatus.UNAUTHORIZE]
                                break
                            case 409:
                            default:
                                response.error =
                                    action === 'hibernate'
                                        ? BULK_HIBERNATE_ERROR_MESSAGE[BulkResponseStatus.FAIL]
                                        : BULK_UNHIBERNATE_ERROR_MESSAGE[BulkResponseStatus.FAIL]
                        }
                        return response
                    }),
                )
            })
            .catch(noop)
    })
}
