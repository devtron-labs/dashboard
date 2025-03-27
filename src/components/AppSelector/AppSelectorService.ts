import { showError } from '@devtron-labs/devtron-fe-common-lib'
import { appListOptions } from './AppSelectorUtil'
import { RecentlyVisitedOptionsType } from './types'

export const fetchAllAppListGroupedOptions = async (
    inputValue,
    isJobView,
    signal,
): Promise<RecentlyVisitedOptionsType[]> => {
    try {
        const response = await appListOptions(inputValue, isJobView, signal)
        return [{ label: 'All Applications', options: response }]
    } catch (error) {
        showError(error)
        return [{ label: 'All Applications', options: [] }]
    }
}
