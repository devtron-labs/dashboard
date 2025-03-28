import moment from 'moment'
import {
    CENTRAL_API_LOCAL_STORAGE_KEY,
    CentralAPILocalConfig,
    DATE_TIME_FORMATS,
    getCentralAPIHealthObjectFromLocalStorage,
} from '@devtron-labs/devtron-fe-common-lib'
import { InstallationType } from '@Components/v2/devtronStackManager/DevtronStackManager.type'
import { Routes } from '@Config/constants'

const setCentralAPIHealthInLocalStorage = (health: boolean, existingHealthObj: CentralAPILocalConfig) => {
    const updatedObject: CentralAPILocalConfig = {
        lastUpdatedDate: moment().format(DATE_TIME_FORMATS['DD/MM/YYYY']),
        isConnected: health || existingHealthObj.isConnected,
        updateCount: existingHealthObj.updateCount + 1,
    }
    localStorage.setItem(CENTRAL_API_LOCAL_STORAGE_KEY, JSON.stringify(updatedObject))
}

export const getCentralAPIHealth = async (): Promise<void> => {
    const existingHealthObj = getCentralAPIHealthObjectFromLocalStorage()
    const { lastUpdatedDate, updateCount } = existingHealthObj

    const currDate = moment().format(DATE_TIME_FORMATS['DD/MM/YYYY'])

    if (currDate === lastUpdatedDate || updateCount >= 3) {
        return
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), window._env_.GLOBAL_API_TIMEOUT)

    try {
        const url = `${window?._env_?.CENTRAL_API_ENDPOINT}/${Routes.HEALTH}`
        const response = await fetch(url, {
            signal: controller.signal,
        })

        clearTimeout(timeoutId)

        setCentralAPIHealthInLocalStorage(response.ok, existingHealthObj)
    } catch {
        clearTimeout(timeoutId)
        setCentralAPIHealthInLocalStorage(false, existingHealthObj)
    }
}

export const getShowStackManager = (installationType: InstallationType, showLicenseData: boolean) =>
    installationType === InstallationType.ENTERPRISE ? showLicenseData : true
