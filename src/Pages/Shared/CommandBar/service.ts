import { getClusterOptions } from '@devtron-labs/devtron-fe-common-lib'

import { getDevtronInstalledHelmApps } from '@Components/app/list-new/AppListService'
import { getAppListMin, getAvailableCharts } from '@Services/service'

import { CommandBarResourceListType } from './types'

export const getCommandBarResourceLists = async (): Promise<CommandBarResourceListType> => {
    const promiseResponse = await Promise.allSettled([
        getAppListMin(),
        getAvailableCharts(),
        getClusterOptions(),
        getDevtronInstalledHelmApps(null, null),
    ])

    const appList = promiseResponse[0].status === 'fulfilled' ? promiseResponse[0].value.result : []
    const chartList = promiseResponse[1].status === 'fulfilled' ? promiseResponse[1].value.result : []
    const clusterList = promiseResponse[2].status === 'fulfilled' ? promiseResponse[2].value : []
    const helmAppList = promiseResponse[3].status === 'fulfilled' ? promiseResponse[3].value.result?.helmApps ?? [] : []

    return { appList, chartList, clusterList: (clusterList || []).filter((cluster) => !cluster.isVirtual), helmAppList }
}
