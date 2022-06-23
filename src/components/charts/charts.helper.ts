import { URLS } from '../../config'
import { ChartValuesType } from './charts.types'

export const MultiChartSummaryView = {
    SELECT_CHART: 'SELECT-CHART',
    CONFIGURE: 'CONFIGURE',
    DETAILS: 'DETAILS',
}

export function getDiscoverChartDetailsURL(chartId: string | number) {
    return `${URLS.CHARTS}/discover/chart/${chartId}`
}

export function getSavedValuesListURL(chartId): string {
    return `${URLS.CHARTS}/discover/chart/${chartId}/saved-values`
}

export function getChartValuesURL(chartId: number | string, chartValueId?: number | string): string {
    return `${URLS.CHARTS}/discover/chart/${chartId}/saved-values/${chartValueId || 0}`
}

export function getChartGroupURL(chartGroupId: number | string | null) {
    if (chartGroupId) return `${URLS.CHARTS}/discover/group/${chartGroupId}`
    else return `${URLS.CHARTS}/group`
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
    let chartValues = {
        savedChartValues: [],
        deployedChartValues: [],
        defaultChartValues: [],
        existingChartValues: [],
    }
    for (let i = 0; i < chartValuesList.length; i++) {
        if (chartValuesList[i].kind === 'TEMPLATE') chartValues.savedChartValues.push(chartValuesList[i])
        else if (chartValuesList[i].kind === 'DEPLOYED') chartValues.deployedChartValues.push(chartValuesList[i])
        else if (chartValuesList[i].kind === 'DEFAULT') chartValues.defaultChartValues.push(chartValuesList[i])
        else if (chartValuesList[i].kind === 'EXISTING') chartValues.existingChartValues.push(chartValuesList[i])
    }
    return chartValues
}

export function breadCrumbsChartValue(URL: string): Array<{ label: string; url: string }> {
    let arr = URL.split('/')
    arr = arr.filter((str) => str.length)
    let crumbs = arr.map((ele, itemIndex) => {
        let subArr = arr.slice(0, itemIndex + 1)
        if ((arr[itemIndex + 1], parseInt(arr[itemIndex + 1]))) subArr = subArr.concat([arr[itemIndex + 1]])
        return {
            label: ele,
            url: subArr.join('/'),
        }
    })
    //filter if label is a number
    crumbs = crumbs.filter((crumb) => !parseInt(crumb.label))
    //last element not required
    crumbs.pop()
    return crumbs
}
