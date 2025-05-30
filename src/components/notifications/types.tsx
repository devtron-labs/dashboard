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

import { RouteComponentProps } from 'react-router-dom'

import {
    DynamicDataTableRowType,
    GenericEmptyStateType,
    PaginationProps,
    ResponseType,
    SelectPickerOptionType,
    ServerError,
} from '@devtron-labs/devtron-fe-common-lib'

import { VariableDataTableActionType } from '@Components/CIPipelineN/VariableDataTable/types'
import { HostURLConfig } from '@Services/service.types'

import { ConfigurationFieldKeys, ConfigurationsTabTypes } from './constants'

export interface NotifierProps extends RouteComponentProps<{ id: string }> {}

export interface NotifierState {
    code: number
    errors: ServerError[]
    successMessage: string | null
    channel: string
}

export interface SMTPConfigResponseType extends ResponseType {
    result?: {
        configName: string
        port: number
        host: string
        authUser: string
        authPassword: string
        fromEmail: string
        default: boolean
    }
}

export enum EMAIL_AGENT {
    SES = 'SES',
    SMTP = 'SMTP',
}

export interface SMTPConfigModalProps {
    smtpConfigId: number
    shouldBeDefault: boolean
    selectSMTPFromChild?: (smtpConfigId: number) => void
    onSaveSuccess: () => void
    closeSMTPConfigModal?: () => void
}

// ----------------------------Configuration Tab Types----------------------------

export interface ConfigurationTabState {
    isLoading: boolean
    sesConfigurationList: Array<{ id: number; name: string; accessKeyId: string; email: string; isDefault: boolean }>
    smtpConfigurationList: Array<{
        id: number
        name: string
        port: string
        host: string
        email: string
        isDefault: boolean
    }>
    slackConfigurationList: Array<{ id: number; slackChannel: string; projectId: number; webhookUrl: string }>
    webhookConfigurationList: Array<{ id: number; name: string; webhookUrl: string }>
    abortAPI: boolean
    confirmation: boolean
    sesConfig: any
    smtpConfig: any
    slackConfig: any
    webhookConfig: any
    activeTab?: ConfigurationsTabTypes
}

export interface ConfigurationTableProps {
    state: ConfigurationTabState
    deleteClickHandler: (id: number, name: string) => void
}

export interface ConfigurationTablesTypes {
    activeTab: ConfigurationsTabTypes
    state: ConfigurationTabState
    setState: React.Dispatch<React.SetStateAction<ConfigurationTabState>>
}

export interface FormError {
    isValid: boolean
    message: string
}

export interface ConfigurationTabDrawerModalProps {
    renderContent: () => JSX.Element
    closeModal: () => void
    modal: ConfigurationsTabTypes
    isLoading: boolean
    saveConfigModal: () => void
    disableSave?: boolean
}

export interface DefaultCheckboxProps {
    isDefaultDisable: boolean
    handleCheckbox: () => void
    isDefault: boolean
}

// ----------------------------Configuration Tab----------------------------

export interface EmptyConfigurationViewProps {
    activeTab: ConfigurationsTabTypes
    image?: GenericEmptyStateType['SvgImage']
}

export interface ConfigurationTabSwitcherProps {
    activeTab: ConfigurationsTabTypes
}

export interface ConfigTableRowActionButtonProps {
    onClickEditRow: () => void
    onClickDeleteRow: any
    modal: ConfigurationsTabTypes
}

// ----------------------------SES Config Modal----------------------------

export interface SESConfigModalProps {
    shouldBeDefault: boolean
    selectSESFromChild?: (sesConfigId: number) => void
    onSaveSuccess: () => void
    closeSESConfigModal?: () => void
    sesConfigId: number
}

export interface SESFormType {
    configName: string
    accessKey: string
    secretKey: string
    region: SelectPickerOptionType
    default: boolean
    isLoading: boolean
    fromEmail: string
}

// ----------------------------Slack Config Modal----------------------------

export interface ProjectListTypes {
    id: number
    name: string
    active: boolean
}

export interface SlackConfigModalProps {
    slackConfigId: number
    onSaveSuccess: () => void
    closeSlackConfigModal?: () => void
}

export interface SlackFormType {
    configName: string
    projectId: number
    webhookUrl: string
    isLoading: boolean
    id: number | null
}

// ----------------------------SMTP Config Modal----------------------------
export interface SMTPFormType {
    configName: string
    port: string
    host: string
    authUser: string
    authPassword: string
    fromEmail: string
    default: boolean
    isLoading: boolean
}

// ----------------------------Webhook Config Modal--------------------------------

export interface WebhookAttributesResponseType extends ResponseType {
    result?: Record<string, string>
}

export interface WebhookConfigModalProps {
    webhookConfigId: number
    closeWebhookConfigModal?: () => void
    onSaveSuccess: () => void
}

export type WebhookHeaderKeyType = 'key' | 'value'

export type WebhookDataRowType = DynamicDataTableRowType<WebhookHeaderKeyType>

export interface WebhookHeadersType {
    key: string
    value: string
}

export interface WebhookConfigDynamicDataTableProps {
    rows: WebhookDataRowType[]
    setRows: React.Dispatch<React.SetStateAction<WebhookDataRowType[]>>
}

type VariableDataTableActionPropsMap = {
    [VariableDataTableActionType.UPDATE_ROW]: string
}

export type VariableDataTableAction<
    T extends keyof VariableDataTableActionPropsMap = keyof VariableDataTableActionPropsMap,
> = T extends keyof VariableDataTableActionPropsMap
    ? { actionType: T; actionValue: VariableDataTableActionPropsMap[T] }
    : never

export type HandleRowUpdateActionProps = VariableDataTableAction & {
    headerKey: WebhookHeaderKeyType
    rowId: string | number
}

export type WebhookValidations = {
    [ConfigurationFieldKeys.CONFIG_NAME]: FormError
    [ConfigurationFieldKeys.WEBHOOK_URL]: FormError
    [ConfigurationFieldKeys.PAYLOAD]: FormError
}

export interface WebhookFormTypes {
    configName: string
    webhookUrl: string
    isLoading: boolean
    payload: string
    header: Object
}

export interface AddConfigurationButtonProps {
    activeTab: ConfigurationsTabTypes
}

export interface ConfigurationTabSwitcherType {
    isEmptyView: boolean
}

export interface NotificationConfiguration {
    id: number
    pipelineId?: number
    appName: string
    pipelineName?: string
    pipelineType: 'CI' | 'CD'
    environmentName?: string
    branch?: string
    trigger: boolean
    success: boolean
    failure: boolean
    isSelected: boolean
    providers: { dest: string; configId: number; recipient: string; name?: string }[]
    appliedFilters: {
        project: { id: number; name: string }[]
        application: { id: number; name: string }[]
        environment: { id: number; name: string }[]
        cluster: {
            id: number
            name: string
        }[]
    }
    singleDeletedId: number
    isVirtualEnvironment?: boolean
}

interface NotificationTabCheckboxTypes {
    isChecked: boolean
    value: 'INTERMEDIATE' | 'CHECKED'
}

export interface NotificationTabState {
    view: string
    statusCode: number
    notificationList: NotificationConfiguration[]
    channelList: any[]
    showDeleteDialog: boolean
    showModifyRecipientsModal: boolean
    headerCheckbox: NotificationTabCheckboxTypes
    triggerCheckbox: NotificationTabCheckboxTypes
    successCheckbox: NotificationTabCheckboxTypes
    failureCheckbox: NotificationTabCheckboxTypes
    payloadUpdateEvents: Array<{ id: number; eventTypeIds: number[] }>
    pagination: Pick<PaginationProps, 'offset' | 'size' | 'pageSize'>
    hostURLConfig: HostURLConfig
    deleting: boolean
    confirmation: boolean
    singleDeletedId: number
    disableEdit: boolean
}
