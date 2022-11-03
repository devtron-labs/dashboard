import { Routes } from '../../../config'
import { get } from '../../../services/api'
import { WebhookDetailsResponse, WebhookDetailsType, WebhookListResponse } from './types'

export function getExternalCIList(
    appId: number | string
): Promise<WebhookListResponse> {
    return get(`${Routes.EXTERNAL_CI_CONFIG}/${appId}`)
}

export function getExternalCIConfig(
    appId: number | string,
    webhookID: number | string,
): Promise<WebhookDetailsResponse> {
    return get(`${Routes.EXTERNAL_CI_CONFIG}/${appId}/${webhookID}`)
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
    return fetch(webhookUrl, options).then((response) => {
        return response.json()
    })
}
