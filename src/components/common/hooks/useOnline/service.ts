import { Routes } from '@Config/constants'

const DEFAULT_TIMEOUT = 10000

const fetchWithTimeout = (url: string, options: RequestInit, controller: AbortController): Promise<any> => {
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT)

    return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timeoutId))
}

export const getFallbackInternetConnectivity = (controller: AbortController): Promise<any> =>
    fetchWithTimeout(
        'https://www.google.com/favicon.ico',
        {
            method: 'HEAD',
            mode: 'no-cors',
        },
        controller,
    )

export const getInternetConnectivity = (controller: AbortController): Promise<any> => {
    const baseUrl = window._env_?.CENTRAL_API_ENDPOINT ?? 'https://api.devtron.ai'
    const url = `${baseUrl}/${Routes.HEALTH}`

    return fetchWithTimeout(url, {}, controller).then((res) => res.json())
}
