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

import {
    ApiQueuingWithBatch,
    get,
    getUrlWithSearchParams,
    noop,
    post,
    PromiseAllStatusType,
    ResponseType,
} from '@devtron-labs/devtron-fe-common-lib'

import { Routes } from '../../../../config'
import { RotatePodsRequest } from '../../../v2/appDetails/sourceInfo/rotatePods/rotatePodsModal.type'
import { AppGroupListType, ManageAppsResponseType, WorkloadListResultDTO } from '../../AppGroup.types'
import { BULK_HIBERNATE_ERROR_MESSAGE, BULK_UNHIBERNATE_ERROR_MESSAGE, BulkResponseStatus } from '../../Constants'

export const manageApps = async (
    appIds: number[],
    appDetailsList: AppGroupListType['apps'],
    envId: number,
    envName: string,
    action: 'hibernate' | 'unhibernate',
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
                        `batch/v1beta2/${action}`,
                        { appIdIncludes: [appId], envId, envName },
                        { timeout: window._env_.TRIGGER_API_TIMEOUT },
                    ),
            ),
        )
            // Disabling this rule as this is earlier implementation of APIQueueing when it did not had generics
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .then((results: any[]) => {
                resolve(
                    results.map((result, index) => {
                        if (result.status === PromiseAllStatusType.FULFILLED) {
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
