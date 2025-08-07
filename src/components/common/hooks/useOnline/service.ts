/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Routes } from '@Config/constants'

import { INTERNET_CONNECTIVITY_INTERVAL } from '../constants'
import { CheckConnectivityParamsType, FetchConnectivityParamsType } from './types'

const fetchWithTimeout = ({ url, options, controller }: FetchConnectivityParamsType): Promise<any> => {
    const timeoutId = setTimeout(() => controller.abort(), INTERNET_CONNECTIVITY_INTERVAL)

    return fetch(url, { ...options, signal: controller.signal }).finally(() => {
        clearTimeout(timeoutId)
    })
}

export const getFallbackInternetConnectivity = ({ controller }: CheckConnectivityParamsType): Promise<any> =>
    fetchWithTimeout({
        url: 'https://www.google.com/favicon.ico',
        options: {
            method: 'HEAD',
            mode: 'no-cors',
        },
        controller,
    })

export const getInternetConnectivity = ({ controller }: CheckConnectivityParamsType): Promise<any> => {
    const baseUrl = window._env_?.CENTRAL_API_ENDPOINT ?? 'https://api.devtron.ai'
    const url = `${baseUrl}/${Routes.HEALTH}`

    return fetchWithTimeout({ url, options: {}, controller })
}
