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

import { get, post, ROUTES } from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '../../../config/constants'
import { AppType } from './appDetails.type'
import { getAppId, generateDevtronAppIdentiferForK8sRequest } from './k8Resource/nodeDetail/nodeDetail.api'
import { getDeploymentType, getK8sResourcePayloadAppType } from './k8Resource/nodeDetail/nodeDetail.util'

export const getInstalledChartDetail = (_appId: number, _envId: number) => {
    return get(`${Routes.APP_STORE_INSTALLED_APP}/detail/v2?installed-app-id=${_appId}&env-id=${_envId}`)
}

export const getInstalledChartResourceTree = (_appId: number, _envId: number) => {
    return get(`${Routes.APP_STORE_INSTALLED_APP}/detail/resource-tree?installed-app-id=${_appId}&env-id=${_envId}`)
}

export const getInstalledChartNotesDetail = (_appId: number, _envId: number) => {
    return get(`${Routes.APP_STORE_INSTALLED_APP}/notes?installed-app-id=${_appId}&env-id=${_envId}`)
}

export const getInstalledChartDetailWithResourceTree = (_appId: number, _envId: number) => {
    return get(`${Routes.APP_STORE_INSTALLED_APP}/resource/hibernate?installed-app-id=${_appId}&env-id=${_envId}`)
}

export const getInstalledAppDetail = (_appId: number, _envId: number) => {
    return get(`app/detail?app-id=${_appId}&env-id=${_envId}`)
}

export const getSaveTelemetry = (appId: string) => {
    return get(`${Routes.HELM_RELEASE_APP_DETAIL_API}/save-telemetry/?appId=${appId}`)
}

export const deleteResource = (nodeDetails: any, appDetails: any, envId: string, forceDelete: boolean) => {
    if (!nodeDetails.group) {
        nodeDetails.group = ''
    }

    const { appName, deploymentAppType, clusterId, namespace, appType, appId, fluxTemplateType } = appDetails
    const { group, version, kind, name, namespace: nodeNamespace } = nodeDetails

    const data = {
        appId:
            appType == AppType.DEVTRON_APP
                ? generateDevtronAppIdentiferForK8sRequest(clusterId, appId, Number(envId))
                : getAppId({ clusterId, namespace, appName, templateType: fluxTemplateType ?? null }),
        k8sRequest: {
            resourceIdentifier: {
                groupVersionKind: {
                    Group: group,
                    Version: version,
                    Kind: kind,
                },
                namespace: nodeNamespace,
                name,
            },
            forceDelete: forceDelete,
        },
        appType: getK8sResourcePayloadAppType(appType),
        deploymentType: getDeploymentType(deploymentAppType),
    }
    return post(ROUTES.DELETE_RESOURCE, data)
}

export const getAppOtherEnvironment = (appId) => {
    const URL = `${Routes.APP_OTHER_ENVIRONMENT}?app-id=${appId}`
    return get(URL)
}
