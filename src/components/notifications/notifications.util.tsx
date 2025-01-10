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

import { components } from 'react-select'
import { ReactComponent as ArrowDown } from '@Icons/ic-chevron-down.svg'
import { ReactComponent as Email } from '@Icons/ic-mail.svg'
import { ReactComponent as RedWarning } from '@Icons/ic-error-medium.svg'
import { ReactComponent as CI } from '@Icons/ic-CI.svg'
import { ReactComponent as CD } from '@Icons/ic-CD.svg'
import { ReactComponent as Rocket } from '@Icons/ic-paper-rocket.svg'
import { ReactComponent as Slack } from '@Icons/slack-logo.svg'
import { ReactComponent as SES } from '@Icons/ic-aws-ses.svg'
import { ReactComponent as Webhook } from '@Icons/ic-CIWebhook.svg'
import { ReactComponent as SMTP } from '@Icons/ic-smtp.svg'
import {
    DynamicDataTableHeaderType,
    DynamicDataTableRowDataType,
    DynamicDataTableRowType,
    getUniqueId,
    stringComparatorBySortOrder,
    ToastManager,
    ToastVariantType,
    Tooltip,
} from '@devtron-labs/devtron-fe-common-lib'
import { ConfigurationFieldKeys, ConfigurationsTabTypes, ConfigurationTabText } from './constants'
import { validateEmail } from '../common'
import { FormError, FormValidation, SESFormType, SMTPFormType, WebhookDataRowType, WebhookHeaderKeyType } from './types'
import { REQUIRED_FIELD_MSG } from '@Config/constantMessaging'

export const multiSelectStyles = {
    control: (base, state) => ({
        ...base,
        border: state.isFocused ? '1px solid #06c' : '1px solid #d6dbdf',
        boxShadow: 'none',
        height: '100%',
    }),
    menu: (base, state) => ({
        ...base,
        top: `38px`,
    }),
    option: (base, state) => ({
        ...base,
        color: 'var(--N900)',
        display: `flex`,
        alignItems: `center`,
        fontSize: '12px',
        padding: '8px 24px',
    }),
    multiValue: (base, state) => ({
        ...base,
        border:
            state.data.data.dest !== 'slack' && state.data.data.dest !== 'webhook' && !validateEmail(state.data.label)
                ? `1px solid var(--R500)`
                : `1px solid var(--N200)`,
        borderRadius: `4px`,
        background:
            state.data.data.dest !== 'slack' && state.data.data.dest !== 'webhook' && !validateEmail(state.data.label)
                ? 'var(--R100)'
                : 'var(--N000)',
        padding: `2px`,
        textTransform: `lowercase`,
        fontSize: `12px`,
        lineHeight: `1.5`,
        letterSpacing: `normal`,
        color: `var(--N900)`,
        userSelect: `none`,
        display: `inline-flex`,
    }),
    multiValueLabel: (base, state) => ({
        ...base,
        display: `flex`,
        alignItems: `center`,
        fontSize: '12px',
        padding: '0px',
    }),
}

export const DropdownIndicator = (props) => (
    <components.DropdownIndicator {...props}>
        <ArrowDown className="icon-dim-20 icon-n5" />
    </components.DropdownIndicator>
)

export const MultiValueLabel = (props) => {
    const item = props.data
    return (
        <components.MultiValueLabel {...props} validator={validateEmail}>
            {item.data.dest === '' && !validateEmail(props.children) ? (
                <RedWarning className="icon-dim-20 mr-5 scr-5" />
            ) : null}
            {item.data.dest === '' && validateEmail(props.children) ? <Email className="icon-dim-20 mr-5" /> : null}
            {item.data.dest === 'ses' || item.data.dest === 'email' ? <Email className="icon-dim-20 mr-5" /> : null}
            {item.data.dest === 'slack' ? <Slack className="icon-dim-20 mr-5" /> : null}
            {item.data.dest === 'webhook' ? <Webhook className="icon-dim-20 mr-5" /> : null}
            {props.children}
        </components.MultiValueLabel>
    )
}

export const MultiValueContainer = ({ validator, ...props }) => {
    const { children, data, innerProps, selectProps } = props
    const { label } = data
    const isValidEmail = validator ? validator(data.data.recipient) : true

    if (data.data.dest === '' || data.data.dest === 'ses' || data.data.dest === 'email') {
        return (
            <components.MultiValueContainer {...{ data, innerProps, selectProps }}>
                <div className="flex fs-12 ml-4">
                    {!isValidEmail ? <RedWarning className="mr-4" /> : <Email className="icon-dim-20 mr-5" />}
                    <div className={`${isValidEmail ? 'cn-9' : 'cr-5'}`}>{label}</div>
                </div>
                {children[1]}
            </components.MultiValueContainer>
        )
    }

    return (
        <components.MultiValueContainer {...{ data, innerProps, selectProps }}>
            <div className="flex fs-12 ml-4">
                {data.data.dest === 'slack' && <Slack className="icon-dim-20 mr-5" />}
                {data.data.dest === 'webhook' && <Webhook className="icon-dim-20 mr-5" />}
                <div className="cn-9">{label}</div>
            </div>
            {children[1]}
        </components.MultiValueContainer>
    )
}

export const Option = (props) => {
    const item = props.data
    if (item && item?.__isNew__) {
        return <components.Option {...props}>{props.children}</components.Option>
    }
    return (
        <components.Option {...props}>
            {item.data.dest === 'ses' || item.data.dest === 'email' ? <Email className="icon-dim-20 mr-5" /> : null}
            {item.data.dest === 'slack' && <Slack className="icon-dim-20 mr-5" />}
            {item.data.dest === 'webhook' && <Webhook className="icon-dim-20 mr-5" />}
            {props.children}
        </components.Option>
    )
}

export const renderPipelineTypeIcon = (row) => {
    if (row.isVirtualEnvironment) {
        return <Rocket className="icon-dim-24" />
    }
    if (row.pipelineType === 'CI' || row.type === 'CI') {
        return <CI className="icon-dim-20 dc__flip" />
    }
    return <CD className="icon-dim-20 dc__flip" />
}

export const getConfigTabIcons = (tab: ConfigurationsTabTypes, size: number = 24) => {
    switch (tab) {
        case ConfigurationsTabTypes.SMTP:
            return <SMTP className={`icon-dim-${size}`} />
        case ConfigurationsTabTypes.SLACK:
            return <Slack className={`icon-dim-${size}`} />
        case ConfigurationsTabTypes.WEBHOOK:
            return <Webhook className={`icon-dim-${size}`} />
        case ConfigurationsTabTypes.SES:
        default:
            return <SES className={`icon-dim-${size}`} />
    }
}

export const getConfigurationTabTextWithIcon = () => [
    {
        label: ConfigurationTabText.SES,
        icon: getConfigTabIcons(ConfigurationsTabTypes.SES, 20),
        link: ConfigurationsTabTypes.SES,
    },
    {
        label: ConfigurationTabText.SMTP,
        icon: getConfigTabIcons(ConfigurationsTabTypes.SMTP, 20),
        link: ConfigurationsTabTypes.SMTP,
    },
    {
        label: ConfigurationTabText.SLACK,
        icon: getConfigTabIcons(ConfigurationsTabTypes.SLACK, 20),
        link: ConfigurationsTabTypes.SLACK,
    },
    {
        label: ConfigurationTabText.WEBHOOK,
        icon: getConfigTabIcons(ConfigurationsTabTypes.WEBHOOK, 20),
        link: ConfigurationsTabTypes.WEBHOOK,
    },
]

export const getSESDefaultConfiguration = (shouldBeDefault: boolean): SESFormType => ({
    configName: '',
    accessKey: '',
    secretKey: '',
    region: null,
    fromEmail: '',
    default: shouldBeDefault,
    isLoading: false,
})

export const getSMTPDefaultConfiguration = (shouldBeDefault: boolean): SMTPFormType => ({
    configName: '',
    host: '',
    port: '',
    authUser: '',
    authPassword: '',
    fromEmail: '',
    default: shouldBeDefault,
    isLoading: false,
})

export const renderText = (text: string, isLink: boolean = false, linkTo?: () => void, dataTestId?: string) => (
    <Tooltip content={text} placement="bottom" showOnTruncate={!!text} className="mxh-210 dc__hscroll" interactive>
        {isLink ? (
            <button
                type="button"
                onClick={linkTo}
                className="flex left dc__unset-button-styles lh-20 dc__ellipsis-right fs-13 cb-5 dc__no-decor cursor"
                data-testid={dataTestId}
            >
                {text || '-'}
            </button>
        ) : (
            <p className="lh-20 dc__ellipsis-right m-0 fs-13" data-testid={dataTestId}>
                {text || '-'}
            </p>
        )}
    </Tooltip>
)

export const renderDefaultTag = (isDefault: boolean) => {
    if (isDefault) {
        return <span className="br-4 fs-12 px-6 fw-5 lh-16 cb-7 bcb-1 py-2">Default</span>
    }
    return null
}

export const getTableHeaders = (): DynamicDataTableHeaderType<WebhookHeaderKeyType>[] => [
    { label: 'Header key', key: 'key', width: '300px' },
    { label: 'Value', key: 'value', width: '1fr' },
]

export const getInitialWebhookKeyRow = (headers: {key: string, value: string}): WebhookDataRowType[] => {
    return Object.entries(headers).map(([key, value]) => {
        return {
            data: {
                key: {
                    value: key || null,
                    type: DynamicDataTableRowDataType.TEXT,
                    props: {
                        placeholder: 'Eg. owner-name',
                    },
                },
                value: {
                    value: value || '',
                    type: DynamicDataTableRowDataType.TEXT,
                    props: {
                        placeholder: 'Enter value',
                    },
                },
            },

            id: getUniqueId(),
        }
    })
}

export const getEmptyVariableDataRow = (): WebhookDataRowType => {
    const id = getUniqueId()
    return {
        data: {
            key: {
                value: '',
                type: DynamicDataTableRowDataType.TEXT,
                props: {
                    placeholder: 'Eg. owner-name',
                },
            },
            value: {
                value: '',
                type: DynamicDataTableRowDataType.TEXT,
                props: {
                    placeholder: 'Enter value',
                },
            },
        },
        id,
    }
}

export const validateKeyValueConfig = (key: ConfigurationFieldKeys, value: string): FormError => {
    if (!value) {
        return { isValid: false, message: REQUIRED_FIELD_MSG }
    }
    if (key === ConfigurationFieldKeys.FROM_EMAIL) {
        return { isValid: validateEmail(value), message: validateEmail(value) ? '' : 'Invalid email' }
    }
    return { isValid: true, message: '' }
}

export enum ConfigTableRowActionType {
    ADD_ROW = 'ADD_ROW',
    UPDATE_ROW = 'UPDATE_ROW',
    DELETE_ROW = 'DELETE_ROW',
}

export const getTabText = (tab: ConfigurationsTabTypes) => {
    switch (tab) {
        case ConfigurationsTabTypes.SES:
            return 'SES'
        case ConfigurationsTabTypes.SLACK:
            return 'Slack'
        case ConfigurationsTabTypes.WEBHOOK:
            return 'Webhook'
        case ConfigurationsTabTypes.SMTP:
            return 'SMTP'
        default:
            return ''
    }
}

export const validatePayloadField = (value: string): FormError => {
    let isValid = true
    let errorMessage = ''
    // Validate if the value is a valid JSON string
    if (!value) {
        return { isValid: false, message: REQUIRED_FIELD_MSG }
    }
    try {
        JSON.parse(value)
    } catch {
        isValid = false
        errorMessage = 'Invalid JSON format.'
    }
    return { isValid, message: errorMessage }
}

export const renderErrorToast = () =>
    ToastManager.showToast({
        variant: ToastVariantType.error,
        description: 'Some required fields are missing or Invalid',
    })

export const getAwsRegionListParsed = (awsRegionList) =>
    awsRegionList
        .sort((a, b) => stringComparatorBySortOrder(a.name, b.name))
        .map((region) => ({ label: region.name, value: region.value }))
