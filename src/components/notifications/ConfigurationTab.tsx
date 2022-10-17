import React, { Component } from 'react'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { SlackConfigModal } from './SlackConfigModal'
import { SESConfigModal } from './SESConfigModal'
import { ReactComponent as Edit } from '../../assets/icons/ic-edit.svg'
import { showError, Progressing, ErrorScreenNotAuthorized } from '../common'
import {
    deleteNotification,
    getChannelConfigs,
    getSESConfiguration,
    getConfigs,
    getSlackConfiguration,
    getSMTPConfiguration,
} from './notifications.service'
import slack from '../../assets/img/slack-logo.svg'
import ses from '../../assets/icons/ic-aws-ses.svg'
import { ReactComponent as SMTP } from '../../assets/icons/ic-smtp.svg'
import { ViewType } from '../../config/constants'
import EmptyState from '../EmptyState/EmptyState'
import { ReactComponent as Trash } from '../../assets/icons/ic-delete.svg'
import DeleteComponent from '../../util/DeleteComponent'
import { DC_CONFIGURATION_CONFIRMATION_MESSAGE, DeleteComponentsName } from '../../config/constantMessaging'
import Tippy from '@tippyjs/react'
import { SMTPConfigModal } from './SMTPConfigModal'
export interface ConfigurationTabState {
    view: string
    showSlackConfigModal: boolean
    showSESConfigModal: boolean
    showSMTPConfigModal: boolean
    slackConfigId: number
    sesConfigId: number
    smtpConfigId: number
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
    abortAPI: boolean
    deleting: boolean
    confirmation: boolean
    sesConfig: any
    smtpConfig: any
    slackConfig: any
    showDeleteConfigModalType: string
}

const enum ChannelConfigType {
    SLACK = 'slack',
    SES = 'ses',
}

export class ConfigurationTab extends Component<{}, ConfigurationTabState> {
    constructor(props) {
        super(props)
        this.state = {
            view: ViewType.LOADING,
            showSlackConfigModal: false,
            showSESConfigModal: false,
            showSMTPConfigModal: false,
            slackConfigId: 0,
            sesConfigId: 0,
            smtpConfigId: 0,
            sesConfigurationList: [],
            smtpConfigurationList: [],
            slackConfigurationList: [],
            abortAPI: false,
            deleting: false,
            confirmation: false,
            sesConfig: {},
            smtpConfig: {},
            slackConfig: {},
            showDeleteConfigModalType: '',
        }
        this.getAllChannelConfigs = this.getAllChannelConfigs.bind(this)
    }

    componentDidMount() {
        this.getAllChannelConfigs()
    }

    getAllChannelConfigs(): void {
        getConfigs()
            .then((response) => {
                let state = { ...this.state }
                state.slackConfigurationList = response.result.slackConfigurationList
                state.sesConfigurationList = response.result.sesConfigurationList
                state.smtpConfigurationList = response.result.smtpConfigurationList
                state.view = ViewType.FORM
                this.setState(state)
            })
            .catch((error) => {
                showError(error,true,true)
                this.setState({view: ViewType.ERROR})
            })
    }

    renderSlackConfigurations() {
        return (
            <div key="slack-config" className="white-card white-card--configuration-tab mb-16">
                <div className="configuration-tab__header">
                    <p className="configuration-tab__title">
                        <img src={slack} alt="slack" className="icon-dim-24 mr-10" />
                        Slack Configurations
                    </p>
                    <button
                        type="button"
                        className="cta flex small"
                        onClick={(event) => {
                            this.setState({ showSlackConfigModal: true, slackConfigId: 0 })
                        }}
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
                <div className="flex" style={{ height: 'calc(100% - 68px)' }}>
                    <Progressing pageLoader />
                </div>
            )
        } else if (this.state.slackConfigurationList.length === 0) {
            return (
                <div style={{ height: 'calc(100% - 70px)' }}>
                    <EmptyState>
                        <EmptyState.Title>
                            <h3>No Configurations</h3>
                        </EmptyState.Title>
                    </EmptyState>
                </div>
            )
        } else
            return (
                <table className="w-100">
                    <thead>
                        <tr className="configuration-tab__table-header">
                            <td className="slack-config-table__name dc__truncate-text ">Name</td>
                            <td className="slack-config-table__webhook dc__truncate-text ">Webhook URL</td>
                            <td className="slack-config-table__action"></td>
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
                                                >
                                                    <Edit className="icon-dim-20" />
                                                </button>
                                            </Tippy>
                                            <Tippy
                                                className="default-tt"
                                                arrow={false}
                                                placement="top"
                                                content="Delete"
                                            >
                                                <button
                                                    type="button"
                                                    className="dc__transparent dc__align-right"
                                                    onClick={() => {
                                                        this.deleteClickHandler(
                                                            slackConfig.id,
                                                            DeleteComponentsName.SlackConfigurationTab,
                                                        )
                                                    }}
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
            <div key="ses-config" className="white-card white-card--configuration-tab">
                <div className="configuration-tab__header">
                    <p className="configuration-tab__title">
                        <img alt="ses config" src={ses} className="icon-dim-24 mr-10" />
                        SES Configurations
                    </p>
                    <button
                        type="button"
                        className="cta flex small"
                        onClick={(event) => {
                            this.setState({ showSESConfigModal: true, sesConfigId: 0 })
                        }}
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
            <div key="smtp-config" className="white-card white-card--configuration-tab">
                <div className="configuration-tab__header">
                    <p className="configuration-tab__title flexbox">
                        <SMTP className="icon-dim-24 mr-10" />
                        SMTP Configurations
                    </p>
                    <button
                        type="button"
                        className="cta flex small"
                        onClick={(event) => {
                            this.setState({ showSMTPConfigModal: true, smtpConfigId: 0 })
                        }}
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
                    sesConfigId: configId,
                    smtpConfig: {
                        ...result,
                        channel: DeleteComponentsName.SMTPConfigurationTab,
                    },
                    confirmation: true,
                    showDeleteConfigModalType: DeleteComponentsName.SMTPConfigurationTab,
                })
            }
        } catch (e) {
            showError(e)
        }
    }
    renderSESConfigurationTable() {
        if (this.state.view === ViewType.LOADING) {
            return (
                <div className="flex" style={{ height: 'calc(100% - 68px)' }}>
                    <Progressing pageLoader />
                </div>
            )
        } else if (this.state.sesConfigurationList.length === 0) {
            return (
                <div style={{ height: 'calc(100% - 70px)' }}>
                    <EmptyState>
                        <EmptyState.Title>
                            <h3>No Configurations</h3>
                        </EmptyState.Title>
                    </EmptyState>
                </div>
            )
        } else
            return (
                <table className="w-100">
                    <thead>
                        <tr className="configuration-tab__table-header">
                            <th className="ses-config-table__name dc__truncate-text ">Name</th>
                            <th className="ses-config-table__access-key dc__truncate-text ">Access key Id</th>
                            <th className="ses-config-table__email dc__truncate-text ">Sender's Email</th>
                            <th className="ses-config-table__action"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="mb-8">
                            {this.state.sesConfigurationList.map((sesConfig) => {
                                return (
                                    <td key={sesConfig.id} className="configuration-tab__table-row">
                                        <div className="ses-config-table__name dc__truncate-text ">
                                            {sesConfig.name}
                                            {sesConfig.isDefault ? (
                                                <span className="dc__ses_config-table__tag">Default</span>
                                            ) : null}
                                        </div>
                                        <div className="ses-config-table__access-key dc__truncate-text ">
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
                                                >
                                                    <Edit className="icon-dim-20" />
                                                </button>
                                            </Tippy>
                                            <Tippy
                                                className="default-tt"
                                                arrow={false}
                                                placement="top"
                                                content="Delete"
                                            >
                                                <button
                                                    type="button"
                                                    className="dc__transparent dc__align-right"
                                                    onClick={() => {
                                                        this.deleteClickHandler(
                                                            sesConfig.id,
                                                            DeleteComponentsName.SesConfigurationTab,
                                                        )
                                                    }}
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
                <div className="flex" style={{ height: 'calc(100% - 68px)' }}>
                    <Progressing pageLoader />
                </div>
            )
        } else if (this.state.smtpConfigurationList.length === 0) {
            return (
                <div style={{ height: 'calc(100% - 70px)' }}>
                    <EmptyState>
                        <EmptyState.Title>
                            <h3>No Configurations</h3>
                        </EmptyState.Title>
                    </EmptyState>
                </div>
            )
        } else
            return (
                <table className="w-100">
                    <thead>
                        <tr className="configuration-tab__table-header">
                            <th className="ses-config-table__name dc__truncate-text ">Name</th>
                            <th className="smtp-config-table__host dc__truncate-text ">Host</th>
                            <th className="smtp-config-table__port dc__truncate-text ">Port</th>
                            <th className="smtp-config-table__email dc__truncate-text ">Sender's Email</th>
                            <th className="ses-config-table__action"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="mb-8">
                            {this.state.smtpConfigurationList.map((smtpConfig) => {
                                return (
                                    <td key={smtpConfig.id} className="configuration-tab__table-row">
                                        <div className="ses-config-table__name dc__truncate-text ">
                                            {smtpConfig.name}
                                            {smtpConfig.isDefault ? (
                                                <span className="dc__ses_config-table__tag">Default</span>
                                            ) : null}
                                        </div>
                                        <div className="smtp-config-table__host dc__truncate-text ">{smtpConfig.host}</div>
                                        <div className="smtp-config-table__port dc__truncate-text ">{smtpConfig.port}</div>
                                        <div className="smtp-config-table__email dc__truncate-text ">{smtpConfig.email}</div>
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
                                                >
                                                    <Edit className="icon-dim-20" />
                                                </button>
                                            </Tippy>
                                            <Tippy
                                                className="default-tt"
                                                arrow={false}
                                                placement="top"
                                                content="Delete"
                                            >
                                                <button
                                                    type="button"
                                                    className="dc__transparent dc__align-right"
                                                    onClick={() => {
                                                        this.deleteClickHandler(
                                                            smtpConfig.id,
                                                            DeleteComponentsName.SMTPConfigurationTab,
                                                        )
                                                    }}
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

    render() {
        if (this.state.view === ViewType.LOADING) {
            return (
                <div style={{ height: 'calc(100vh - 172px)' }}>
                    <Progressing pageLoader />
                </div>
            )
        }
        if (this.state.view === ViewType.ERROR) {
            return (
                <div style={{ height: 'calc(100vh - 172px)' }}>
                    <ErrorScreenNotAuthorized subtitle="" />
                </div>
            )
        }
        return (
            <>
                <div className="configuration-tab">
                    {this.renderSESConfigurations()}
                    {this.renderSMTPConfigurations()}
                    {this.renderSlackConfigurations()}
                </div>
                {this.renderSESConfigModal()}
                {this.renderSMTPConfigModal()}
                {this.renderSlackConfigModal()}
                {this.state.confirmation && (
                    <DeleteComponent
                        setDeleting={this.setDeleting}
                        deleteComponent={deleteNotification}
                        payload={
                            this.state.showDeleteConfigModalType === DeleteComponentsName.SlackConfigurationTab
                                ? this.state.slackConfig
                                : this.state.showDeleteConfigModalType === DeleteComponentsName.SesConfigurationTab
                                ? this.state.sesConfig
                                : this.state.smtpConfig
                        }
                        title={
                            this.state.showDeleteConfigModalType === DeleteComponentsName.SlackConfigurationTab
                                ? this.state.slackConfig.configName
                                : this.state.showDeleteConfigModalType === DeleteComponentsName.SesConfigurationTab
                                ? this.state.sesConfig.configName
                                : this.state.smtpConfig.configName
                        }
                        toggleConfirmation={this.toggleConfirmation}
                        component={
                            this.state.showDeleteConfigModalType === DeleteComponentsName.SlackConfigurationTab
                                ? DeleteComponentsName.SlackConfigurationTab
                                : this.state.showDeleteConfigModalType === DeleteComponentsName.SesConfigurationTab
                                ? DeleteComponentsName.SesConfigurationTab
                                : DeleteComponentsName.SMTPConfigurationTab
                        }
                        confirmationDialogDescription={DC_CONFIGURATION_CONFIRMATION_MESSAGE}
                        reload={this.getAllChannelConfigs}
                        configuration="configuration"
                    />
                )}
            </>
        )
    }
}
