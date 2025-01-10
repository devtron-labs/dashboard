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
import {
    showError,
    Progressing,
    useSearchString,
    ConfirmationModal,
    ConfirmationModalVariantType,
    ServerErrors,
} from '@devtron-labs/devtron-fe-common-lib'
import { useHistory, useLocation } from 'react-router-dom'
import { deleteNotification, getConfigs } from './notifications.service'
import { DC_CONFIGURATION_CONFIRMATION_MESSAGE } from '../../config/constantMessaging'
import { ConfigurationTabState } from './types'
import { ConfigurationTabSwitcher } from './ConfigurationTabsSwitcher'
import { ConfigurationFieldKeys, ConfigurationsTabTypes, ConfigurationTabText } from './constants'
import { EmptyConfigurationView } from './EmptyConfigurationView'
import emptySES from '../../assets/img/ses-empty.png'
import emptyWebhook from '../../assets/img/webhook-empty.png'
import emptySmtp from '../../assets/img/smtp-empty.png'
import emptySlack from '../../assets/img/slack-empty.png'
import { ConfigurationTables } from './ConfigurationTables'
import SESConfigModal from './SESConfigModal'
import { SlackConfigModal } from './SlackConfigModal'
import { SMTPConfigModal } from './SMTPConfigModal'
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
        showCannotDeleteDialogModal: false,
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
                return <EmptyConfigurationView activeTab={ConfigurationsTabTypes.SMTP} image={emptySmtp} />
            case ConfigurationsTabTypes.SLACK:
                return <EmptyConfigurationView activeTab={ConfigurationsTabTypes.SLACK} image={emptySlack} />
            case ConfigurationsTabTypes.WEBHOOK:
                return <EmptyConfigurationView activeTab={ConfigurationsTabTypes.WEBHOOK} image={emptyWebhook} />
            case ConfigurationsTabTypes.SES:
            default:
                return <EmptyConfigurationView activeTab={ConfigurationsTabTypes.SES} image={emptySES} />
        }
    }

    const onClickDelete = async () => {
        try {
            await deleteNotification(deletePayload)
            await getAllChannelConfigs()
            setState({ ...state, confirmation: false })
        } catch (serverError) {
            if (serverError instanceof ServerErrors && serverError.code !== 500) {
                showError(serverError)
            }
            setState({ ...state, confirmation: false, showCannotDeleteDialogModal: true })
        }
    }

    const handleConfirmation = () => {
        setState({ ...state, showCannotDeleteDialogModal: false })
    }

    const renderDeleteModal = () => (
        <ConfirmationModal
            variant={ConfirmationModalVariantType.delete}
            title={`Delete ${ConfigurationTabText[state.activeTab.toUpperCase()]} '${deletePayload.configName}'`}
            subtitle="Are you sure you want to delete this configuration?"
            buttonConfig={{
                secondaryButtonConfig: {
                    text: 'Cancel',
                    onClick: hideDeleteModal,
                    disabled: state.isLoading,
                },
                primaryButtonConfig: {
                    text: 'Delete',
                    onClick: onClickDelete,
                    isLoading: state.isLoading,
                },
            }}
            showConfirmationModal={state.confirmation}
            handleClose={hideDeleteModal}
        />
    )

    const renderCannotDeleteDialogModal = () => (
        <ConfirmationModal
            variant={ConfirmationModalVariantType.info}
            title={`Cannot delete ${ConfigurationTabText[state.activeTab.toUpperCase()]} '${deletePayload.configName}'`}
            subtitle={DC_CONFIGURATION_CONFIRMATION_MESSAGE}
            buttonConfig={{
                primaryButtonConfig: {
                    text: 'Okay',
                    onClick: handleConfirmation,
                },
            }}
            showConfirmationModal={state.showCannotDeleteDialogModal}
            handleClose={handleConfirmation}
        />
    )

    const renderTableComponent = () => <ConfigurationTables activeTab={modal} state={state} setState={setState} />

    const renderModal = () => {
        if (queryString.get(ConfigurationFieldKeys.CONFIG_ID) === null) return null
        const configId = parseInt(queryString.get(ConfigurationFieldKeys.CONFIG_ID), 10)

        switch (modal) {
            case ConfigurationsTabTypes.SES:
                return (
                    <SESConfigModal
                        sesConfigId={configId}
                        shouldBeDefault={state.sesConfigurationList.length === 0}
                        onSaveSuccess={getAllChannelConfigs}
                    />
                )
            case ConfigurationsTabTypes.SMTP:
                return (
                    <SMTPConfigModal
                        smtpConfigId={configId}
                        shouldBeDefault={state.smtpConfigurationList.length === 0}
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

    return (
        <div className="configuration-tab__container bcn-0 h-100 flexbox-col dc__gap-16 dc__overflow-auto">
            <ConfigurationTabSwitcher />
            {state[`${modal.toLowerCase()}ConfigurationList`].length ? renderTableComponent() : renderEmptyState()}
            {renderModal()}
            {renderDeleteModal()}
            {renderCannotDeleteDialogModal()}
        </div>
    )
}
