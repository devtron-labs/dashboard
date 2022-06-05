import React from 'react'
import { SERVER_MODE } from '../../../../config'
import { getEnvironmentListHelmApps, getEnvironmentListMin, getTeamListMin } from '../../../../services/service'
import {
    generateHelmManifest,
    getChartValuesCategorizedListParsed,
    getChartVersionsMin,
    getReadme,
} from '../../../charts/charts.service'
import { ChartVersionType } from '../../../charts/charts.types'
import { showError, sortCallback } from '../../../common'

export async function fetchChartVersionsData(
    id: number,
    isExternal: boolean,
    valueUpdateRequired: boolean,
    setSelectedVersionUpdatePage: React.Dispatch<React.SetStateAction<ChartVersionType>>,
    setChartVersionsData: React.Dispatch<React.SetStateAction<ChartVersionType[]>>,
    setLoading?: React.Dispatch<React.SetStateAction<boolean>>,
    currentChartVersion?: string,
    selectVersion?: React.Dispatch<React.SetStateAction<number>>,
) {
    try {
        setLoading && setLoading(true)
        const { result } = await getChartVersionsMin(id)
        setChartVersionsData(result)

        const specificVersion = currentChartVersion && result.find((e) => e.version === currentChartVersion)
        if (specificVersion) {
            selectVersion && selectVersion(specificVersion.id)
            setSelectedVersionUpdatePage(specificVersion)
        } else {
            setSelectedVersionUpdatePage(result[0])
        }
    } catch (err) {
        showError(err)
    } finally {
        setLoading && setLoading(false)
    }
}

export async function getChartValuesList(
    id: number,
    setChartValuesList: React.Dispatch<React.SetStateAction<any>>,
    setChartValues: React.Dispatch<React.SetStateAction<any>>,
    setLoading?: React.Dispatch<React.SetStateAction<boolean>>,
    initId?: number,
    installedAppVersionId = null,
) {
    setLoading && setLoading(true)
    try {
        const { result } = await getChartValuesCategorizedListParsed(id, installedAppVersionId)
        setChartValuesList(result)
        if (installedAppVersionId) {
            setChartValues({
                id: initId,
                kind: 'EXISTING',
            })
        }
    } catch (err) {
        showError(err)
    } finally {
        setLoading && setLoading(false)
    }
}

export async function getChartRelatedReadMe(
    id: number,
    setFetchingReadMe: React.Dispatch<React.SetStateAction<boolean>>,
    handleFetchedReadMe: (id: number, readme: string) => void,
) {
    try {
        setFetchingReadMe(true)
        const { result } = await getReadme(id)
        handleFetchedReadMe(id, result.readme)
        setFetchingReadMe(false)
    } catch (err) {
        showError(err)
    } finally {
        setFetchingReadMe(false)
    }
}

export async function getGeneratedHelManifest(
    installedConfig: any,
    appStoreApplicationVersionId: number,
    valuesYaml: string,
    setGeneratingManifest: React.Dispatch<React.SetStateAction<boolean>>,
    setGeneratedManifest: React.Dispatch<React.SetStateAction<string>>,
) {
    try {
        setGeneratingManifest(true)
        const { result } = await generateHelmManifest({
            environmentId: installedConfig.environmentId,
            clusterId: installedConfig.clusterId,
            namespace: installedConfig.namespace,
            releaseName: installedConfig.appName,
            appStoreApplicationVersionId: appStoreApplicationVersionId,
            valuesYaml,
        })

        setGeneratedManifest(result.manifest)
        setGeneratingManifest(false)
    } catch (e) {
        setGeneratingManifest(false)
        showError(e)
    }
}

export async function fetchProjects(setProjects: React.Dispatch<React.SetStateAction<any[]>>) {
    let { result } = await getTeamListMin()
    let projectList = result.map((p) => {
        return { value: p.id, label: p.name }
    })
    projectList = projectList.sort((a, b) => sortCallback('label', a, b, true))
    setProjects(projectList)
}

export async function fetchEnvironments(
    serverMode: SERVER_MODE,
    setEnvironments: React.Dispatch<React.SetStateAction<any[]>>,
) {
    if (serverMode === SERVER_MODE.FULL) {
        const { result } = await getEnvironmentListMin()
        let envList = result ? result : []
        envList = envList.map((env) => {
            return { value: env.id, label: env.environment_name, active: env.active }
        })
        envList = envList.sort((a, b) => sortCallback('label', a, b, true))
        setEnvironments(envList)
    } else {
        const { result } = await getEnvironmentListHelmApps()
        const envList = (result ? result : []).map((cluster) => ({
            label: cluster.clusterName,
            options: [
                ...cluster.environments?.map((env) => ({
                    label: env.environmentName,
                    value: env.environmentIdentifier,
                    namespace: env.namespace,
                    clusterName: cluster.clusterName,
                    clusterId: cluster.clusterId,
                })),
            ],
        }))
        setEnvironments(envList)
    }
}
