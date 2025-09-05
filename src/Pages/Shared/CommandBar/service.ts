import { Chart } from '@Components/charts/charts.types'
import { getAppListMin, getAvailableCharts } from '@Services/service'
import { AppListMinDTO } from '@Services/service.types'

export const getCommandBarResourceLists = async (): Promise<{ appList: AppListMinDTO[]; chartList: Chart[] }> => {
    const promiseResponse = await Promise.allSettled([getAppListMin(), getAvailableCharts()])

    const appList = promiseResponse[0].status === 'fulfilled' ? promiseResponse[0].value.result : []
    const chartList = promiseResponse[1].status === 'fulfilled' ? promiseResponse[1].value.result : []

    return { appList, chartList }
}
