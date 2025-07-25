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

import { MutableRefObject } from 'react'
import {
    EnvListMinDTO,
    get,
    ResponseType,
    EnvironmentListHelmResult,
    Teams,
    getUrlWithSearchParams,
    APIOptions,
} from '@devtron-labs/devtron-fe-common-lib'
import moment from 'moment'
import { Cluster } from '@Services/service.types'
import { Moment12HourFormat, Routes } from '../../../config'
import {
    AppListFilterConfig,
    AppListPayloadType,
    FluxCDTemplateType,
    GenericAppListResponse,
    GenericAppType,
    GetDevtronHelmAppListParamsType,
    HelmAppListResponse,
} from './AppListType'
import { getAppList } from '../service'
import { getDevtronAppListPayload } from '../list/appList.modal'

export const getDevtronInstalledHelmApps = (
    clusterIdsCsv: string,
    appStatuses: string,
): Promise<HelmAppListResponse> => {
    const baseUrl = Routes.CHART_INSTALLED
    const params: GetDevtronHelmAppListParamsType = {
        clusterIds: clusterIdsCsv,
        appStatuses,
    }
    const url = getUrlWithSearchParams(baseUrl, params)
    return get(url)
}

export const getArgoInstalledExternalApps = (
    clusterIdsCsv: string,
    abortControllerRef?: MutableRefObject<AbortController>,
): Promise<ResponseType<GenericAppType[]>> => {
    const url = getUrlWithSearchParams(Routes.ARGO_APPS, { clusterIds: clusterIdsCsv })
    return get(url, { abortControllerRef })
}

export const getDevtronAppListDataToExport = (
    filterConfig: AppListFilterConfig,
    environmentList: EnvListMinDTO[],
    namespaceList: EnvironmentListHelmResult[],
    clusterList: Cluster[],
    projectList: Teams[],
    appCount: number,
) => {
    const appListPayload: AppListPayloadType = {
        ...getDevtronAppListPayload(filterConfig, environmentList, namespaceList),
        offset: 0,
        size: appCount,
    } // Over riding size and offset as we need all list (no pagination)
    const clusterMap = new Map<string, number>()
    clusterList.forEach((cluster) => clusterMap.set(cluster.cluster_name, cluster.id))
    return getAppList(appListPayload).then(({ result }) => {
        if (result.appContainers) {
            const _appDataList = []
            for (const _app of result.appContainers) {
                if (_app.environments) {
                    for (const _env of _app.environments) {
                        const clusterId = _env.clusterName ? clusterMap.get(_env.clusterName) || '-' : '-'
                        _appDataList.push({
                            appId: _env.appId,
                            appName: _env.appName,
                            projectId: _env.teamId,
                            projectName: projectList.find((project) => project.id === +_env.teamId).name,
                            environmentId: (_env.environmentName && _env.environmentId) || '-',
                            environmentName: _env.environmentName || '-',
                            clusterId: `${(clusterId ?? clusterId) || '-'}`,
                            clusterName: _env.clusterName || '-',
                            namespaceId: _env.namespace && clusterId ? `${clusterId}_${_env.namespace}` : '-',
                            namespace: _env.namespace || '-',
                            status: _env.appStatus || '-',
                            lastDeployedTime: _env.lastDeployedTime
                                ? moment(_env.lastDeployedTime).format(Moment12HourFormat)
                                : '-',
                        })
                    }
                } else {
                    _appDataList.push({
                        appId: _app.appId,
                        appName: _app.appName,
                        projectId: _app.projectId,
                        projectName: projectList.find((project) => project.id === +_app.projectId) || '-',
                        environmentId: '-',
                        environmentName: '-',
                        clusterId: '-',
                        clusterName: '-',
                        namespaceId: '-',
                        namespace: '-',
                        status: '-',
                        lastDeployedTime: '-',
                    })
                }
            }

            return _appDataList
        }

        return []
    })
}

export const getFluxInstalledExternalApps = async (
    clusterIdsCsv: string,
    options?: APIOptions,
    templateType?: FluxCDTemplateType,
): Promise<ResponseType<GenericAppType[]>> => {
    const url = getUrlWithSearchParams(Routes.FLUX_APPS, { clusterIds: clusterIdsCsv, noStream: true })
    const response = await get<GenericAppListResponse>(url, options)
    const appList = response.result?.fluxApplication ?? []
    return {
        ...response,
        result: templateType
            ? appList.filter(({ fluxAppDeploymentType }) => fluxAppDeploymentType === templateType)
            : appList,
    }
}
