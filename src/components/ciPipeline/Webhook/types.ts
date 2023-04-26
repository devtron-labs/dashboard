import { ResponseType } from '@devtron-labs/devtron-fe-common-lib'
import { TokenListType } from '../../apiTokens/authorization.type'

export interface WebhookDetailType {
    close: () => void
}

export interface TabDetailsType {
    key: string
    value: string
}

export interface TokenListOptionsType extends TokenListType {
    label: string
    value: string
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
