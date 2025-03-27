import { showError } from '@devtron-labs/devtron-fe-common-lib'
import { appListOptions } from './AppSelectorUtil'
import { RecentlyVisitedGroupedOptionsType } from './types'

export const fetchAllAppListGroupedOptions = async (
    inputValue,
    isJobView,
    signal,
): Promise<RecentlyVisitedGroupedOptionsType[]> => {
    try {
        const response = await appListOptions(inputValue, isJobView, signal)
        return [{ label: 'All Applications', options: response }]
    } catch (error) {
        showError(error)
        return [{ label: 'All Applications', options: [] }]
    }
}
