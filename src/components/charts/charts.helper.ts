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

import { ToastManager, ToastVariantType, versionComparatorBySortOrder } from '@devtron-labs/devtron-fe-common-lib'

import { URLS } from '../../config'
import { ChartGroupDeployResponse, ChartValuesType } from './charts.types'

export const MultiChartSummaryView = {
    SELECT_CHART: 'SELECT-CHART',
    CONFIGURE: 'CONFIGURE',
    DETAILS: 'DETAILS',
}

export function getDiscoverChartDetailsURL(chartId: string | number) {
    return `${URLS.CHARTS}/discover/chart/${chartId}`
}

export function getSavedValuesListURL(chartId): string {
    return `${URLS.CHARTS}/discover/chart/${chartId}/preset-values`
}

export function getChartValuesURL(chartId: number | string, chartValueId?: number | string): string {
    return `${URLS.CHARTS}/discover/chart/${chartId}/preset-values/${chartValueId || 0}`
}

export function getChartGroupURL(chartGroupId: number | string | null) {
    if (chartGroupId) {
        return `${URLS.CHARTS}/discover/group/${chartGroupId}`
    }
    return `${URLS.CHARTS}/group`
}

export function getChartGroupEditURL(chartGroupId: number | string) {
    return `${URLS.CHARTS}/discover/group/${chartGroupId}/edit`
}

export function getChartValuesFiltered(chartValuesList: ChartValuesType[]): {
    savedChartValues: ChartValuesType[]
    deployedChartValues: ChartValuesType[]
    defaultChartValues: ChartValuesType[]
    existingChartValues: ChartValuesType[]
} {
    const chartValues = {
        savedChartValues: [],
        deployedChartValues: [],
        defaultChartValues: [],
        existingChartValues: [],
    }
    for (let i = 0; i < chartValuesList.length; i++) {
        if (chartValuesList[i].kind === 'TEMPLATE') {
            chartValues.savedChartValues.push(chartValuesList[i])
        } else if (chartValuesList[i].kind === 'DEPLOYED') {
            chartValues.deployedChartValues.push(chartValuesList[i])
        } else if (chartValuesList[i].kind === 'DEFAULT') {
            chartValues.defaultChartValues.push(chartValuesList[i])
        } else if (chartValuesList[i].kind === 'EXISTING') {
            chartValues.existingChartValues.push(chartValuesList[i])
        }
    }
    chartValues.defaultChartValues.sort((a, b) => versionComparatorBySortOrder(a.chartVersion, b.chartVersion))

    return chartValues
}

export function breadCrumbsChartValue(URL: string): Array<{ label: string; url: string }> {
    let arr = URL.split('/')
    arr = arr.filter((str) => str.length)
    let crumbs = arr.map((ele, itemIndex) => {
        let subArr = arr.slice(0, itemIndex + 1)
        if ((arr[itemIndex + 1], parseInt(arr[itemIndex + 1], 10))) {
            subArr = subArr.concat([arr[itemIndex + 1]])
        }
        return {
            label: ele,
            url: subArr.join('/'),
        }
    })
    // filter if label is a number
    crumbs = crumbs.filter((crumb) => !parseInt(crumb.label, 10))
    // last element not required
    crumbs.pop()
    return crumbs
}

/**
 * Checks if deployment of the apps of group chart are initiated based on the api response and renders toast message.
 * @param payload Response of group chart deployment api.
 */
export const renderChartGroupDeploymentToastMessage = ({ chartGroupInstallMetadata }: ChartGroupDeployResponse) => {
    const failedDeployments = chartGroupInstallMetadata.reduce((acc, metadata) => {
        if (metadata.triggerStatus === 'failed') {
            return acc + 1
        }
        return acc
    }, 0)

    let status: ToastVariantType = null
    let title = ''
    let description = ''

    if (failedDeployments === 0) {
        status = ToastVariantType.success
        title = 'Deployment initiated'
    } else if (failedDeployments === chartGroupInstallMetadata.length) {
        status = ToastVariantType.error
        title = 'Deployment failed'
    } else {
        status = ToastVariantType.warn
        title = 'Deployment initiated partially'
        description = `Deployment could not be initiated for ${failedDeployments}/${chartGroupInstallMetadata.length} applications`
    }

    ToastManager.showToast({
        variant: status,
        ...(description
            ? {
                  title,
                  description,
              }
            : {
                  description: title,
              }),
    })
}
