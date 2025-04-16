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

import { useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'

import {
    DeleteConfirmationModal,
    ERROR_STATUS_CODE,
    Progressing,
    showError,
    useSearchString,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as SESEmpty } from '@Images/ses-empty.svg'
import { ReactComponent as EmptySlack } from '@Images/slack-empty.svg'
import { ReactComponent as SMTPEmpty } from '@Images/smtp-empty.svg'
import { ReactComponent as WebhookEmpty } from '@Images/webhook-empty.svg'

import { DC_CONFIGURATION_CONFIRMATION_MESSAGE } from '../../config/constantMessaging'
import { ConfigurationTables } from './ConfigurationTables'
import { ConfigurationTabSwitcher } from './ConfigurationTabsSwitcher'
import { ConfigurationFieldKeys, ConfigurationsTabTypes, ConfigurationTabText } from './constants'
import { EmptyConfigurationView } from './EmptyConfigurationView'
import { deleteNotification, getConfigs } from './notifications.service'
import SESConfigModal from './SESConfigModal'
import { SlackConfigModal } from './SlackConfigModal'
import { SMTPConfigModal } from './SMTPConfigModal'
import { ConfigurationTabState } from './types'
import { WebhookConfigModal } from './WebhookConfigModal'

export const ConfigurationTab = () => {
    const history = useHistory()
    const location = useLocation()
    const { searchParams } = useSearchString()
    const queryString = new URLSearchParams(location.search)
    const modal = (queryString.get('modal') as ConfigurationsTabTypes) ?? ConfigurationsTabTypes.SES

    const [state, setState] = useState<ConfigurationTabState>({
        sesConfigurationList: [],
        smtpConfigurationList: [],
        slackConfigurationList: [],
        webhookConfigurationList: [],
        abortAPI: false,
        confirmation: false,
        sesConfig: {},
        smtpConfig: {},
        slackConfig: {},
        webhookConfig: {},
        activeTab: ConfigurationsTabTypes.SES,
        isLoading: false,
    })

    const getAllChannelConfigs = async () => {
        setState({ ...state, isLoading: true })
        try {
            const { result } = await getConfigs()
            setState({
                ...state,
                slackConfigurationList: result.slackConfigurationList,
                sesConfigurationList: result.sesConfigurationList,
                smtpConfigurationList: result.smtpConfigurationList,
                webhookConfigurationList: result.webhookConfigurationList,
                isLoading: false,
                confirmation: false,
            })
        } catch (error) {
            showError(error, true, true)
            setState({ ...state, isLoading: false })
        }
    }

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        getAllChannelConfigs()

        const newParams = {
            ...searchParams,
            modal: modal ?? ConfigurationsTabTypes.SES,
        }

        history.push({
            search: new URLSearchParams(newParams).toString(),
        })
    }, [])

    const hideDeleteModal = () => {
        setState({
            ...state,
            confirmation: false,
        })
    }

    const deleteConfigPayload = (): any => {
        const { activeTab, slackConfig, sesConfig, webhookConfig, smtpConfig } = state
        if (activeTab === ConfigurationsTabTypes.SLACK) {
            return slackConfig
        }
        if (activeTab === ConfigurationsTabTypes.SES) {
            return sesConfig
        }
        if (activeTab === ConfigurationsTabTypes.WEBHOOK) {
            return webhookConfig
        }
        return smtpConfig
    }

    const deletePayload = deleteConfigPayload()

    if (state.isLoading) {
        return (
            <div className="h-100">
                <Progressing pageLoader />
            </div>
        )
    }

    const renderEmptyState = () => {
        switch (modal) {
            case ConfigurationsTabTypes.SMTP:
                return <EmptyConfigurationView activeTab={ConfigurationsTabTypes.SMTP} image={SMTPEmpty} />
            case ConfigurationsTabTypes.SLACK:
                return <EmptyConfigurationView activeTab={ConfigurationsTabTypes.SLACK} image={EmptySlack} />
            case ConfigurationsTabTypes.WEBHOOK:
                return <EmptyConfigurationView activeTab={ConfigurationsTabTypes.WEBHOOK} image={WebhookEmpty} />
            case ConfigurationsTabTypes.SES:
            default:
                return <EmptyConfigurationView activeTab={ConfigurationsTabTypes.SES} image={SESEmpty} />
        }
    }

    const onClickDelete = async () => {
        await deleteNotification(deletePayload)
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        getAllChannelConfigs()
    }

    const renderTableComponent = () => <ConfigurationTables activeTab={modal} state={state} setState={setState} />

    const renderModal = () => {
        if (queryString.get(ConfigurationFieldKeys.CONFIG_ID) === null) return null
        const configId = parseInt(queryString.get(ConfigurationFieldKeys.CONFIG_ID), 10)

        switch (modal) {
            case ConfigurationsTabTypes.SES:
                return (
                    <SESConfigModal
                        sesConfigId={configId}
                        shouldBeDefault={
                            state.sesConfigurationList.length === 0 ||
                            (state.sesConfigurationList.length === 1 &&
                                state.sesConfigurationList[0].isDefault &&
                                !!configId)
                        }
                        onSaveSuccess={getAllChannelConfigs}
                    />
                )
            case ConfigurationsTabTypes.SMTP:
                return (
                    <SMTPConfigModal
                        smtpConfigId={configId}
                        shouldBeDefault={
                            state.smtpConfigurationList.length === 0 ||
                            (state.smtpConfigurationList.length === 1 &&
                                state.smtpConfigurationList[0].isDefault &&
                                !!configId)
                        }
                        onSaveSuccess={getAllChannelConfigs}
                    />
                )
            case ConfigurationsTabTypes.SLACK:
                return <SlackConfigModal slackConfigId={configId} onSaveSuccess={getAllChannelConfigs} />
            case ConfigurationsTabTypes.WEBHOOK:
                return <WebhookConfigModal webhookConfigId={configId} onSaveSuccess={getAllChannelConfigs} />
            default:
                return null
        }
    }

    const renderDeleteModal = () => (
        <DeleteConfirmationModal
            title={deletePayload.configName}
            component={ConfigurationTabText[state.activeTab.toUpperCase()]}
            onDelete={onClickDelete}
            closeConfirmationModal={hideDeleteModal}
            renderCannotDeleteConfirmationSubTitle={DC_CONFIGURATION_CONFIRMATION_MESSAGE}
            errorCodeToShowCannotDeleteDialog={ERROR_STATUS_CODE.INTERNAL_SERVER_ERROR}
            disabled={state.isLoading}
            isDeleting={state.isLoading}
        />
    )

    const isEmptyView = !state[`${modal.toLowerCase()}ConfigurationList`].length

    return (
        <div className="configuration-tab__container bg__primary h-100 flexbox-col dc__gap-16 dc__overflow-auto">
            <ConfigurationTabSwitcher isEmptyView={isEmptyView} />
            {isEmptyView ? renderEmptyState() : renderTableComponent()}
            {renderModal()}
            {state.confirmation && renderDeleteModal()}
        </div>
    )
}
