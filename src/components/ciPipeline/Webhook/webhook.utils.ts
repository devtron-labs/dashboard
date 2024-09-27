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

import { TabDetailsType, TokenListOptionsType } from './types'

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

export const SELECT_TOKEN_STYLE = {
    control: (base, state) => ({
        ...base,
        border: '1px solid var(--N200)',
        boxShadow: 'none',
        minHeight: 'auto',
        height: '32px',
        fontSize: '13px',
    }),
    option: (base, state) => ({
        ...base,
        color: 'var(--N900)',
        fontSize: '13px',
        padding: '5px 10px',
    }),
    dropdownIndicator: (styles) => ({ ...styles, padding: 0 }),
    valueContainer: (base, state) => ({
        ...base,
        color: 'var(--N900)',
        background: 'var(--N50) !important',
        padding: '0px 10px',
        display: 'flex',
        height: '30px',
        fontSize: '13px',
        pointerEvents: 'all',
        whiteSpace: 'nowrap',
        borderRadius: '4px',
    }),
    indicatorsContainer: (base, state) => ({
        ...base,
        background: 'var(--N50) !important',
    }),
}

export const getWebhookTokenListOptions = (tokenList: TokenListOptionsType[]) => {
    return tokenList.map((token) => {
        return {
            ...token,
            label: token.label,
            value: token.value,
            description: 'Has access',
        }
    })
}