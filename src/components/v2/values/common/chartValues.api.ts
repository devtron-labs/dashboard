import React from 'react'
import { SERVER_MODE } from '../../../../config'
import { getEnvironmentListHelmApps, getEnvironmentListMin, getTeamListMin } from '../../../../services/service'
import { EnvironmentListHelmResult, Teams } from '../../../../services/service.types'
import { OptionType } from '../../../app/types'
import {
    generateHelmManifest,
    getChartValuesCategorizedListParsed,
    getChartVersionsMin,
    getReadme,
} from '../../../charts/charts.service'
import { ChartVersionType } from '../../../charts/charts.types'
import { showError, sortCallback, sortObjectArrayAlphabetically } from '../../../common'
import { ChartProjectAndEnvironmentType } from '../chartValuesDiff/ChartValuesView.type'

export async function fetchChartVersionsData(
    id: number,
    setChartVersionsData: React.Dispatch<React.SetStateAction<ChartVersionType[]>>,
    handleVersionSelection: (selectedVersion: number, selectedVersionUpdatePage: ChartVersionType) => void,
    currentChartVersion?: string,
) {
    try {
        const { result } = await getChartVersionsMin(id)
        setChartVersionsData(result)

        const _currentVersion =
            (currentChartVersion && result.find((e) => e.version === currentChartVersion)) || result[0]
        handleVersionSelection(_currentVersion.id, _currentVersion)
    } catch (err) {
        showError(err)
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
                kind: 'EXISTING',
            })
        }
    } catch (err) {
        showError(err)
    }
}

export async function getChartRelatedReadMe(
    id: number,
    currentFetchedReadMe: Map<number, string>,
    dispatch: (value: { type: string; payload: any }) => void,
) {
    try {
        dispatch({ type: 'fetchingReadMe', payload: true })
        const { result } = await getReadme(id)
        const _fetchedReadMe = currentFetchedReadMe
        _fetchedReadMe.set(id, result.readme)

        dispatch({
            type: 'multipleOptions',
            payload: {
                fetchingReadMe: false,
                fetchedReadMe: _fetchedReadMe,
                isReadMeAvailable: !!result.readme?.trim(),
            },
        })
    } catch (err) {
        showError(err)
        dispatch({
            type: 'multipleOptions',
            payload: {
                fetchingReadMe: false,
                isReadMeAvailable: false,
            },
        })
    }
}

export async function getGeneratedHelManifest(
    environmentId: number,
    clusterId: number,
    namespace: string,
    appName: string,
    appStoreApplicationVersionId: number,
    valuesYaml: string,
    dispatchYamlData: (action: { type: string; payload: any }) => void,
) {
    try {
        dispatchYamlData({
            type: 'multipleOptions',
            payload: {
                generatingManifest: true,
                valuesEditorError: '',
            },
        })

        const { result } = await generateHelmManifest({
            environmentId,
            clusterId,
            namespace,
            releaseName: appName,
            appStoreApplicationVersionId,
            valuesYaml,
        })

        dispatchYamlData({
            type: 'multipleOptions',
            payload: {
                generatingManifest: false,
                generatedManifest: result.manifest,
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

        dispatchYamlData({
            type: 'multipleOptions',
            payload: {
                generatingManifest: false,
                valuesEditorError: errorMessage,
            },
        })
    }
}

export async function fetchProjectsAndEnvironments(
    serverMode: SERVER_MODE,
    dispatch: (value: { type: string; payload: any }) => void,
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
            type: 'multipleOptions',
            payload: {
                environments: envList,
                projects: projectList,
            },
        })
    })
}
