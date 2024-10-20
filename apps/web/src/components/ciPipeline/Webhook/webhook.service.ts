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

import { get, ResponseType } from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '../../../config'
import { WebhookDetailsResponse, WebhookDetailsType, WebhookListResponse } from './types'

export function getExternalCIList(appId: number | string): Promise<WebhookListResponse> {
    return get(`${Routes.EXTERNAL_CI_CONFIG}/${appId}`)
}

export function getExternalCIConfig(
    appId: number | string,
    webhookID: number | string,
): Promise<WebhookDetailsResponse> {
    return get(`${Routes.EXTERNAL_CI_CONFIG}/${appId}/${webhookID}`)
}

export function getWebhookAPITokenList(
    projectName: string,
    environmentName: string,
    appName: string,
): Promise<ResponseType> {
    return get(
        `${Routes.API_TOKEN_WEBHOOK}?projectName=${projectName}&environmentName=${environmentName}&appName=${appName}`,
    )
}

export async function executeWebhookAPI(webhookUrl: string, token: string, data?: object): Promise<any> {
    const options = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Credentials': 'true',
            'api-token': token,
        },
        body: data ? JSON.stringify(data) : undefined,
    }
    options['credentials'] = 'include' as RequestCredentials
    let responseHeaderString = ''
    return fetch(webhookUrl, options)
        .then((response) => {
            for (const header of response.headers) {
                responseHeaderString = `${responseHeaderString}${header[0]} : ${header[1]}
`
            }
            return response.json()
        })
        .then(function (data) {
            return {
                code: data['code'],
                result: data['status'],
                headers: responseHeaderString,
                bodyText: JSON.stringify(data, null, 4),
            }
        })
}
