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

import { AppConfigProps, ResponseType } from '@devtron-labs/devtron-fe-common-lib'

import { TokenListType } from '../../../Pages/GlobalConfigurations/Authorization/APITokens/apiToken.type'

export interface WebhookDetailType extends Required<Pick<AppConfigProps, 'isTemplateView'>> {
    close: () => void
}

export interface TabDetailsType {
    key: string
    value: string
}

export interface TokenListOptionsType extends TokenListType {
    label: string
    value: string
    description: string
}

export interface TokenPermissionType {
    projectName: string
    environmentName: string
    appName: string
    role: string
}

interface PayloadOptionType {
    key: string
    payloadKey: string[]
    label: string
    mandatory: boolean
    isSelected: boolean
}

export interface SchemaType {
    child: Record<string, SchemaType> | null
    dataType: string
    description: string
    example: string
    optional: boolean
    createLink?: boolean
}

interface APIResponseDescriptionType {
    description: string
    exampleValue: Object
    schema: Record<string, SchemaType>
}

interface APIResponseType {
    code: string
    description: APIResponseDescriptionType
    selectedTab?: string
}
export interface WebhookDetailsType {
    accessKey: string
    appId: number
    appName: string
    environmentId: number
    environmentName?: string
    environmentIdentifier?: string
    id: number
    payload: string
    payloadOption: PayloadOptionType[]
    projectId: number
    projectName: string
    responses: APIResponseType[]
    role: string
    schema: Record<string, SchemaType>
    webhookUrl: string
}

export interface WebhookDetailsResponse extends ResponseType {
    result?: WebhookDetailsType
}

export interface WebhookListResponse extends ResponseType {
    result?: WebhookDetailsType[]
}
