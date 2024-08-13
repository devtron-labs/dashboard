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

import React, { Component } from 'react'
import {
    showError,
    Progressing,
    ErrorScreenNotAuthorized,
    GenericEmptyState,
    DeleteComponent,
} from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { SlackConfigModal } from './SlackConfigModal'
import { SESConfigModal } from './SESConfigModal'
import { ReactComponent as Edit } from '../../assets/icons/ic-edit.svg'
import {
    deleteNotification,
    getSESConfiguration,
    getConfigs,
    getSlackConfiguration,
    getSMTPConfiguration,
    getWebhookConfiguration,
} from './notifications.service'
import slack from '../../assets/img/slack-logo.svg'
import ses from '../../assets/icons/ic-aws-ses.svg'
import webhook from '../../assets/icons/ic-CIWebhook.svg'
import { ReactComponent as SMTP } from '../../assets/icons/ic-smtp.svg'
import { ViewType } from '../../config/constants'
import { ReactComponent as Trash } from '../../assets/icons/ic-delete.svg'
import {
    DC_CONFIGURATION_CONFIRMATION_MESSAGE,
    DeleteComponentsName,
    EMPTY_STATE_STATUS,
} from '../../config/constantMessaging'
import { SMTPConfigModal } from './SMTPConfigModal'
import { WebhookConfigModal } from './WebhookConfigModal'
import { ConfigurationTabState } from './types'

export class ConfigurationTab extends Component<{}, ConfigurationTabState> {
    constructor(props) {
        super(props)
        this.state = {
            view: ViewType.LOADING,
            showSlackConfigModal: false,
            showSESConfigModal: false,
            showSMTPConfigModal: false,
            showWebhookConfigModal: false,
            slackConfigId: 0,
            sesConfigId: 0,
            smtpConfigId: 0,
            webhookConfigId: 0,
            sesConfigurationList: [],
            smtpConfigurationList: [],
            slackConfigurationList: [],
            webhookConfigurationList: [],
            abortAPI: false,
            deleting: false,
            confirmation: false,
            sesConfig: {},
            smtpConfig: {},
            slackConfig: {},
            webhookConfig: {},
            showDeleteConfigModalType: '',
        }
        this.getAllChannelConfigs = this.getAllChannelConfigs.bind(this)
        this.editWebhookHandler = this.editWebhookHandler.bind(this)
        this.addWebhookConfigHandler = this.addWebhookConfigHandler.bind(this)
        this.onSaveWebhook = this.onSaveWebhook.bind(this)
        this.onCloseWebhookModal = this.onCloseWebhookModal.bind(this)
        this.deleteConfigPayload = this.deleteConfigPayload.bind(this)
        this.deleteConfigComponent = this.deleteConfigComponent.bind(this)
    }

    componentDidMount() {
        this.getAllChannelConfigs()
    }

    getAllChannelConfigs(): void {
        getConfigs()
            .then((response) => {
                const state = { ...this.state }
                state.slackConfigurationList = response.result.slackConfigurationList
                state.sesConfigurationList = response.result.sesConfigurationList
                state.smtpConfigurationList = response.result.smtpConfigurationList
                state.webhookConfigurationList = response.result.webhookConfigurationList
                state.view = ViewType.FORM
                this.setState(state)
            })
            .catch((error) => {
                showError(error, true, true)
                this.setState({ view: ViewType.ERROR })
            })
    }

    addWebhookConfigHandler() {
        this.setState({ showWebhookConfigModal: true, webhookConfigId: 0 })
    }

    renderWebhookConfigurations() {
        return (
            <div key="webhook-config" className="dc__position-rel white-card white-card--configuration-tab mb-16">
                <div className="configuration-tab__header">
                    <p data-testid="webhook-config-heading-title" className="configuration-tab__title">
                        <img src={webhook} alt="webhook" className="icon-dim-24 mr-10" />
                        Webhook Configurations
                    </p>
                    <button
                        type="button"
                        className="cta flex small"
                        onClick={this.addWebhookConfigHandler}
                        data-testid="webhook-config-add-button"
                    >
                        <Add className="icon-dim-14 mr-5" />
                        Add
                    </button>
                </div>
                {this.renderWebhookConfigurationTable()}
            </div>
        )
    }

    renderSlackConfigurations() {
        return (
            <div key="slack-config" className="dc__position-rel white-card white-card--configuration-tab mb-16">
                <div className="configuration-tab__header">
                    <p data-testid="slack-heading-title" className="configuration-tab__title">
                        <img src={slack} alt="slack" className="icon-dim-24 mr-10" />
                        Slack Configurations
                    </p>
                    <button
                        type="button"
                        className="cta flex small"
                        onClick={(event) => {
                            this.setState({ showSlackConfigModal: true, slackConfigId: 0 })
                        }}
                        data-testid="slack-add-button"
                    >
                        <Add className="icon-dim-14 mr-5" />
                        Add
                    </button>
                </div>
                {this.renderSlackConfigurationTable()}
            </div>
        )
    }

    renderSlackConfigurationTable() {
        if (this.state.view === ViewType.LOADING) {
            return (
                <div className="flex progressing-loader-height">
                    <Progressing pageLoader />
                </div>
            )
        }
        if (this.state.slackConfigurationList.length === 0) {
            return (
                <div className="empty-state-height">
                    <GenericEmptyState title={EMPTY_STATE_STATUS.CONFIGURATION_TAB.TITLE} noImage />
                </div>
            )
        }
        return (
            <table className="w-100">
                <thead>
                    <tr className="configuration-tab__table-header">
                        <td className="slack-config-table__name dc__truncate-text ">Name</td>
                        <td className="slack-config-table__webhook dc__truncate-text ">Webhook URL</td>
                        <td className="slack-config-table__action" />
                    </tr>
                </thead>
                <tbody>
                    <tr className="mb-8">
                        {this.state.slackConfigurationList.map((slackConfig) => {
                            return (
                                <td key={slackConfig.id} className="configuration-tab__table-row">
                                    <div className="slack-config-table__name dc__truncate-text ">
                                        {slackConfig.slackChannel}
                                    </div>
                                    <div className="slack-config-table__webhook dc__truncate-text ">
                                        {slackConfig.webhookUrl}
                                    </div>
                                    <div className="slack-config-table__action">
                                        <Tippy className="default-tt" arrow={false} placement="top" content="Edit">
                                            <button
                                                type="button"
                                                className="dc__transparent dc__align-right mr-16"
                                                onClick={(event) => {
                                                    this.setState({
                                                        showSlackConfigModal: true,
                                                        slackConfigId: slackConfig.id,
                                                    })
                                                }}
                                                data-testid="slack-configure-edit-button"
                                            >
                                                <Edit className="icon-dim-20" />
                                            </button>
                                        </Tippy>
                                        <Tippy className="default-tt" arrow={false} placement="top" content="Delete">
                                            <button
                                                type="button"
                                                className="dc__transparent dc__align-right"
                                                onClick={() => {
                                                    this.deleteClickHandler(
                                                        slackConfig.id,
                                                        DeleteComponentsName.SlackConfigurationTab,
                                                    )
                                                }}
                                                data-testid="slack-configure-delete-button"
                                            >
                                                <Trash className="scn-5 icon-dim-20" />
                                            </button>
                                        </Tippy>
                                    </div>
                                </td>
                            )
                        })}
                    </tr>
                </tbody>
            </table>
        )
    }

    editWebhookHandler(e) {
        this.setState({ showWebhookConfigModal: true, webhookConfigId: e.currentTarget.dataset.webhookid })
    }

    renderWebhookConfigurationTable() {
        if (this.state.view === ViewType.LOADING) {
            return (
                <div className="flex progressing-loader-height">
                    <Progressing pageLoader />
                </div>
            )
        }
        if (this.state.webhookConfigurationList.length === 0) {
            return (
                <div className="empty-state-height">
                    <GenericEmptyState title={EMPTY_STATE_STATUS.CONFIGURATION_TAB.TITLE} noImage />
                </div>
            )
        }
        return (
            <table className="w-100">
                <thead>
                    <tr className="configuration-tab__table-header">
                        <td className="slack-config-table__name dc__truncate-text ">Name</td>
                        <td className="slack-config-table__webhook dc__truncate-text ">Webhook URL</td>
                        <td className="slack-config-table__action" />
                    </tr>
                </thead>
                <tbody>
                    <tr className="mb-8">
                        {this.state.webhookConfigurationList.map((webhookConfig) => {
                            return (
                                <td
                                    key={webhookConfig.id}
                                    className="configuration-tab__table-row"
                                    data-testid={`webhook-container-${webhookConfig.name}`}
                                >
                                    <div
                                        className="slack-config-table__name dc__truncate-text"
                                        data-testid={`webhook-config-name-${webhookConfig.name}`}
                                    >
                                        {webhookConfig.name}
                                    </div>
                                    <div
                                        className="slack-config-table__webhook dc__truncate-text"
                                        data-testid={`webhook-url-${webhookConfig.webhookUrl}`}
                                    >
                                        {webhookConfig.webhookUrl}
                                    </div>
                                    <div className="slack-config-table__action">
                                        <Tippy className="default-tt" arrow={false} placement="top" content="Edit">
                                            <button
                                                type="button"
                                                className="dc__transparent dc__align-right mr-16"
                                                data-webhookid={webhookConfig.id}
                                                onClick={this.editWebhookHandler}
                                                data-testid={`webhook-configure-edit-button-${webhookConfig.name}`}
                                            >
                                                <Edit className="icon-dim-20" />
                                            </button>
                                        </Tippy>
                                        <Tippy className="default-tt" arrow={false} placement="top" content="Delete">
                                            <button
                                                type="button"
                                                className="dc__transparent dc__align-right"
                                                onClick={() => {
                                                    this.deleteClickHandler(
                                                        webhookConfig.id,
                                                        DeleteComponentsName.WebhookConfigurationTab,
                                                    )
                                                }}
                                                data-testid={`webhook-configure-delete-button-${webhookConfig.name}`}
                                            >
                                                <Trash className="scn-5 icon-dim-20" />
                                            </button>
                                        </Tippy>
                                    </div>
                                </td>
                            )
                        })}
                    </tr>
                </tbody>
            </table>
        )
    }

    renderSESConfigurations() {
        return (
            <div key="ses-config" className="dc__position-rel white-card white-card--configuration-tab">
                <div className="configuration-tab__header">
                    <p data-testid="ses-heading-title" className="configuration-tab__title">
                        <img alt="ses config" src={ses} className="icon-dim-24 mr-10" />
                        SES Configurations
                    </p>
                    <button
                        type="button"
                        className="cta flex small"
                        onClick={(event) => {
                            this.setState({ showSESConfigModal: true, sesConfigId: 0 })
                        }}
                        data-testid="ses-add-button"
                    >
                        <Add className="icon-dim-14 mr-5" />
                        Add
                    </button>
                </div>
                {this.renderSESConfigurationTable()}
            </div>
        )
    }

    renderSMTPConfigurations() {
        return (
            <div key="smtp-config" className="dc__position-rel white-card white-card--configuration-tab">
                <div className="configuration-tab__header">
                    <p data-testid="smtp-heading-title" className="configuration-tab__title flexbox">
                        <SMTP className="icon-dim-24 mr-10" />
                        SMTP Configurations
                    </p>
                    <button
                        type="button"
                        className="cta flex small"
                        onClick={(event) => {
                            this.setState({ showSMTPConfigModal: true, smtpConfigId: 0 })
                        }}
                        data-testid="smtp-add-button"
                    >
                        <Add className="icon-dim-14 mr-5" />
                        Add
                    </button>
                </div>
                {this.renderSMTPConfigurationTable()}
            </div>
        )
    }

    setDeleting = () => {
        this.setState({
            deleting: true,
        })
    }

    toggleConfirmation = (confirmation) => {
        this.setState({
            confirmation,
            ...(!confirmation && { showDeleteConfigModalType: '' }),
        })
    }

    deleteClickHandler = async (configId, type) => {
        try {
            if (type === DeleteComponentsName.SlackConfigurationTab) {
                const { result } = await getSlackConfiguration(configId, true)
                this.setState({
                    slackConfigId: configId,
                    slackConfig: {
                        ...result,
                        channel: DeleteComponentsName.SlackConfigurationTab,
                    },
                    confirmation: true,
                    showDeleteConfigModalType: DeleteComponentsName.SlackConfigurationTab,
                })
            } else if (type === DeleteComponentsName.SesConfigurationTab) {
                const { result } = await getSESConfiguration(configId)
                this.setState({
                    sesConfigId: configId,
                    sesConfig: {
                        ...result,
                        channel: DeleteComponentsName.SesConfigurationTab,
                    },
                    confirmation: true,
                    showDeleteConfigModalType: DeleteComponentsName.SesConfigurationTab,
                })
            } else if (type === DeleteComponentsName.SMTPConfigurationTab) {
                const { result } = await getSMTPConfiguration(configId)
                this.setState({
                    smtpConfigId: configId,
                    smtpConfig: {
                        ...result,
                        channel: DeleteComponentsName.SMTPConfigurationTab,
                    },
                    confirmation: true,
                    showDeleteConfigModalType: DeleteComponentsName.SMTPConfigurationTab,
                })
            } else if (type === DeleteComponentsName.WebhookConfigurationTab) {
                const { result } = await getWebhookConfiguration(configId)
                this.setState({
                    webhookConfigId: configId,
                    webhookConfig: {
                        ...result,
                        channel: DeleteComponentsName.WebhookConfigurationTab,
                    },
                    confirmation: true,
                    showDeleteConfigModalType: DeleteComponentsName.WebhookConfigurationTab,
                })
            }
        } catch (e) {
            showError(e)
        }
    }

    renderSESConfigurationTable() {
        if (this.state.view === ViewType.LOADING) {
            return (
                <div className="flex progressing-loader-height">
                    <Progressing pageLoader />
                </div>
            )
        }
        if (this.state.sesConfigurationList.length === 0) {
            return (
                <div className="empty-state-height">
                    <GenericEmptyState title={EMPTY_STATE_STATUS.CONFIGURATION_TAB.TITLE} noImage />
                </div>
            )
        }
        return (
            <table className="w-100">
                <thead>
                    <tr className="configuration-tab__table-header">
                        <th className="ses-config-table__name dc__truncate-text ">Name</th>
                        <th className="ses-config-table__access-key dc__truncate-text ">Access key Id</th>
                        <th className="ses-config-table__email dc__truncate-text ">Sender's Email</th>
                        <th className="ses-config-table__action" />
                    </tr>
                </thead>
                <tbody>
                    <tr className="mb-8">
                        {this.state.sesConfigurationList.map((sesConfig) => {
                            return (
                                <td
                                    data-testid={`ses-container-${sesConfig.name}`}
                                    key={sesConfig.id}
                                    className="configuration-tab__table-row"
                                >
                                    <div
                                        data-testid={`ses-config-name-${sesConfig.name}`}
                                        className="ses-config-table__name dc__truncate-text "
                                    >
                                        {sesConfig.name}
                                        {sesConfig.isDefault ? (
                                            <span className="dc__ses_config-table__tag">Default</span>
                                        ) : null}
                                    </div>
                                    <div
                                        data-testid={`ses-access-key-${sesConfig.accessKeyId}`}
                                        className="ses-config-table__access-key dc__truncate-text "
                                    >
                                        {sesConfig.accessKeyId}
                                    </div>
                                    <div className="ses-config-table__email dc__truncate-text ">{sesConfig.email}</div>
                                    <div className="ses-config-table__action">
                                        <Tippy className="default-tt" arrow={false} placement="top" content="Edit">
                                            <button
                                                type="button"
                                                className="dc__transparent dc__align-right mr-16"
                                                onClick={(event) => {
                                                    this.setState({
                                                        showSESConfigModal: true,
                                                        sesConfigId: sesConfig.id,
                                                    })
                                                }}
                                                data-testid="ses-config-edit-button"
                                            >
                                                <Edit className="icon-dim-20" />
                                            </button>
                                        </Tippy>
                                        <Tippy className="default-tt" arrow={false} placement="top" content="Delete">
                                            <button
                                                type="button"
                                                className="dc__transparent dc__align-right"
                                                onClick={() => {
                                                    this.deleteClickHandler(
                                                        sesConfig.id,
                                                        DeleteComponentsName.SesConfigurationTab,
                                                    )
                                                }}
                                                data-testid="ses-config-delete-button"
                                            >
                                                <Trash className="scn-5 icon-dim-20" />
                                            </button>
                                        </Tippy>{' '}
                                    </div>
                                </td>
                            )
                        })}
                    </tr>
                </tbody>
            </table>
        )
    }

    renderSMTPConfigurationTable() {
        if (this.state.view === ViewType.LOADING) {
            return (
                <div className="flex progressing-loader-height">
                    <Progressing pageLoader />
                </div>
            )
        }
        if (this.state.smtpConfigurationList.length === 0) {
            return (
                <div className="empty-state-height">
                    <GenericEmptyState title={EMPTY_STATE_STATUS.CONFIGURATION_TAB.TITLE} noImage />
                </div>
            )
        }
        return (
            <table className="w-100">
                <thead>
                    <tr className="configuration-tab__table-header">
                        <th className="ses-config-table__name dc__truncate-text ">Name</th>
                        <th className="smtp-config-table__host dc__truncate-text ">Host</th>
                        <th className="smtp-config-table__port dc__truncate-text ">Port</th>
                        <th className="smtp-config-table__email dc__truncate-text ">Sender's Email</th>
                        <th className="ses-config-table__action" />
                    </tr>
                </thead>
                <tbody>
                    <tr className="mb-8">
                        {this.state.smtpConfigurationList.map((smtpConfig) => {
                            return (
                                <td
                                    data-testid={`smtp-container-${smtpConfig.name}`}
                                    key={smtpConfig.id}
                                    className="configuration-tab__table-row"
                                >
                                    <div
                                        data-testid={`smtp-config-name-${smtpConfig.name}`}
                                        className="ses-config-table__name dc__truncate-text "
                                    >
                                        {smtpConfig.name}
                                        {smtpConfig.isDefault ? (
                                            <span className="dc__ses_config-table__tag">Default</span>
                                        ) : null}
                                    </div>
                                    <div
                                        data-testid={`smtp-config-host-${smtpConfig.host}`}
                                        className="smtp-config-table__host dc__truncate-text "
                                    >
                                        {smtpConfig.host}
                                    </div>
                                    <div className="smtp-config-table__port dc__truncate-text ">{smtpConfig.port}</div>
                                    <div className="smtp-config-table__email dc__truncate-text ">
                                        {smtpConfig.email}
                                    </div>
                                    <div className="ses-config-table__action">
                                        <Tippy className="default-tt" arrow={false} placement="top" content="Edit">
                                            <button
                                                type="button"
                                                className="dc__transparent dc__align-right mr-16"
                                                onClick={() => {
                                                    this.setState({
                                                        showSMTPConfigModal: true,
                                                        smtpConfigId: smtpConfig.id,
                                                    })
                                                }}
                                                data-testid="smtp-config-edit-button"
                                            >
                                                <Edit className="icon-dim-20" />
                                            </button>
                                        </Tippy>
                                        <Tippy className="default-tt" arrow={false} placement="top" content="Delete">
                                            <button
                                                type="button"
                                                className="dc__transparent dc__align-right"
                                                onClick={() => {
                                                    this.deleteClickHandler(
                                                        smtpConfig.id,
                                                        DeleteComponentsName.SMTPConfigurationTab,
                                                    )
                                                }}
                                                data-testid="smtp-config-delete-button"
                                            >
                                                <Trash className="scn-5 icon-dim-20" />
                                            </button>
                                        </Tippy>
                                    </div>
                                </td>
                            )
                        })}
                    </tr>
                </tbody>
            </table>
        )
    }

    renderSESConfigModal() {
        if (this.state.showSESConfigModal) {
            return (
                <SESConfigModal
                    sesConfigId={this.state.sesConfigId}
                    shouldBeDefault={this.state.sesConfigurationList.length === 0}
                    onSaveSuccess={() => {
                        this.setState({ showSESConfigModal: false, sesConfigId: 0 })
                        this.getAllChannelConfigs()
                    }}
                    closeSESConfigModal={(event) => {
                        this.setState({ showSESConfigModal: false })
                    }}
                />
            )
        }
    }

    renderSMTPConfigModal() {
        if (this.state.showSMTPConfigModal) {
            return (
                <SMTPConfigModal
                    smtpConfigId={this.state.smtpConfigId}
                    shouldBeDefault={this.state.smtpConfigurationList.length === 0}
                    onSaveSuccess={() => {
                        this.setState({ showSMTPConfigModal: false, smtpConfigId: 0 })
                        this.getAllChannelConfigs()
                    }}
                    closeSMTPConfigModal={(event) => {
                        this.setState({ showSMTPConfigModal: false })
                    }}
                />
            )
        }
    }

    renderSlackConfigModal() {
        if (this.state.showSlackConfigModal) {
            return (
                <SlackConfigModal
                    slackConfigId={this.state.slackConfigId}
                    onSaveSuccess={() => {
                        this.setState({ showSlackConfigModal: false, slackConfigId: 0 })
                        this.getAllChannelConfigs()
                    }}
                    closeSlackConfigModal={(event) => {
                        this.setState({ showSlackConfigModal: false, slackConfigId: 0 })
                    }}
                />
            )
        }
    }

    onSaveWebhook() {
        this.setState({ showWebhookConfigModal: false, webhookConfigId: 0 })
        this.getAllChannelConfigs()
    }

    onCloseWebhookModal() {
        this.setState({ showWebhookConfigModal: false, webhookConfigId: 0 })
    }

    renderWebhookConfigModal() {
        if (this.state.showWebhookConfigModal) {
            return (
                <WebhookConfigModal
                    webhookConfigId={this.state.webhookConfigId}
                    onSaveSuccess={this.onSaveWebhook}
                    closeWebhookConfigModal={this.onCloseWebhookModal}
                />
            )
        }
    }

    deleteConfigPayload(): any {
        if (this.state.showDeleteConfigModalType === DeleteComponentsName.SlackConfigurationTab) {
            return this.state.slackConfig
        }
        if (this.state.showDeleteConfigModalType === DeleteComponentsName.SesConfigurationTab) {
            return this.state.sesConfig
        }
        if (this.state.showDeleteConfigModalType === DeleteComponentsName.WebhookConfigurationTab) {
            return this.state.webhookConfig
        }
        return this.state.smtpConfig
    }

    deleteConfigComponent(): string {
        if (this.state.showDeleteConfigModalType === DeleteComponentsName.SlackConfigurationTab) {
            return DeleteComponentsName.SlackConfigurationTab
        }
        if (this.state.showDeleteConfigModalType === DeleteComponentsName.SesConfigurationTab) {
            return DeleteComponentsName.SesConfigurationTab
        }
        if (this.state.showDeleteConfigModalType === DeleteComponentsName.WebhookConfigurationTab) {
            return DeleteComponentsName.WebhookConfigurationTab
        }
        return DeleteComponentsName.SMTPConfigurationTab
    }

    render() {
        if (this.state.view === ViewType.LOADING) {
            return (
                <div className="dc__height-reduce-172">
                    <Progressing pageLoader />
                </div>
            )
        }
        if (this.state.view === ViewType.ERROR) {
            return (
                <div className="dc__height-reduce-172">
                    <ErrorScreenNotAuthorized />
                </div>
            )
        }
        const payload = this.deleteConfigPayload()
        return (
            <>
                <div className="configuration-tab">
                    {this.renderSESConfigurations()}
                    {this.renderSMTPConfigurations()}
                    {this.renderSlackConfigurations()}
                    {this.renderWebhookConfigurations()}
                </div>
                {this.renderSESConfigModal()}
                {this.renderSMTPConfigModal()}
                {this.renderSlackConfigModal()}
                {this.renderWebhookConfigModal()}
                {this.state.confirmation && (
                    <DeleteComponent
                        setDeleting={this.setDeleting}
                        deleteComponent={deleteNotification}
                        payload={payload}
                        title={payload.configName}
                        toggleConfirmation={this.toggleConfirmation}
                        component={this.deleteConfigComponent()}
                        confirmationDialogDescription={DC_CONFIGURATION_CONFIRMATION_MESSAGE}
                        reload={this.getAllChannelConfigs}
                        configuration="configuration"
                    />
                )}
            </>
        )
    }
}
