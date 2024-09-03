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

import { EnvironmentListHelmResult, EnvListMinDTO, handleUTCTime } from '@devtron-labs/devtron-fe-common-lib'
import { AppListFilterConfig, AppListPayloadType } from '../list-new/AppListType'
import { Environment } from './types'

const getEnvironmentsFromClusterNamespace = (
    selectedClusterIds: number[],
    selectedNamespaces: string[],
    environmentList: EnvListMinDTO[],
    namespaceList: EnvironmentListHelmResult[],
): number[] => {
    const environments = new Set<number>()
    // If namespace is selected we send environments of selected namespace
    // Else we send all environments of selected clusters
    if (selectedNamespaces.length) {
        namespaceList?.forEach((cluster) => {
            cluster.environments.forEach((env) => {
                if (selectedNamespaces.includes(`${cluster.clusterId}_${env.namespace}`) && env.environmentId) {
                    environments.add(env.environmentId)
                }
            })
        })
    } else {
        environmentList?.forEach((env) => {
            if (selectedClusterIds.includes(env.cluster_id)) {
                environments.add(env.id)
            }
        })
    }
    return Array.from(environments)
}

export const appListModal = (appList) => {
    return appList.map((app) => {
        return {
            id: app.appId || 0,
            name: app.appName || 'NA',
            environments: app.environments.map((env) => environmentModal(env)) || [],
            defaultEnv: getDefaultEnvironment(app.environments),
        }
    })
}

const environmentModal = (env) => {
    let { appStatus } = env
    if (!env.appStatus) {
        if (env.lastDeployedTime) {
            appStatus = ''
        } else {
            appStatus = 'notdeployed'
        }
    }

    return {
        id: env.environmentId || 0,
        name: env?.environmentName || '',
        lastDeployedTime: env.lastDeployedTime ? handleUTCTime(env.lastDeployedTime, false) : '',
        status: env.status ? handleDeploymentInitiatedStatus(env.status) : 'notdeployed',
        default: env.default ? env.default : false,
        materialInfo: env.materialInfo || [],
        ciArtifactId: env.ciArtifactId || 0,
        clusterName: env?.clusterName || '',
        namespace: env?.namespace || '',
        appStatus,
        isVirtualEnvironment: env?.isVirtualEnvironment,
    }
}

const getDefaultEnvironment = (envList): Environment => {
    const env = envList[0]
    let { status } = env
    if (env.status.toLowerCase() === 'deployment initiated') {
        status = 'Progressing'
    }
    const appStatus = env.appStatus || (env.lastDeployedTime ? '' : 'notdeployed')
    return {
        id: env.environmentId as number,
        name: env?.environmentName,
        lastDeployedTime: env.lastDeployedTime ? handleUTCTime(env.lastDeployedTime) : '',
        status: handleDeploymentInitiatedStatus(status),
        materialInfo: env.materialInfo || [],
        ciArtifactId: env.ciArtifactId || 0,
        clusterName: env?.clusterName || '',
        namespace: env?.namespace || '',
        appStatus,
        isVirtualEnvironment: env?.isVirtualEnvironment,
    }
}

const handleDeploymentInitiatedStatus = (status: string): string => {
    if (status.replace(/\s/g, '').toLowerCase() == 'deploymentinitiated') {
        return 'progressing'
    }
    return status
}

export const getDevtronAppListPayload = (
    filterConfig: AppListFilterConfig,
    environmentList: EnvListMinDTO[],
    namespaceList: EnvironmentListHelmResult[],
): AppListPayloadType => {
    const { searchKey, offset, pageSize, sortBy, sortOrder, appStatus, environment, cluster, namespace, project } =
        filterConfig
    return {
        appNameSearch: searchKey,
        offset,
        size: pageSize,
        sortBy,
        sortOrder,
        appStatuses: appStatus,
        // If environment(s) is/are selected we send selected environment Ids else we send env Ids according to selected cluster and namespaces
        environments: environment?.length
            ? environment.map((envId) => +envId)
            : getEnvironmentsFromClusterNamespace(
                  cluster.map((clusterId) => +clusterId),
                  namespace,
                  environmentList,
                  namespaceList,
              ),
        teams: project.map((team) => +team),
        namespaces: namespace,
    }
}
