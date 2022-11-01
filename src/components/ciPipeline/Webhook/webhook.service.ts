import { Routes } from '../../../config'
import { get } from '../../../services/api'
import { CdPipeline } from '../../app/details/triggerView/types'

export function getExternalCIConfig(appId: number | string, webhookID?: number | string): Promise<CdPipeline[]> {
    return get(`${Routes.EXTERNAL_CI_CONFIG}/${appId}${webhookID ? `/${webhookID}` : ''}`).then(
        (response) => response.result,
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
    return fetch(webhookUrl, options).then((response) => {
        return response.json()
    })
}
