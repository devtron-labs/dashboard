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
    post,
    put,
    trash,
    sortCallback,
    ResponseType,
    getUrlWithSearchParams,
} from '@devtron-labs/devtron-fe-common-lib'
import { DELETE_ACTION, Routes } from '../../config'
import { getAPIOptionsWithTriggerTimeout, handleUTCTime } from '../common'
import {
    ChartValuesType,
    ChartGroup,
    HelmTemplateChartRequest,
    HelmProjectUpdatePayload,
    DeleteInstalledChartParamsType,
} from './charts.types'
import { SavedValueListResponse } from './SavedValues/types'

interface RootObject {
    code: number
    status: string
    result?: any
}
export function getChartVersionsMin(chartId: number | string) {
    return get(`app-store/discover/application/${chartId}/version/autocomplete`)
}

export function getChartVersionDetails(versionId) {
    return get(`app-store/discover/application/${versionId}`)
}

export function getChartVersionDetailsV2(versionId) {
    return get(`app-store/deployment/application/version/${versionId}`)
}

export function getInstalledAppDetail(installedAppId, envId) {
    return get(`app-store/installed-app/detail?installed-app-id=${installedAppId}&env-id=${envId}`)
}

export function installChart(request, abortSignal?: AbortSignal) {
    const options = getAPIOptionsWithTriggerTimeout()
    options.signal = abortSignal
    return post(`app-store/deployment/application/install`, request, options)
}

export function updateChart(request) {
    const options = getAPIOptionsWithTriggerTimeout()
    return put(Routes.UPDATE_APP_API, request, options)
}

export function deleteInstalledChart(
    installedAppId: string | number,
    isGitops?: boolean,
    deleteAction?: DELETE_ACTION,
) {
    const baseUrl: string = `app-store/deployment/application/delete/${installedAppId}`
    const params: DeleteInstalledChartParamsType = {}
    if (deleteAction === DELETE_ACTION.FORCE_DELETE) {
        params['force'] = true
    } else if (isGitops) {
        params['partialDelete'] = true
        if (deleteAction === DELETE_ACTION.NONCASCADE_DELETE) {
            params['cascade'] = false
        }
    }
    const url = getUrlWithSearchParams(baseUrl, params)
    return trash(url)
}

export function getChartValuesTemplateList(chartId: number | string): Promise<SavedValueListResponse> {
    const URL = `${Routes.CHART_STORE}/${Routes.CHART_STORE_VALUES}/${Routes.CHART_VALUES_LIST_TEMPLATE}/${chartId}`
    return get(URL)
}

export function getChartValuesCategorizedList(chartId: number | string, installedAppVersionId = null): Promise<any> {
    let URL
    if (installedAppVersionId) {
        URL = `${Routes.CHART_STORE}/${Routes.CHART_STORE_VALUES}/${Routes.CHART_VALUES_LIST_CATEGORIZED}/${chartId}?installedAppVersionId=${installedAppVersionId}`
    } else {
        URL = `${Routes.CHART_STORE}/${Routes.CHART_STORE_VALUES}/${Routes.CHART_VALUES_LIST_CATEGORIZED}/${chartId}`
    }
    return get(URL)
}

export function getChartValuesCategorizedListParsed(
    chartId: number | string,
    installedAppVersionId = null,
): Promise<{ code: number; result: ChartValuesType[] }> {
    return getChartValuesCategorizedList(chartId, installedAppVersionId).then((response) => {
        const list = response.result.values || []
        const savedCharts = list.find((chartList) => chartList.kind === 'TEMPLATE')
        const deployedCharts = list.find((chartList) => chartList.kind === 'DEPLOYED')
        const defaultCharts = list.find((chartList) => chartList.kind === 'DEFAULT')
        const existingCharts = list.find((chartList) => chartList.kind === 'EXISTING')
        let savedChartValues = savedCharts && savedCharts.values ? savedCharts.values : []
        let deployedChartValues = deployedCharts && deployedCharts.values ? deployedCharts.values : []
        let defaultChartValues = defaultCharts && defaultCharts.values ? defaultCharts.values : []
        let existingChartValues = existingCharts && existingCharts.values ? existingCharts.values : []

        savedChartValues = savedChartValues.map((chart) => {
            return { ...chart, kind: 'TEMPLATE' }
        })
        savedChartValues.sort((a, b) => {
            return -1 * sortCallback('chartVersion', a, b)
        })

        deployedChartValues = deployedChartValues.map((chart) => {
            return { ...chart, kind: 'DEPLOYED' }
        })
        deployedChartValues.sort((a, b) => {
            return -1 * sortCallback('chartVersion', a, b)
        })

        defaultChartValues = defaultChartValues.map((chart) => {
            return { ...chart, kind: 'DEFAULT' }
        })
        defaultChartValues.sort((a, b) => {
            return -1 * sortCallback('chartVersion', a, b)
        })

        existingChartValues = existingChartValues.map((chart) => {
            return { ...chart, kind: 'EXISTING' }
        })
        existingChartValues.sort((a, b) => {
            return -1 * sortCallback('chartVersion', a, b)
        })

        const chartValuesList = defaultChartValues.concat(deployedChartValues, savedChartValues, existingChartValues)
        return {
            ...response,
            result: chartValuesList,
        }
    })
}

export function getChartValues(
    versionId: number | string,
    kind: 'DEFAULT' | 'TEMPLATE' | 'DEPLOYED' | 'EXISTING',
): Promise<any> {
    const URL = `${Routes.CHART_STORE}/${Routes.CHART_STORE_VALUES}/${Routes.CHART_VALUES}?referenceId=${versionId}&kind=${kind}`
    return get(URL)
}

interface ChartValuesCreate {
    appStoreVersionId: number
    name: string
    values: string
}

export function createChartValues(request: ChartValuesCreate, abortSignal?: AbortSignal) {
    const options = getAPIOptionsWithTriggerTimeout()
    options.signal = abortSignal
    const URL = `${Routes.CHART_STORE}/${Routes.CHART_STORE_VALUES}/${Routes.CHART_VALUES}`
    return post(URL, request, options)
}

export function updateChartValues(request) {
    const options = getAPIOptionsWithTriggerTimeout()
    const URL = `${Routes.CHART_STORE}/${Routes.CHART_STORE_VALUES}/${Routes.CHART_VALUES}`
    return put(URL, request, options)
}

export function deleteChartValues(chartId: number): Promise<any> {
    const URL = `${Routes.CHART_STORE}/${Routes.CHART_STORE_VALUES}/${Routes.CHART_VALUES}/${chartId}`
    return trash(URL)
}

export function getInstalledCharts(queryString: string) {
    let url = `${Routes.CHART_INSTALLED}`
    if (queryString) {
        url = `${url}${queryString}`
    }
    return get(url).then((response) => {
        return {
            ...response,
            result: Array.isArray(response.result)
                ? response.result.map((chart) => {
                      return {
                          ...chart,
                          deployedAt: chart.deployedAt ? handleUTCTime(chart.deployedAt, true) : '',
                      }
                  })
                : [],
        }
    })
}

export function saveChartGroup(requestBody) {
    const URL = `${Routes.CHART_GROUP}/`
    return post(URL, requestBody)
}

export function updateChartGroup(requestBody: ChartGroup) {
    const URL = `${Routes.CHART_GROUP}/`
    return put(URL, requestBody)
}

export function getChartGroups(): Promise<{ code: number; result: { groups: ChartGroup[] } }> {
    const URL = `${Routes.CHART_GROUP_LIST}`
    return get(URL).then((response) => {
        const groups = response?.result?.groups || []
        groups.sort((a, b) => sortCallback('name', a, b))
        return {
            ...response,
            result: {
                groups: groups.map((grp) => {
                    return {
                        ...grp,
                        chartGroupEntries: grp.chartGroupEntries || [],
                    }
                }),
            },
        }
    })
}

export function getChartGroupDetail(chartGroupId: string | number) {
    return get(`${Routes.CHART_GROUP}/${chartGroupId}`)
}

export function updateChartGroupEntries(payload) {
    return put(`${Routes.CHART_GROUP}/entries`, payload)
}

export function getReadme(appStoreApplicationVersionId: number) {
    return get(`app-store/discover/application/chartInfo/${appStoreApplicationVersionId}`)
}

export function getChartGroupInstallationDetails(chartGroupId: number | string) {
    return get(`${Routes.CHART_GROUP}/installation-detail/${chartGroupId}`)
}

export function generateHelmManifest(templateChartRequest: HelmTemplateChartRequest) {
    return post(Routes.HELM_APP_TEMPLATE_CHART, templateChartRequest)
}

export interface DeployableCharts {
    appName: string
    environmentId: number
    appStoreVersion: number
    valuesOverrideYaml?: string
    referenceValueId: number
    referenceValueKind: 'DEFAULT' | 'TEMPLATE' | 'DEPLOYED' | 'EXISTING'
    chartGroupEntryId?: number
}

export function deployChartGroup(projectId: number, charts: DeployableCharts[], chartGroupId?: number) {
    const options = getAPIOptionsWithTriggerTimeout()
    // chartGroupId empty when normal deployment
    return post(`app-store/group/install`, { projectId, chartGroupId, charts }, options)
}

interface appName {
    name: string
    exists?: boolean
    suggestedName?: string
}

interface AppNameValidated extends RootObject {
    result?: appName[]
}

export function validateAppNames(payload: appName[]): Promise<AppNameValidated> {
    return post(`app-store/application/exists`, payload)
}

export function getChartsByKeyword(input: string) {
    return get(`app-store/discover/search?chartName=${input}`)
}

export function deleteChartGroup(request) {
    return trash(Routes.CHART_GROUP, request)
}

export function updateHelmAppProject(payload: HelmProjectUpdatePayload): Promise<ResponseType> {
    return put(Routes.UPDATE_HELM_APP_META_INFO, payload)
}

export function getChartProviderList(): Promise<ResponseType> {
    return get('app-store/chart-provider/list')
}

export function updateChartProviderList(payload) {
    return post('app-store/chart-provider/update', payload)
}

export function updateSyncSpecificChart(payload) {
    return post('app-store/chart-provider/sync-chart ', payload)
}
