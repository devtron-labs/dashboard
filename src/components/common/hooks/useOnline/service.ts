import { Routes } from '@Config/constants'

import { INTERNET_CONNECTIVITY_INTERVAL } from '../constants'
import { CheckConnectivityParamsType, FetchConnectivityParamsType } from './types'

const fetchWithTimeout = ({
    url,
    options,
    controller,
    setTimeoutRef,
    checkConnectivity,
}: FetchConnectivityParamsType): Promise<any> => {
    const timeoutId = setTimeout(() => controller.abort(), INTERNET_CONNECTIVITY_INTERVAL)

    return fetch(url, { ...options, signal: controller.signal }).finally(() => {
        clearTimeout(timeoutId)
        const nextRef = setTimeout(checkConnectivity, INTERNET_CONNECTIVITY_INTERVAL)
        setTimeoutRef(nextRef)
    })
}

export const getFallbackInternetConnectivity = ({
    controller,
    setTimeoutRef,
    checkConnectivity,
}: CheckConnectivityParamsType): Promise<any> =>
    fetchWithTimeout({
        url: 'https://www.google.com/favicon.ico',
        options: {
            method: 'HEAD',
            mode: 'no-cors',
        },
        controller,
        setTimeoutRef,
        checkConnectivity,
    })

export const getInternetConnectivity = ({
    controller,
    setTimeoutRef,
    checkConnectivity,
}: CheckConnectivityParamsType): Promise<any> => {
    const baseUrl = window._env_?.CENTRAL_API_ENDPOINT ?? 'https://api.devtron.ai'
    const url = `${baseUrl}/${Routes.HEALTH}`

    return fetchWithTimeout({ url, options: {}, controller, setTimeoutRef, checkConnectivity }).then((res) =>
        res.json(),
    )
}
