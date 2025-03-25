import moment from 'moment'
import {
    CENTRAL_API_CONNECTIVITY_KEY,
    CentralAPILocalConfig,
    FALLBACK_REQUEST_TIMEOUT,
    getCentralAPIHealthObjectFromLocalStorage,
} from '@devtron-labs/devtron-fe-common-lib'

const setCentralAPIHealthInLocalStorage = (health: boolean, existingHealthObj: CentralAPILocalConfig) => {
    const updatedObject: CentralAPILocalConfig = {
        lastUpdatedDate: moment().format('YYYY-MM-DD'),
        isConnected: health || existingHealthObj.isConnected,
        updateCount: existingHealthObj.updateCount + 1,
    }
    localStorage.setItem(CENTRAL_API_CONNECTIVITY_KEY, JSON.stringify(updatedObject))
}

export const getCentralAPIHealth = async (): Promise<void> => {
    const existingHealthObj = getCentralAPIHealthObjectFromLocalStorage()
    const { lastUpdatedDate, updateCount } = existingHealthObj

    const currDate = moment().format('YYYY-MM-DD')

    if (currDate === lastUpdatedDate || updateCount >= 3) {
        return
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), window._env_.GLOBAL_API_TIMEOUT || FALLBACK_REQUEST_TIMEOUT)

    try {
        const response = await fetch(window?._env_?.CENTRAL_API_ENDPOINT || 'https://api.devtron.ai', {
            signal: controller.signal,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
            setCentralAPIHealthInLocalStorage(false, existingHealthObj)
        }

        setCentralAPIHealthInLocalStorage(true, existingHealthObj)
    } catch {
        clearTimeout(timeoutId)
        setCentralAPIHealthInLocalStorage(false, existingHealthObj)
    }
}
