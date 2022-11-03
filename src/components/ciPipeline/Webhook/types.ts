import { ResponseType } from '../../../services/service.types'
import { TokenListType } from '../../apiTokens/authorization.type'

export interface WebhookDetailType {
    getWorkflows: () => void
    close: () => void
    deleteWorkflow: (appId?: string, workflowId?: number) => any
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
    keyObject: string[]
    label: string
    optional: boolean
    isSelected: boolean
}

export interface SchemaType {
    child: Record<string, SchemaType> | null
    dataType: string
    description: string
    example: string
    optional: boolean
}

interface APIResponseType {
    code: string
    description: string
    json: Object
    schema: Record<string, SchemaType>
}
export interface WebhookDetailsType {
    accessKey: string
    appId: number
    appName: string
    environmentId: number
    environmentName?: string
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
