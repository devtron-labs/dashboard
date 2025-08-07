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
    showError,
    ToastManager,
    ToastVariantType,
    versionComparatorBySortOrder,
} from '@devtron-labs/devtron-fe-common-lib'

import {
    deleteInstalledChart,
    getChartValuesCategorizedListParsed,
    getChartVersionDetails,
    getChartVersionsMin,
} from '@Components/charts/charts.service'
import { DELETE_ACTION, Routes } from '@Config/constants'

import { ChartDeploymentsDTO, ChartValuesTemplateDTO } from './types'

export const fetchChartVersions = async (chartId: string) => {
    try {
        const { result } = await getChartVersionsMin(chartId)

        if (result?.length) {
            return result.sort((a, b) => versionComparatorBySortOrder(a.version, b.version))
        }

        ToastManager.showToast({
            variant: ToastVariantType.error,
            description: 'Some error occurred. Please try reloading the page',
        })

        return []
    } catch (err) {
        showError(err)
        throw err
    }
}

export const fetchChartDetails = async (selectedVersion: number) => {
    try {
        const { result } = await getChartVersionDetails(selectedVersion)
        return result
    } catch (err) {
        showError(err)
        throw err
    }
}

export const fetchChartValuesList = async (chartId: string) => {
    try {
        const { result } = await getChartValuesCategorizedListParsed(chartId)
        return result
    } catch (err) {
        showError(err)
        throw err
    }
}

export const fetchChartValuesTemplateList = async (chartId: string) => {
    try {
        const { result } = await get<ChartValuesTemplateDTO[]>(
            `${Routes.CHART_STORE}/${Routes.CHART_STORE_VALUES}/${Routes.CHART_VALUES_LIST_TEMPLATE}/${chartId}`,
        )
        return result || []
    } catch (err) {
        showError(err)
        throw err
    }
}

export const fetchChartDeployments = async (chartId: string) => {
    const URL = `${Routes.CHART_STORE}/${Routes.CHART_STORE_DEPLOYMENT}/installed-app/${chartId}`
    try {
        const { result } = await get<ChartDeploymentsDTO[]>(URL)
        return result || []
    } catch (err) {
        showError(err)
        throw err
    }
}

export const deleteChartDeployment = async ({
    installedAppId,
    isGitops,
    deleteAction,
}: {
    installedAppId: number
    isGitops?: boolean
    deleteAction?: DELETE_ACTION
}) => {
    const { result } = await deleteInstalledChart(installedAppId, isGitops, deleteAction)
    return result
}
