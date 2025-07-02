import {
    showError,
    ToastManager,
    ToastVariantType,
    versionComparatorBySortOrder,
} from '@devtron-labs/devtron-fe-common-lib'

import {
    getChartValuesCategorizedListParsed,
    getChartValuesTemplateList,
    getChartVersionDetails,
    getChartVersionsMin,
} from '@Components/charts/charts.service'

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
