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

import { get, getUrlWithSearchParams, ResponseType, trash } from '@devtron-labs/devtron-fe-common-lib'

import { Routes } from '../../../../config'
import { fetchWithFullRoute } from '../../../../services/fetchWithFullRoute'
import { AppType } from '../../../v2/appDetails/appDetails.type'
import {
    ClusterConnectionResponse,
    DataSourceDetailsDTO,
    DataSourceDetailsQueryParams,
    DataSourceDetailsType,
    DeploymentStatusDetailsResponse,
    ModuleConfigResponse,
} from './appDetails.type'

export const getDataSourceDetailsFromEnvironment = async (envName: string): Promise<DataSourceDetailsType> => {
    try {
        const {
            result: { name, id },
        } = await get<DataSourceDetailsDTO>(
            getUrlWithSearchParams(Routes.ENV_DATA_SOURCE_NAME, {
                environmentName: envName,
            } satisfies DataSourceDetailsQueryParams),
        )

        return { dataSourceName: name, dataSourceId: id }
    } catch {
        return {
            dataSourceName: '',
            dataSourceId: null,
        }
    }
}

export function isDatasourceHealthy(datasourceId: number | string) {
    const timestamp = new Date()
    const root = window.__ORCHESTRATOR_ROOT__.replace('/orchestrator', '')
    const URL = `${root}/grafana/api/datasources/proxy/${datasourceId}/api/v1/query?query=1&time=${timestamp.getTime()}`
    return fetchWithFullRoute(URL, 'GET')
}

export function getClusterConnectionStatus(envId: number): Promise<ClusterConnectionResponse> {
    const URL = `${Routes.CLUSTER_ENV_MAPPING}/${envId}/connection`
    return get(URL)
}
export function deleteArgoCDAppWithNonCascade(
    appType: string,
    appId: number,
    envId: number,
    force?: boolean,
): Promise<ResponseType> {
    let URL: string
    if (appType === AppType.DEVTRON_APP) {
        URL = `${Routes.NONCASCADE_DELETE_DEVTRON_APP}/${appId}/${envId}/non-cascade`
    } else if (appType === AppType.DEVTRON_HELM_CHART) {
        URL = `${Routes.NONCASCADE_DELETE_HELM_APP}/${appId}/non-cascade`
    }
    if (force) {
        URL = `${URL}?force=${force}`
    }
    return trash(URL)
}

export function getDeploymentStatusDetail(
    appId: string,
    envId: string,
    showTimeline: boolean,
    triggerId?: string,
    isHelmApps?: boolean,
    installedAppVersionHistoryId?: number,
): Promise<DeploymentStatusDetailsResponse> {
    let appendUrl
    if (isHelmApps) {
        appendUrl = Routes.HELM_DEPLOYMENT_STATUS_TIMELINE_INSTALLED_APP
    } else {
        appendUrl = Routes.DEPLOYMENT_STATUS
    }
    return get(
        `${appendUrl}/${appId}/${envId}${`?showTimeline=${showTimeline}`}${triggerId ? `&wfrId=${triggerId}` : ``}${installedAppVersionHistoryId ? `&installedAppVersionHistoryId=${installedAppVersionHistoryId}` : ''}`,
    )
}

export function getModuleConfigured(moduleName: string): Promise<ModuleConfigResponse> {
    return get(`${Routes.MODULE_CONFIGURED}?name=${moduleName}`)
}
