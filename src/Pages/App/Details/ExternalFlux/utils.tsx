import { EXTERNAL_FLUX_APP_STATUS } from './types'

// In case of FluxCD Apps True means app is Ready and False denotes app is not ready
export const getAppStatus = (appStatus: string): string => {
    if (appStatus === 'True') {
        return EXTERNAL_FLUX_APP_STATUS.READY
    }
    if (appStatus === 'False') {
        return EXTERNAL_FLUX_APP_STATUS.NOT_READY
    }
    return appStatus
}
