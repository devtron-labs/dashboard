import { Routes } from '../../../config'
import { get, ResponseType } from '@devtron-labs/devtron-fe-common-lib'
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
    let options = {
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
