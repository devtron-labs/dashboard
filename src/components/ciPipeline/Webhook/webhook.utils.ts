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

import { SelectPickerOptionType } from '.yalc/@devtron-labs/devtron-fe-common-lib/dist'
import { TabDetailsType, TokenListOptionsType } from './types'
import { TokenListType } from '@Pages/GlobalConfigurations/Authorization/APITokens/apiToken.type'

export const TOKEN_TAB_LIST: TabDetailsType[] = [
    { key: 'selectToken', value: 'Select API token' },
    { key: 'autoToken', value: 'Auto-generate token' },
]

export const PLAYGROUND_TAB_LIST: TabDetailsType[] = [
    { key: 'webhookURL', value: 'Webhook URL' },
    { key: 'sampleCurl', value: 'Sample cURL request' },
    { key: 'try', value: 'Try it out' },
]
export const REQUEST_BODY_TAB_LIST: TabDetailsType[] = [
    { key: 'json', value: 'JSON' },
    { key: 'schema', value: 'Schema' },
]
export const RESPONSE_TAB_LIST: TabDetailsType[] = [
    { key: 'example', value: 'Example value' },
    { key: 'schema', value: 'Schema' },
]

export const CURL_PREFIX = `curl --location --request POST \\
'{webhookURL}' \\
--header 'Content-Type: application/json' \\
--header 'api-token: {token}' \\
--data-raw '{data}'`

export const GENERATE_TOKEN_WITH_REQUIRED_PERMISSIONS = 'Generate token with required permissions'
export const SELECT_AUTO_GENERATE_TOKEN_WITH_REQUIRED_PERMISSIONS =
    'Select or auto-generate token with required permissions'

export const getWebhookTokenListOptions = (tokenList: TokenListType[]): TokenListOptionsType[] => {
    return tokenList.map((token) => {
        return {
            ...token,
            label: token.name,
            value: token.id.toString(),
            description: 'Has access',
        }
    })
}
