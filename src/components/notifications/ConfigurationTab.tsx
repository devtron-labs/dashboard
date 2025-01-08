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
    ConfirmationDialog,
} from '@devtron-labs/devtron-fe-common-lib'
import { Route, Switch, useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import info from '@Icons/ic-info-filled.svg'
import { SlackConfigModal } from './SlackConfigModal'
import SESConfigModal from './SESConfigModal'
import {
    deleteNotification,
    getSESConfiguration,
    getConfigs,
    getSlackConfiguration,
    getSMTPConfiguration,
    getWebhookConfiguration,
} from './notifications.service'
import { DC_CONFIGURATION_CONFIRMATION_MESSAGE, DeleteComponentsName } from '../../config/constantMessaging'
import { SMTPConfigModal } from './SMTPConfigModal'
import { WebhookConfigModal } from './WebhookConfigModal'
import { ConfigurationTabState } from './types'
import SlackConfigurationTable from './SlackConfigurationTable'
import { WebhookConfigurationTable } from './WebhookConfigurationTable'
import SESConfigurationTable from './SESConfigurationTable'
import { SMTPConfigurationTable } from './SMTPConfigurationTable'
import { ConfigurationTabSwitcher } from './ConfigurationTabsSwitcher'
import { ConfigurationFieldKeys, ConfigurationsTabTypes } from './constants'
import { getTabText } from './notifications.util'

export const ConfigurationTab = () => {
    const { path } = useRouteMatch()
    const history = useHistory()
    const location = useLocation()
    const { searchParams } = useSearchString()
    const queryString = new URLSearchParams(location.search)
    const modal = queryString.get('modal')

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

    const deleteClickHandler = (configId, type: ConfigurationsTabTypes) => async () => {
        try {
            if (type === ConfigurationsTabTypes.SLACK) {
                const { result } = await getSlackConfiguration(configId, true)
                setState({
                    ...state,
                    slackConfig: {
                        ...result,
                        channel: ConfigurationsTabTypes.SLACK,
                    },
                    confirmation: true,
                    activeTab: ConfigurationsTabTypes.SLACK,
                })
            } else if (type === ConfigurationsTabTypes.SES) {
                const { result } = await getSESConfiguration(configId)
                setState({
                    ...state,
                    sesConfig: {
                        ...result,
                        channel: ConfigurationsTabTypes.SES,
                    },
                    confirmation: true,
                    activeTab: ConfigurationsTabTypes.SES,
                })
            } else if (type === ConfigurationsTabTypes.SMTP) {
                const { result } = await getSMTPConfiguration(configId)
                setState({
                    ...state,
                    smtpConfig: {
                        ...result,
                        channel: ConfigurationsTabTypes.SMTP,
                    },
                    confirmation: true,
                    activeTab: ConfigurationsTabTypes.SMTP,
                })
            } else if (type === ConfigurationsTabTypes.WEBHOOK) {
                const { result } = await getWebhookConfiguration(configId)
                setState({
                    ...state,
                    webhookConfig: {
                        ...result,
                        channel: DeleteComponentsName.WebhookConfigurationTab,
                    },
                    confirmation: true,
                    activeTab: ConfigurationsTabTypes.WEBHOOK,
                })
            }
        } catch (e) {
            showError(e)
        }
    }

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

    const payload = deleteConfigPayload()

    if (state.isLoading) {
        return (
            <div className="h-100">
                <Progressing pageLoader />
            </div>
        )
    }

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

    const reloadDeleteConfig = () => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        getAllChannelConfigs()
    }

    const renderTableComponent = () => {
        switch (modal) {
            case ConfigurationsTabTypes.SES:
                return <SESConfigurationTable state={state} deleteClickHandler={deleteClickHandler} />
            case ConfigurationsTabTypes.SMTP:
                return <SMTPConfigurationTable state={state} deleteClickHandler={deleteClickHandler} />
            case ConfigurationsTabTypes.SLACK:
                return <SlackConfigurationTable state={state} deleteClickHandler={deleteClickHandler} />
            case ConfigurationsTabTypes.WEBHOOK:
                return <WebhookConfigurationTable state={state} deleteClickHandler={deleteClickHandler} />
            default:
                return null
        }
    }

    const onClickDelete = async () => {
        try {
            await deleteNotification(payload)
            reloadDeleteConfig()
            setState({ ...state, confirmation: false })
        } catch (serverError) {
            if (serverError instanceof ServerErrors && serverError.code === 500) {
                setState({ ...state, showCannotDeleteDialogModal: true })
            } else {
                showError(serverError)
            }
            setState({ ...state, confirmation: false, showCannotDeleteDialogModal: true })
        }
    }

    const handleConfirmation = () => {
        setState({ ...state, showCannotDeleteDialogModal: false })
    }

    const renderCannotDeleteDialogModal = () => (
        <ConfirmationDialog className="confirmation-dialog__body--w-360">
            <ConfirmationDialog.Icon src={info} />
            <ConfirmationDialog.Body title={`Cannot delete ${getTabText(state.activeTab)}'`} />
            <p className="fs-13 cn-7 ">{DC_CONFIGURATION_CONFIRMATION_MESSAGE}</p>
            <ConfirmationDialog.ButtonGroup>
                <button type="button" className="cta" onClick={handleConfirmation}>
                    Okay
                </button>
            </ConfirmationDialog.ButtonGroup>
        </ConfirmationDialog>
    )

    if (state.isLoading) {
        return <Progressing pageLoader />
    }

    return (
        <div className="configuration-tab__container bcn-0 h-100 flexbox-col dc__gap-16 dc__overflow-auto">
            <ConfigurationTabSwitcher />
            <Switch>
                <Route path={path} render={renderTableComponent} />
            </Switch>
            {renderModal()}

            <ConfirmationModal
                variant={ConfirmationModalVariantType.delete}
                title={payload.configName}
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

            {state.showCannotDeleteDialogModal && renderCannotDeleteDialogModal()}
        </div>
    )
}
