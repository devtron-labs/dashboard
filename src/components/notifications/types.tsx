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
    ServerError,
    ResponseType,
    DynamicDataTableRowType,
    SelectPickerOptionType,
} from '@devtron-labs/devtron-fe-common-lib'
import { VariableDataTableActionType } from '@Components/CIPipelineN/VariableDataTable/types'
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
    showCannotDeleteDialogModal: boolean
}

export interface ConfigurationTableProps {
    state: ConfigurationTabState
    deleteClickHandler: (id: number, name: string) => void
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

export type FormValidation = {
    [key: string]: FormError
}

export interface DefaultCheckboxProps {
    shouldBeDefault: boolean
    handleCheckbox: () => void
    isDefault: boolean
}

// ----------------------------Configuration Tab----------------------------

export interface EmptyConfigurationViewProps {
    configTabType: ConfigurationsTabTypes
    image?: any
}

export interface ConfigurationTabSwitcherProps {
    activeTab: ConfigurationsTabTypes
}

export interface ConfigTableRowActionButtonProps {
    onClickEditRow: () => void
    onClickDeleteRow: any
    rootClassName: string
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

export interface WebhookRowCellType {
    key: string
    value: string
    id?: number
}

export interface WebhookConfigDynamicDataTableProps {
    rows: WebhookDataRowType[]
    setRows: React.Dispatch<React.SetStateAction<WebhookDataRowType[]>>
    headers: WebhookRowCellType[]
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

export interface HeaderType {
    key: string
    value: string
}

export interface WebhookFormTypes {
    configName: string
    webhookUrl: string
    isLoading: boolean
    payload: string
    header: HeaderType[]
}
