import React from 'react'
import { SERVER_MODE } from '../../../../config'
import { getEnvironmentListHelmApps, getEnvironmentListMin, getTeamListMin } from '../../../../services/service'
import { EnvironmentListHelmResult, Teams } from '../../../../services/service.types'
import {
    generateHelmManifest,
    getChartValuesCategorizedListParsed,
    getChartVersionsMin,
    getReadme,
} from '../../../charts/charts.service'
import { showError, sortCallback, sortObjectArrayAlphabetically } from '../../../common'
import { ChartKind, ChartValuesViewAction, ChartValuesViewActionTypes } from '../chartValuesDiff/ChartValuesView.type'
import { convertSchemaJsonToMap } from '../chartValuesDiff/ChartValuesView.utils'

export async function fetchChartVersionsData(
    id: number,
    dispatch: (action: ChartValuesViewAction) => void,
    currentChartVersion?: string,
) {
    try {
        const { result } = await getChartVersionsMin(id)
        const _currentVersion =
            (currentChartVersion && result.find((e) => e.version === currentChartVersion)) || result[0]

        dispatch({
            type: ChartValuesViewActionTypes.multipleOptions,
            payload: {
                isLoading: false,
                chartVersionsData: result,
                selectedVersion: _currentVersion.id,
                selectedVersionUpdatePage: _currentVersion,
            },
        })
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
    dispatch: (action: ChartValuesViewAction) => void,
) {
    try {
        dispatch({ type: ChartValuesViewActionTypes.fetchingReadMe, payload: true })
        const { result } = await getReadme(id)
        const _payload = {
            fetchingReadMe: false,
            schemaJson: convertSchemaJsonToMap(result.valuesSchemaJson),
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
                // schemaJson: null
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
        serverMode === SERVER_MODE.FULL ? getEnvironmentListMin() : getEnvironmentListHelmApps(),
    ]).then((responses: { status: string; value?: any; reason?: any }[]) => {
        const projectListRes: Teams[] = responses[0].value?.result || []
        const environmentListRes: any[] = responses[1].value?.result || []
        let envList = []

        if (serverMode === SERVER_MODE.FULL) {
            envList = environmentListRes.map((env) => {
                return {
                    value: env.id,
                    label: env.environment_name,
                    active: env.active,
                    namespace: env.namespace,
                }
            })
            envList = envList.sort((a, b) => sortCallback('label', a, b, true))
        } else {
            const _sortedResult = (
                environmentListRes ? sortObjectArrayAlphabetically(environmentListRes, 'clusterName') : []
            ) as EnvironmentListHelmResult[]
            envList = _sortedResult.map((cluster) => ({
                label: cluster.clusterName,
                options: [
                    ...cluster.environments?.map((env) => ({
                        label: env.environmentName,
                        value: env.environmentId,
                        namespace: env.namespace,
                        clusterName: cluster.clusterName,
                        clusterId: cluster.clusterId,
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
