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
import { validateEmail } from '../common'
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
import { ConfigurationsTabTypes, ConfigurationTabText } from './constants'

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
    option: (base, state) => {
        return {
            ...base,
            color: 'var(--N900)',
            display: `flex`,
            alignItems: `center`,
            fontSize: '12px',
            padding: '8px 24px',
        }
    },
    multiValue: (base, state) => {
        return {
            ...base,
            border:
                state.data.data.dest !== 'slack' &&
                state.data.data.dest !== 'webhook' &&
                !validateEmail(state.data.label)
                    ? `1px solid var(--R500)`
                    : `1px solid var(--N200)`,
            borderRadius: `4px`,
            background:
                state.data.data.dest !== 'slack' &&
                state.data.data.dest !== 'webhook' &&
                !validateEmail(state.data.label)
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
        }
    },
    multiValueLabel: (base, state) => {
        return {
            ...base,
            display: `flex`,
            alignItems: `center`,
            fontSize: '12px',
            padding: '0px',
        }
    },
}

export const DropdownIndicator = (props) => {
    return (
        <components.DropdownIndicator {...props}>
            <ArrowDown className="icon-dim-20 icon-n5" />
        </components.DropdownIndicator>
    )
}

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

export const getConfigTabIcons = (tab: ConfigurationsTabTypes, size: number = 20 ) => {
    switch (tab) {
        case ConfigurationsTabTypes.SES:
            return <SES className={`icon-dim-${size}`}/>
        case ConfigurationsTabTypes.SMTP:
            return <SMTP />
        case ConfigurationsTabTypes.SLACK:
            return <Slack />
        case ConfigurationsTabTypes.WEBHOOK:
            return <Webhook />
        default:
            return SES
    }
}

export const getConfigurationTabTextWithIcon = () => [
    {
        label: ConfigurationTabText.SES,
        icon: getConfigTabIcons(ConfigurationsTabTypes.SES),
        link: ConfigurationsTabTypes.SES,
    },
    {
        label: ConfigurationTabText.SMTP,
        icon: getConfigTabIcons(ConfigurationsTabTypes.SMTP),
        link: ConfigurationsTabTypes.SMTP,
    },
    {
        label: ConfigurationTabText.SLACK,
        icon: getConfigTabIcons(ConfigurationsTabTypes.SLACK),
        link: ConfigurationsTabTypes.SLACK,
    },
    {
        label: ConfigurationTabText.WEBHOOK,
        icon: getConfigTabIcons(ConfigurationsTabTypes.WEBHOOK),
        link: ConfigurationsTabTypes.WEBHOOK,
    },
]

export const getSESDefaultConfiguration = (shouldBeDefault: boolean) => ({
    configName: '',
    accessKey: '',
    secretKey: '',
    region: { label: '', value: '' },
    fromEmail: '',
    default: shouldBeDefault,
    isLoading: false,
    isError: true,
})