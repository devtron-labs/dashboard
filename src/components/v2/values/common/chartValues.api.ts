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

import React from 'react'
import {
    showError,
    Teams,
    sortCallback,
    getTeamListMin,
    EnvironmentListHelmResult,
} from '@devtron-labs/devtron-fe-common-lib'
import { SERVER_MODE } from '../../../../config'
import { getEnvironmentListHelmApps, getEnvironmentListMin } from '../../../../services/service'
import {
    generateHelmManifest,
    getChartValuesCategorizedListParsed,
    getChartVersionsMin,
    getReadme,
} from '../../../charts/charts.service'
import { createClusterEnvGroup, sortObjectArrayAlphabetically } from '../../../common'
import { ChartKind, ChartValuesViewAction, ChartValuesViewActionTypes } from '../chartValuesDiff/ChartValuesView.type'
import { getAndUpdateSchemaValue } from '../chartValuesDiff/ChartValuesView.utils'
import { EnvironmentListMinType } from '../../../app/types'

export async function fetchChartVersionsData(
    id: number,
    dispatch: (action: ChartValuesViewAction) => void,
    currentChartVersion?: string,
    currentChartValueId?: number,
) {
    try {
        const { result } = await getChartVersionsMin(id)
        const _currentVersion =
            (currentChartVersion && result.find((e) => e.version === currentChartVersion)) || result[0]
        if (_currentVersion) {
            dispatch({
                type: ChartValuesViewActionTypes.multipleOptions,
                payload: {
                    isLoading: false,
                    chartVersionsData: result,
                    selectedVersion: _currentVersion.id,
                    selectedVersionUpdatePage: _currentVersion,
                    initialChartVersionValues: {
                        chartVersionId: _currentVersion.id,
                        chartValuesId: currentChartValueId,
                    },
                },
            })
        }
    } catch (err) {
        showError(err)
        dispatch({
            type: ChartValuesViewActionTypes.isLoading,
            payload: false,
        })
    }
}

export async function getChartValuesList(
    id: number,
    setChartValuesList: React.Dispatch<React.SetStateAction<any>>,
    handleChartValuesSelection?: (chartValues) => void,
    initId?: number,
    installedAppVersionId = null,
) {
    try {
        const { result } = await getChartValuesCategorizedListParsed(id, installedAppVersionId)
        setChartValuesList(result)
        if (installedAppVersionId && handleChartValuesSelection) {
            handleChartValuesSelection({
                id: initId,
                kind: ChartKind.EXISTING,
            })
        }
    } catch (err) {
        showError(err)
    }
}

export async function getChartRelatedReadMe(
    id: number,
    currentFetchedReadMe: Map<number, string>,
    modifiedValuesYaml: string,
    dispatch: (action: ChartValuesViewAction) => void,
) {
    try {
        dispatch({ type: ChartValuesViewActionTypes.fetchingReadMe, payload: true })
        const { result } = await getReadme(id)
        getAndUpdateSchemaValue(modifiedValuesYaml, result.valuesSchemaJson, dispatch)

        const _payload = {
            fetchingReadMe: false,
        }
        if (!currentFetchedReadMe.has(id)) {
            const _fetchedReadMe = currentFetchedReadMe
            _fetchedReadMe.set(id, result.readme)

            _payload['fetchedReadMe'] = _fetchedReadMe
            _payload['isReadMeAvailable'] = !!result.readme?.trim()
        }

        dispatch({
            type: ChartValuesViewActionTypes.multipleOptions,
            payload: _payload,
        })
    } catch (err) {
        showError(err)
        dispatch({
            type: ChartValuesViewActionTypes.multipleOptions,
            payload: {
                fetchingReadMe: false,
                isReadMeAvailable: false,
                schemaJson: null,
            },
        })
    }
}

export async function getGeneratedHelmManifest(
    environmentId: number,
    clusterId: number,
    namespace: string,
    appName: string,
    appStoreApplicationVersionId: number,
    valuesYaml: string,
    dispatch: (action: ChartValuesViewAction) => void,
) {
    try {
        const { result } = await generateHelmManifest({
            environmentId,
            clusterId,
            namespace,
            releaseName: appName,
            appStoreApplicationVersionId,
            valuesYaml,
        })

        dispatch({
            type: ChartValuesViewActionTypes.multipleOptions,
            payload: {
                generatingManifest: false,
                generatedManifest: result.manifest,
                valuesYamlUpdated: false,
                valuesEditorError: '',
            },
        })
    } catch (e: any) {
        let errorMessage = ''
        if (Array.isArray(e.errors) && e.errors.length > 0) {
            errorMessage = e.errors[0].userMessage
        } else {
            errorMessage = e.message
        }

        dispatch({
            type: ChartValuesViewActionTypes.multipleOptions,
            payload: {
                generatingManifest: false,
                valuesEditorError: errorMessage,
            },
        })
    }
}

export async function fetchProjectsAndEnvironments(
    serverMode: SERVER_MODE,
    dispatch: (action: ChartValuesViewAction) => void,
): Promise<void> {
    Promise.allSettled([
        getTeamListMin(),
        serverMode === SERVER_MODE.FULL ? getEnvironmentListMin(true) : getEnvironmentListHelmApps(),
    ]).then((responses: { status: string; value?: any; reason?: any }[]) => {
        const projectListRes: Teams[] = responses[0].value?.result || []
        const environmentListRes: EnvironmentListMinType[] | EnvironmentListHelmResult[] = responses[1].value?.result || []
        let envList = []

        if (serverMode === SERVER_MODE.FULL) {
            envList = createClusterEnvGroup(
                environmentListRes.map((env) => {
                    return {
                        value: env.id,
                        label: env.environment_name,
                        active: env.active,
                        namespace: env.namespace,
                        clusterName: env.cluster_name,
                        description: env.description,
                        isVirtualEnvironment: env.isVirtualEnvironment,
                        allowedDeploymentTypes: env.allowedDeploymentTypes ?? [],
                    }
                }),
                'clusterName',
            )
        } else {
            const _sortedResult = (
                environmentListRes ? sortObjectArrayAlphabetically(environmentListRes as EnvironmentListHelmResult[], 'clusterName') : []
            )
            envList = _sortedResult.map((cluster) => ({
                label: cluster.clusterName,
                options: [
                    ...cluster.environments?.map((env) => ({
                        label: env.environmentName,
                        value: env.environmentId,
                        namespace: env.namespace,
                        clusterName: cluster.clusterName,
                        clusterId: cluster.clusterId,
                        isVirtualEnvironment: env?.isVirtualEnvironment,
                        allowedDeploymentTypes: env.allowedDeploymentTypes ?? [],
                    })),
                ],
            }))
        }

        const projectList = projectListRes
            .map((p) => {
                return { value: p.id, label: p.name }
            })
            .sort((a, b) => sortCallback('label', a, b, true))

        dispatch({
            type: ChartValuesViewActionTypes.multipleOptions,
            payload: {
                environments: envList,
                projects: projectList,
            },
        })
    })
}

export async function fetchProjects(dispatch: (action: ChartValuesViewAction) => void): Promise<void> {
    getTeamListMin().then((response) => {
        const projectListRes: Teams[] = response.result || []

        const projectList = projectListRes
            .map((p) => {
                return { value: p.id, label: p.name }
            })
            .sort((a, b) => sortCallback('label', a, b, true))

        dispatch({
            type: ChartValuesViewActionTypes.multipleOptions,
            payload: {
                projects: projectList,
            },
        })
    })
}
