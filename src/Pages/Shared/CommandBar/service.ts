import { getClusterOptions } from '@devtron-labs/devtron-fe-common-lib'

import { getAppListMin, getAvailableCharts } from '@Services/service'

import { CommandBarResourceListType } from './types'

export const getCommandBarResourceLists = async (): Promise<CommandBarResourceListType> => {
    const promiseResponse = await Promise.allSettled([getAppListMin(), getAvailableCharts(), getClusterOptions()])

    const appList = promiseResponse[0].status === 'fulfilled' ? promiseResponse[0].value.result : []
    const chartList = promiseResponse[1].status === 'fulfilled' ? promiseResponse[1].value.result : []
    const clusterList = promiseResponse[2].status === 'fulfilled' ? promiseResponse[2].value : []

    return { appList, chartList, clusterList: (clusterList || []).filter((cluster) => !cluster.isVirtual) }
}
