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
    getChartValuesTemplateList,
    getChartVersionDetails,
    getChartVersionsMin,
} from '@Components/charts/charts.service'
import { DELETE_ACTION, Routes } from '@Config/constants'

import { ChartDeploymentsDTO } from './types'

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
        const { result } = await getChartValuesTemplateList(chartId)
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
