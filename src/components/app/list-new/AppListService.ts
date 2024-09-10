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
    get,
    EnvironmentListHelmResult,
    EnvironmentHelmResult,
    getNamespaceListMin as getNamespaceList,
    EnvironmentListHelmResponse,
} from '@devtron-labs/devtron-fe-common-lib'
import { getAppFilters, getClusterListMinWithoutAuth } from '../../../services/service'
import { Routes, SERVER_MODE } from '../../../config'
import { Cluster } from '../../../services/service.types'
import { APP_STATUS } from '../config'
import { getProjectList } from '../../project/service'
import { HelmAppListResponse, FluxCDTemplateType } from './AppListType'
import { InitialEmptyMasterFilters } from './Constants'

async function commonAppFilters(serverMode) {
    if (serverMode === SERVER_MODE.FULL) {
        return getAppFilters()
    }
    return Promise.all([getProjectList(), getClusterListMinWithoutAuth()]).then(([projectListRes, clusterListResp]) => {
        return { result: { Teams: projectListRes?.result, Clusters: clusterListResp?.result } }
    })
}

export const getInitData = (payloadParsedFromUrl: any, serverMode: string): Promise<any> => {
    // cluster vs namespace
    const _clusterVsNamespaceMap = buildClusterVsNamespace(payloadParsedFromUrl.namespaces.join(','))
    const _clusterIds = [..._clusterVsNamespaceMap.keys()].join(',')

    return Promise.all([
        commonAppFilters(serverMode),
        _clusterIds ? getNamespaceList(_clusterIds) : { result: undefined },
    ]).then(([appFilterList, namespaceListRes]) => {
        const projectList = appFilterList.result?.Teams
        const environmentList = appFilterList.result?.Environments
        const clusterList = appFilterList.result?.Clusters

        // push apps with no projects in project res
        if (projectList && Array.isArray(projectList)) {
            projectList.push({
                id: 0,
                name: 'Apps with no projects',
                active: true,
            })
        }

        // set master filters data starts (check/uncheck)
        const filterApplied = {
            teams: new Set(payloadParsedFromUrl.teams),
            environments: new Set(payloadParsedFromUrl.environments),
            clusterVsNamespaceMap: _clusterVsNamespaceMap,
            appStatus: new Set(payloadParsedFromUrl.appStatuses),
            templateType: new Set(payloadParsedFromUrl.templateType),
        }

        const filters = structuredClone(InitialEmptyMasterFilters)

        // set filter projects starts
        filters.projects = projectList
            ? projectList.map((team) => {
                  return {
                      key: team.id,
                      label: team.name.toLocaleLowerCase(),
                      isSaved: true,
                      isChecked: filterApplied.teams.has(team.id),
                  }
              })
            : []
        filters.projects = filters.projects.sort((a, b) => {
            return sortByLabel(a, b)
        })
        // set filter projects ends

        // set filter environments starts
        filters.environments = environmentList
            ? environmentList.map((env) => {
                  return {
                      key: env.id,
                      label: env.environment_name.toLocaleLowerCase(),
                      isSaved: true,
                      isChecked: filterApplied.environments.has(env.id),
                  }
              })
            : []
        filters.environments = filters.environments.sort((a, b) => {
            return sortByLabel(a, b)
        })
        // set filter environments ends

        // set filter clusters starts
        if (clusterList && Array.isArray(clusterList)) {
            clusterList.forEach((cluster: Cluster) => {
                filters.clusters.push({
                    key: cluster.id,
                    label: cluster.cluster_name.toLocaleLowerCase(),
                    isSaved: true,
                    isChecked: filterApplied.clusterVsNamespaceMap.has(cluster.id.toString()),
                    optionMetadata: {
                        isVirtualCluster: cluster.isVirtualCluster,
                    },
                })
            })
        }
        filters.clusters = filters.clusters.sort((a, b) => {
            return sortByLabel(a, b)
        })

        // set filter namespace starts
        const _namespaces = _buildNamespaces(
            namespaceListRes as EnvironmentListHelmResponse,
            filterApplied.clusterVsNamespaceMap,
        )
        filters.namespaces = _namespaces.sort((a, b) => {
            return sortByLabel(a, b)
        })
        // set filter namespace ends

        // set filter appStatus starts

        filters.appStatus = Object.entries(APP_STATUS).map(([keys, values]) => {
            return {
                key: values,
                label: keys,
                isSaved: true,
                isChecked: filterApplied.appStatus.has(values),
            }
        })

        // set filter appStatus ends

        // set filter templateType starts
        filters.templateType = Object.entries(FluxCDTemplateType).map(([, values]) => ({
            key: values,
            label: values,
            isSaved: true,
            isChecked: filterApplied.templateType.has(values),
        }))
        // set filter templateType ends

        // set master filters data ends (check/uncheck)

        // set list data for env cluster & namespace
        const environmentClusterAppListData = new Map()
        const clusterMap = new Map()
        const projectMap = new Map()
        if (clusterList) {
            for (const cluster of clusterList) {
                clusterMap.set(cluster.id, cluster.cluster_name)
            }
        }
        if (projectList) {
            for (const project of projectList) {
                projectMap.set(project.id, project.name)
            }
        }

        if (environmentList) {
            for (const env of environmentList) {
                const envData = {
                    environmentName: env.environment_name,
                    namespace: env.namespace,
                    clusterName: clusterMap.get(env.cluster_id),
                    clusterId: env.cluster_id,
                }
                environmentClusterAppListData.set(env.id, envData)
            }
        }

        // end

        return {
            projectsRes: projectList,
            projectMap,
            environmentClusterAppListData,
            filters,
        }
    })
}

export const getNamespaces = (
    clusterIdCsv: string,
    clusterVsNamespaceMap: Map<string | number, any[]>,
): Promise<any> => {
    return Promise.all([getNamespaceList(clusterIdCsv)]).then(([namespaceListRes]) => {
        return _buildNamespaces(namespaceListRes, clusterVsNamespaceMap)
    })
}

export const getDevtronInstalledHelmApps = (
    clusterIdsCsv: string,
    appStatuses?: string,
): Promise<HelmAppListResponse> => {
    let url = Routes.CHART_INSTALLED
    if (clusterIdsCsv) {
        url = `${url}?clusterIds=${clusterIdsCsv}`
    }
    if (appStatuses) {
        url = `${url}${clusterIdsCsv ? '&' : '?'}appStatuses=${appStatuses}`
    }
    return get(url)
}

export const getArgoInstalledExternalApps = (clusterIdsCsv: string) =>
    get(`${Routes.ARGO_APPS}${clusterIdsCsv ? `?clusterIds=${clusterIdsCsv}` : ''}`)

const sortByLabel = (a, b) => {
    if (a.label < b.label) {
        return -1
    }
    if (a.label > b.label) {
        return 1
    }
    return 0
}

// cluster vs namespace (sample input : [{clusterId_namespace}])
export const buildClusterVsNamespace = (clustersAndNamespacesCsv: any): any => {
    const _clusterVsNamespaceMap = new Map()
    if (!clustersAndNamespacesCsv) {
        return _clusterVsNamespaceMap
    }

    const clustersAndNamespacesArr = clustersAndNamespacesCsv.split(',')
    clustersAndNamespacesArr.forEach((clustersAndNamespacesElem) => {
        const clusterId = clustersAndNamespacesElem.split('_')[0]
        const namespace = clustersAndNamespacesElem.split('_')[1]
        let clusterNamespaces = _clusterVsNamespaceMap.get(clusterId)
        if (!clusterNamespaces) {
            clusterNamespaces = []
        }
        if (namespace) {
            clusterNamespaces.push(namespace)
        }
        _clusterVsNamespaceMap.set(clusterId, clusterNamespaces)
    })

    return _clusterVsNamespaceMap
}

const _buildNamespaces = (
    namespaceListRes: EnvironmentListHelmResponse,
    clusterVsNamespaceMap: Map<string | number, any[]>,
): any[] => {
    const _namespaces = []
    if (!namespaceListRes.result || !Array.isArray(namespaceListRes.result)) {
        return _namespaces
    }

    namespaceListRes.result.forEach((namespaceObj: EnvironmentListHelmResult) => {
        const _clusterId = namespaceObj.clusterId
        const _clusterName = namespaceObj.clusterName
        const _isClusterSelected = clusterVsNamespaceMap.has(_clusterId.toString())
        namespaceObj.environments.forEach((environment: EnvironmentHelmResult) => {
            const _namespace = environment.namespace
            // avoid pushing same namespace for same cluster multiple times (can be data bug in backend)
            if (_namespace && !_namespaces.some((_ns) => _ns.clusterId == _clusterId && _ns.actualName == _namespace)) {
                _namespaces.push({
                    key: `${_clusterId}_${_namespace}`,
                    label: `<div><div class="dc__truncate-text">${_namespace}</div><div class="cn-6 fs-11 fw-n dc__truncate-text"> cluster: ${_clusterName}</div></div>`,
                    isSaved: true,
                    isChecked:
                        _isClusterSelected && clusterVsNamespaceMap.get(_clusterId.toString()).includes(_namespace),
                    clusterId: _clusterId,
                    actualName: _namespace,
                    clusterName: _clusterName,
                    toShow: clusterVsNamespaceMap.size == 0 || _isClusterSelected,
                })
            }
        })
    })

    return _namespaces
}
