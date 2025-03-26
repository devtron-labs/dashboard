import { showError } from '@devtron-labs/devtron-fe-common-lib'
import { appListOptions } from './AppSelectorUtil'

export const fetchAllAppListGroupedOptions = async (inputValue, isJobView, signal) => {
    try {
        const response = await appListOptions(inputValue, isJobView, signal)
        return [{ label: 'All Applications', options: response }]
    } catch (error) {
        showError(error)
        return [{ label: 'All Applications', options: [] }]
    }
}
