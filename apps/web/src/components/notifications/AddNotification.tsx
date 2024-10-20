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
    getTeamListMin,
    Checkbox,
    ClearIndicator,
    MultiValueRemove,
    RadioGroup,
    RadioGroupItem,
    CHECKBOX_VALUE,
    getIsRequestAborted,
    CiPipelineSourceConfig,
    SelectAllGroupedResourceIdentifiers,
    ToastVariantType,
    ToastManager,
} from '@devtron-labs/devtron-fe-common-lib'
import { RouteComponentProps, Link } from 'react-router-dom'
import { components } from 'react-select'
import Tippy from '@tippyjs/react'
import CreatableSelect from 'react-select/creatable'
import { SESConfigModal } from './SESConfigModal'
import { SlackConfigModal } from './SlackConfigModal'
import { Select, validateEmail, ErrorBoundary } from '../common'
import { ReactComponent as Slack } from '../../assets/img/slack-logo.svg'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as Filter } from '../../assets/icons/ic-filter.svg'
import { ReactComponent as Folder } from '../../assets/icons/img-folder-empty.svg'
import { ReactComponent as Webhook } from '../../assets/icons/ic-CIWebhook.svg'
import { getAddNotificationInitData, getPipelines, saveNotification, getChannelConfigs } from './notifications.service'
import { ViewType, URLS, SourceTypeMap } from '../../config'
import {
    multiSelectStyles,
    DropdownIndicator,
    Option,
    MultiValueContainer,
    renderPipelineTypeIcon,
} from './notifications.util'
import './notifications.scss'
import { getAppListMin, getEnvironmentListMin } from '../../services/service'
import { SMTPConfigModal } from './SMTPConfigModal'
import { EMAIL_AGENT } from './types'
import { WebhookConfigModal } from './WebhookConfigModal'
import { getClusterListMin } from '@Components/ClusterNodes/clusterNodes.service'

interface AddNotificationsProps extends RouteComponentProps<{}> {}

export enum FilterOptions {
    ENVIRONMENT = 'environment',
    APPLICATION = 'application',
    PROJECT = 'project',
    CLUSTER = 'cluster'
}
interface Options {
    environment: {
        value: number
        label: string
        type: string
    }[]
    application: {
        value: number
        label: string
        type: string
    }[]
    project: {
        value: number
        label: string
        type: string
    }[]
    cluster: {
        value: number
        label: string
        type: string
    }[]
}
export interface PipelineType {
    checkbox: {
        isChecked: boolean
        value: 'CHECKED' | 'INTERMEDIATE'
    }
    type: 'CI' | 'CD'
    pipelineId: number
    pipelineName: string
    environmentName?: string
    branch?: string
    appName: string
    success: boolean
    trigger: boolean
    failure: boolean
    appliedFilters: Array<{ type: string; value: number | string | undefined; name: string; label: string | undefined }>
    isVirtualEnvironment?: boolean
}

interface AddNotificationState {
    view: string
    showSlackConfigModal: boolean
    showSESConfigModal: boolean
    showSMTPConfigModal: boolean
    channelOptions: {
        __isNew__?: boolean
        label: string
        value
        data: { dest: 'slack' | 'ses' | 'smtp' | 'webhook' | ''; configId: number; recipient: string }
    }[]
    sesConfigOptions: {
        id: number
        configName: string
        dest: 'slack' | 'ses' | 'smtp' | 'webhook' | ''
        recipient: string
    }[]
    smtpConfigOptions: {
        id: number
        configName: string
        dest: 'slack' | 'ses' | 'smtp' | 'webhook' | ''
        recipient: string
    }[]
    isLoading: boolean
    appliedFilters: Array<{ type: string; value: number | string | undefined; label: string | undefined }>
    selectedChannels: {
        __isNew__?: boolean
        label: string
        value
        data: { dest: 'slack' | 'ses' | 'smtp' | 'webhook' | ''; configId: number; recipient: string }
    }[]
    openSelectPipeline: boolean
    pipelineList: PipelineType[]
    filterInput: string
    emailAgentConfigId: number
    options: Options
    isApplistLoading: boolean
    selectedEmailAgent: string
    showWebhookConfigModal: boolean
}

export class AddNotification extends Component<AddNotificationsProps, AddNotificationState> {
    filterOptionsMain = [
        { value: 1, label: 'application', type: 'main' },
        { value: 2, label: 'project', type: 'main' },
        { value: 3, label: 'environment', type: 'main' },
        { value: 4, label: 'cluster', type: 'main' },
    ]

    filterOptionsInner = []

    abortController: AbortController

    constructor(props) {
        super(props)
        this.state = {
            view: ViewType.LOADING,
            channelOptions: [],
            sesConfigOptions: [],
            smtpConfigOptions: [],
            showSlackConfigModal: false,
            showSESConfigModal: false,
            showSMTPConfigModal: false,
            openSelectPipeline: false,
            filterInput: '',
            appliedFilters: [],
            isLoading: false,
            isApplistLoading: false,
            selectedChannels: [],
            pipelineList: [],
            emailAgentConfigId: 0,
            options: { environment: [], application: [], project: [], cluster: [] },
            selectedEmailAgent: EMAIL_AGENT.SES,
            showWebhookConfigModal: false,
        }
        this.handleFilterInput = this.handleFilterInput.bind(this)
        this.selectFilterType = this.selectFilterType.bind(this)
        this.toggleSelectPipeline = this.toggleSelectPipeline.bind(this)
        this.handlePipelineEventType = this.handlePipelineEventType.bind(this)
        this.selectChannel = this.selectChannel.bind(this)
        this.handleFilterTag = this.handleFilterTag.bind(this)
        this.selectEmailAgentAccount = this.selectEmailAgentAccount.bind(this)
        this.selectEmailAgentConfigIdFromChild = this.selectEmailAgentConfigIdFromChild.bind(this)
        this.openAddEmailConfigPopup = this.openAddEmailConfigPopup.bind(this)
        this.changeEmailAgent = this.changeEmailAgent.bind(this)
        this.onSaveWebhookConfig = this.onSaveWebhookConfig.bind(this)
        this.abortController = new AbortController()
    }

    componentDidMount() {
        this.getInitialData()
    }

    getInitialData() {
        this.getEnvTeamAndClusterData()
        getAddNotificationInitData().then((result) => {
            this.setState({
                sesConfigOptions: result.sesConfigOptions,
                smtpConfigOptions: result.smtpConfigOptions,
                channelOptions: result.channelOptions?.map((channel) => {
                    channel.value = `${channel.value}-${channel.data.dest}`
                    return channel
                }),
                view: ViewType.FORM,
            })
        })
    }

    handleFilterInput(event): void {
        this.setState({
            filterInput: event.target.value,
            openSelectPipeline: true,
        })
        const unsavedFilter = this.state.appliedFilters.find((e) => e.type && !e.value)
        if (unsavedFilter.type === FilterOptions.APPLICATION) {
            this.getData(event.target.value)
        }
    }

    handleFilterTag(event): void {
        const theKeyCode = event.key
        if (theKeyCode === ' ' || theKeyCode === 'Enter') {
            const state = { ...this.state }
            const unsavedFilterIndex = state.appliedFilters.findIndex(
                (e) => e.type && !e.value && e.type === 'pipeline',
            )
            if (unsavedFilterIndex >= 0) {
                state.filterInput = ''
                state.appliedFilters[unsavedFilterIndex] = {
                    type: 'pipeline',
                    label: event.target.value,
                    value: event.target.value,
                }
                state.view = ViewType.LOADING
                this.setState(state, () => {
                    getPipelines(state.appliedFilters)
                        .then((response) => {
                            const selectedPipelines = this.state.pipelineList.filter(
                                (pipeline) => pipeline.checkbox.isChecked,
                            )
                            const newPipelines = response.result || []
                            this.setState({
                                view: ViewType.FORM,
                                pipelineList: selectedPipelines.concat(newPipelines),
                                openSelectPipeline: false,
                            })
                        })
                        .catch((error) => {
                            showError(error)
                        })
                })
            }
        } else if (theKeyCode === 'Backspace') {
            const unsavedFilterIndex = this.state.appliedFilters.findIndex((e) => e.type && !e.value)
            if (this.state.filterInput.length === 0 && unsavedFilterIndex >= 0) {
                const state = { ...this.state }
                state.appliedFilters.pop()
                this.setState(state)
            }
        }
    }

    showEmailAgents(): boolean {
        const allEmails = this.state.selectedChannels?.filter(
            (p) =>
                (p.data.dest === '' || p.data.dest === 'ses' || p.data.dest === 'smtp') &&
                validateEmail(p.data.recipient),
        )
        return allEmails.length > 0
    }

    toggleSelectPipeline() {
        let appliedFilters = []
        if (this.state.openSelectPipeline) {
            appliedFilters = this.state.appliedFilters.filter((e) => e.value)
        }
        this.setState({ appliedFilters, openSelectPipeline: !this.state.openSelectPipeline })
    }

    selectFilterType(filter: { label: string; value: string | number; type: string }): void {
        const state = { ...this.state }
        const unsavedFilterIndex = state.appliedFilters.findIndex((e) => e.type && !e.value)
        if (unsavedFilterIndex < 0) {
            state.appliedFilters.push({ type: filter.label, value: undefined, label: undefined })
            if (filter.label === 'pipeline') {
                state.openSelectPipeline = false
            }
            this.setState(state)
        } else {
            state.view = ViewType.LOADING
            state.appliedFilters[unsavedFilterIndex] = filter
            this.setState(state, () => {
                getPipelines(state.appliedFilters)
                    .then((response) => {
                        const selectedPipelines = this.state.pipelineList.filter(
                            (pipeline) => pipeline.checkbox.isChecked,
                        )
                        const newPipelines = response.result || []
                        this.setState({
                            view: ViewType.FORM,
                            pipelineList: selectedPipelines.concat(newPipelines),
                            openSelectPipeline: false,
                        })
                    })
                    .catch((error) => {
                        showError(error)
                    })
            })
        }
        this.setState({ options: { ...state.options, application: [] } })
    }

    clearFilter(filter: { type; label; value }) {
        const state = { ...this.state }
        state.appliedFilters = state.appliedFilters.filter((f) => !(f.type === filter.type && f.value === filter.value))
        this.setState(state, () => {
            getPipelines(state.appliedFilters)
                .then((response) => {
                    const selectedPipelines = this.state.pipelineList.filter((pipeline) => pipeline.checkbox.isChecked)
                    const newPipelines = response.result || []
                    this.setState({
                        view: ViewType.FORM,
                        pipelineList: selectedPipelines.concat(newPipelines),
                        openSelectPipeline: false,
                    })
                })
                .catch((error) => {
                    showError(error)
                })
        })
    }

    handlePipelineEventType(pipelineIndex: number, stage: 'success' | 'trigger' | 'failure'): void {
        const state = { ...this.state }
        const pipeline = state.pipelineList[pipelineIndex]
        pipeline[stage] = !pipeline[stage]
        if (pipeline.success && pipeline.trigger && pipeline.failure) {
            pipeline.checkbox = {
                value: 'CHECKED',
                isChecked: true,
            }
        } else if (pipeline.success || pipeline.trigger || pipeline.failure) {
            pipeline.checkbox = {
                value: 'INTERMEDIATE',
                isChecked: true,
            }
        } else if (!(pipeline.success && pipeline.trigger && pipeline.failure)) {
            pipeline.checkbox = {
                value: 'CHECKED',
                isChecked: false,
            }
        }
        state.pipelineList[pipelineIndex] = pipeline
        this.setState(state)
    }

    togglePipelineCheckbox(pipelineIndex: number): void {
        const state = { ...this.state }
        const pipeline = state.pipelineList[pipelineIndex]
        pipeline.checkbox.isChecked = !pipeline.checkbox.isChecked
        pipeline.checkbox.value = pipeline.checkbox.isChecked ? 'CHECKED' : 'INTERMEDIATE'
        pipeline.trigger = pipeline.checkbox.isChecked
        pipeline.success = pipeline.checkbox.isChecked
        pipeline.failure = pipeline.checkbox.isChecked
        state.pipelineList[pipelineIndex] = pipeline
        this.setState(state)
    }

    selectChannel(selectedChannels): void {
        const state = { ...this.state }
        state.selectedChannels = selectedChannels || []
        state.selectedChannels = state.selectedChannels.map((p) => {
            if (p.__isNew__) {
                return { ...p, data: { dest: '', configId: 0, recipient: p.value } }
            }
            return p
        })
        this.setState(state)
    }

    selectEmailAgentAccount(event): void {
        const state = { ...this.state }
        state.emailAgentConfigId = event.target.value
        this.setState(state)
    }

    selectEmailAgentConfigIdFromChild(emailAgentConfigId: number): void {
        if (emailAgentConfigId && emailAgentConfigId > 0) {
            const state = { ...this.state }
            state.emailAgentConfigId = emailAgentConfigId
            this.setState(state)
        }
    }

    saveNotification(): void {
        const selectedPipelines = this.state.pipelineList.filter((p) => p.checkbox.isChecked)
        if (!selectedPipelines.length) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Select atleast one pipeline',
            })
            return
        }
        if (!this.state.selectedChannels.length) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Select atleast one recipient',
            })
            return
        }

        const selectedChannels = []
        for (let index = 0; index < this.state.selectedChannels.length; index++) {
            const element = this.state.selectedChannels[index]
            if (element.data.dest === 'ses' || element.data.dest === 'smtp' || element.data.dest === '') {
                if (!this.state.emailAgentConfigId) {
                    ToastManager.showToast({
                        variant: ToastVariantType.error,
                        description: `Select ${this.state.selectedEmailAgent} Account`,
                    })
                    return
                }
                selectedChannels.push({
                    ...element,
                    data: {
                        ...element.data,
                        dest: this.state.selectedEmailAgent.toLowerCase(),
                    },
                })
            } else {
                selectedChannels.push(element)
            }
        }

        saveNotification(selectedPipelines, selectedChannels, this.state.emailAgentConfigId)
            .then((response) => {
                this.props.history.push(`${URLS.GLOBAL_CONFIG_NOTIFIER}/channels`)
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: 'Saved Successfully',
                })
            })
            .catch((error) => {
                showError(error)
            })
    }

    changeEmailAgent(event: any): void {
        this.setState((prevState) => ({
            ...prevState,
            selectedEmailAgent: event.target.value,
        }))
    }

    openAddEmailConfigPopup(): void {
        if (this.state.selectedEmailAgent === EMAIL_AGENT.SES) {
            this.setState((prevState) => ({
                ...prevState,
                showSESConfigModal: true,
            }))
        } else {
            this.setState((prevState) => ({
                ...prevState,
                showSMTPConfigModal: true,
            }))
        }
    }

    renderEmailAgentSelector() {
        if (this.showEmailAgents()) {
            const emailConfigAgentOptions =
                this.state.selectedEmailAgent === EMAIL_AGENT.SES ? 'sesConfigOptions' : 'smtpConfigOptions'
            const emailAgentConfig = this.state[emailConfigAgentOptions].find(
                (config) => config.id === this.state.emailAgentConfigId,
            )
            return (
                <div className="flexbox mb-20">
                    <RadioGroup
                        className="no-border"
                        value={this.state.selectedEmailAgent}
                        name="trigger-type"
                        onChange={this.changeEmailAgent}
                    >
                        <RadioGroupItem dataTestId="add-notification-ses-checkbox" value={EMAIL_AGENT.SES}>
                            {EMAIL_AGENT.SES}
                        </RadioGroupItem>
                        <RadioGroupItem dataTestId="add-notification-smtp-checkbox" value={EMAIL_AGENT.SMTP}>
                            {EMAIL_AGENT.SMTP}
                        </RadioGroupItem>
                    </RadioGroup>
                    <div className="w-300">
                        <Select
                            rootClassName=""
                            onChange={this.selectEmailAgentAccount}
                            value={this.state.emailAgentConfigId}
                        >
                            <Select.Button
                                dataTestIdDropdown="add-notification-select-agent-dropdown"
                                rootClassName="select-button--default h-36"
                            >
                                {emailAgentConfig
                                    ? emailAgentConfig.configName
                                    : `Select ${EMAIL_AGENT[this.state.selectedEmailAgent]} Account`}
                            </Select.Button>
                            {this.state[emailConfigAgentOptions].map((config) => (
                                <Select.Option
                                    dataTestIdMenuList={`add-notification-select-agent-menu-${config.configName}`}
                                    key={`${this.state.selectedEmailAgent}_${config.id}`}
                                    value={config.id}
                                >
                                    <span className="dc__ellipsis-left">{config.configName}</span>
                                </Select.Option>
                            ))}
                            <div className="select__sticky-bottom" onClick={this.openAddEmailConfigPopup}>
                                <Add className="icon-dim-20 mr-5" /> Add {EMAIL_AGENT[this.state.selectedEmailAgent]}
                                Account
                            </div>
                        </Select>
                    </div>
                </div>
            )
        }
    }

    getEnvTeamAndClusterData(): void {
        Promise.all([getEnvironmentListMin(), getTeamListMin(), getClusterListMin()]).then(([environments, teams, clusters]) => {
            const state = { ...this.state }
            state.options.environment = [
                {
                    environment_name: 'All non-prod environments',
                    // parseInt can be removed once BE supports identifiers instead
                    id: parseInt(SelectAllGroupedResourceIdentifiers.allExistingAndFutureNonProdEnvironments),
                },
                {
                    environment_name: 'All prod environments',
                    id: parseInt(SelectAllGroupedResourceIdentifiers.allExistingAndFutureProdEnvironments),
                },
                ...(environments?.result ?? []),
            ].map((elem) => {
                return {
                    label: `${elem.environment_name.toLowerCase()}`,
                    value: elem.id,
                    type: FilterOptions.ENVIRONMENT,
                }
            })
            state.options.project = (teams?.result ?? []).map((elem) => {
                return {
                    label: `${elem.name.toLowerCase()}`,
                    value: elem.id,
                    type: FilterOptions.PROJECT,
                }
            })
            state.options.cluster = (clusters?.result ?? []).map(({ name, id }) => {
                return {
                    label: `${name.toLowerCase()}`,
                    value: id,
                    type: FilterOptions.CLUSTER,
                }
            })
            this.setState(state)
        })
    }

    getData(text) {
        this.setState({ isApplistLoading: true })
        if (text.length > 2) {
            this.abortController.abort()
            this.abortController = new AbortController()

            getAppListMin(null, { signal: this.abortController.signal }, text)
                .then((response) => {
                    const state = { ...this.state }
                    state.options.application = response.result.map((elem) => {
                        return {
                            label: `${elem.name.toLowerCase()}`,
                            value: elem.id,
                            type: FilterOptions.APPLICATION,
                        }
                    })
                    state.isApplistLoading = false
                    this.setState(state)
                })
                .catch((error) => {
                    if (!getIsRequestAborted(error)) {
                        showError(error)
                        this.setState({ isApplistLoading: false })
                    }
                })
        } else {
            this.setState((prevState) => ({
                ...prevState,
                options: {
                    ...prevState.options,
                    application: [],
                },
                isApplistLoading: false,
            }))
        }
    }

    renderSelectPipelines() {
        const unsavedFilter = this.state.appliedFilters.find((e) => e.type && !e.value)
        let options = this.filterOptionsMain
        if (unsavedFilter) {
            const input = this.state.filterInput.toLowerCase()
            if (unsavedFilter.type === FilterOptions.ENVIRONMENT) {
                options =
                    input.length === 0
                        ? this.state.options.environment
                        : this.state.options.environment.filter((filter) => filter.label.indexOf(input) >= 0)
            } else if (unsavedFilter.type === FilterOptions.PROJECT) {
                options =
                    input.length === 0
                        ? this.state.options.project
                        : this.state.options.project.filter((filter) => filter.label.indexOf(input) >= 0)
            } else if (unsavedFilter.type === FilterOptions.CLUSTER) {
                options =
                    input.length === 0
                        ? this.state.options.cluster
                        : this.state.options.cluster.filter((filter) => filter.label.indexOf(input) >= 0)
            } else {
                options = input.length <= 2 ? [] : this.state.options.application
            }
        }

        return (
            <div className="dc__position-rel">
                <div
                    data-testid="add-notification-select-pipeline"
                    className="form__input pipeline-filter__select-pipeline"
                    onClick={() => this.setState({ openSelectPipeline: true })}
                >
                    <Filter className="icon-dim-20 mr-5 dc__vertical-align-middle" />
                    {this.state.appliedFilters
                        .filter((p) => p.value)
                        .map((p) => {
                            return (
                                <span key={p.label} className="dc__devtron-tag m-2">
                                    {`${p.type}:${' '}${p.label}`}
                                    <button
                                        type="button"
                                        className="dc__transparent ml-5"
                                        onClick={(event) => this.clearFilter(p)}
                                    >
                                        <i className="fa fa-times-circle" aria-hidden="true" />
                                    </button>
                                </span>
                            )
                        })}
                    {unsavedFilter ? `${unsavedFilter.type}: ` : ''}
                    {unsavedFilter ? (
                        <input
                            data-testid="add-notification-select-pipeline-input"
                            autoComplete="off"
                            type="text"
                            className="pipeline-filter__search dc__transparent flex-1"
                            autoFocus
                            onKeyDown={this.handleFilterTag}
                            placeholder={
                                unsavedFilter.type === FilterOptions.APPLICATION
                                    ? 'Type 3 chars to see matching results'
                                    : 'Type to see matching results'
                            }
                            onChange={this.handleFilterInput}
                            value={this.state.filterInput}
                        />
                    ) : (
                        !this.state.appliedFilters.length && (
                            <span>Filter by Project, application, cluster and environment, search by name.</span>
                        )
                    )}
                </div>
                {this.state.openSelectPipeline ? (
                    <div className="dc__transparent-div" onClick={this.toggleSelectPipeline} />
                ) : null}
                {this.state.openSelectPipeline ? (
                    options.length > 0 ? (
                        <div className="pipeline-filter__menu">
                            <div className="select-button--pipeline-filter">Filter by</div>
                            {options.map((o) => {
                                return (
                                    <div
                                        data-testid={`add-notification-select-pipeline-filter-${o.label}`}
                                        className="pipeline-filter__option"
                                        key={o.label}
                                        onClick={() => {
                                            this.selectFilterType(o)
                                        }}
                                    >
                                        {o.label}
                                    </div>
                                )
                            })}
                        </div>
                    ) : this.state.filterInput.length <= 2 ? (
                        this.state.filterInput.length > 0 && (
                            <div className="pipeline-filter__menu select-button--pipeline-filter loading-applist">
                                {unsavedFilter.type === FilterOptions.APPLICATION
                                    ? 'Type 3 chars to see matching results'
                                    : 'Type to see matching results'}
                            </div>
                        )
                    ) : (
                        <div className="pipeline-filter__menu select-button--pipeline-filter loading-applist">
                            {this.state.isApplistLoading ? 'loading' : 'No matching results'}
                        </div>
                    )
                ) : null}
            </div>
        )
    }

    renderPipelineList() {
        if (this.state.view === ViewType.LOADING) {
            return (
                <div className="pipeline-list__empty-state">
                    <Progressing pageLoader />
                </div>
            )
        }
        if (!this.state.pipelineList.length) {
            return (
                <div className="pipeline-list__empty-state">
                    <Folder className="dc__block dc__m-auto" />
                    <p className="dc__empty__subtitle dc__m-auto">Apply filters to find matching pipelines</p>
                </div>
            )
        }
        return (
            <table className="pipeline-list__table">
                <tbody>
                    <tr className="pipeline-list__header">
                        <th className="pipeline-list__checkbox fw-6" />
                        <th className="pipeline-list__pipeline-name fw-6">Pipeline Name</th>
                        <th className="pipeline-list__pipeline-name fw-6">Application Name</th>
                        <th className="pipeline-list__type fw-6">Type</th>
                        <th className="pipeline-list__environment fw-6">Env/Branch</th>
                        <th className="pipeline-list__stages dc__block fw-6">Events</th>
                    </tr>
                    {this.state.pipelineList.map((row, rowIndex) => {
                        const _isCi = row.branch && row.type === 'CI'
                        let _isWebhookCi
                        if (_isCi) {
                            try {
                                JSON.parse(row.branch)
                                _isWebhookCi = true
                            } catch (e) {
                                _isWebhookCi = false
                            }
                        }

                        return (
                            <tr key={row.pipelineId + row.type} className="pipeline-list__row">
                                <td className="pipeline-list__checkbox">
                                    <Checkbox
                                        rootClassName=""
                                        isChecked={row.checkbox.isChecked}
                                        value={row.checkbox.value}
                                        onChange={(e) => {
                                            this.togglePipelineCheckbox(rowIndex)
                                        }}
                                    >
                                        <span />
                                    </Checkbox>
                                </td>
                                <td className="pipeline-list__pipeline-name">
                                    {row.appliedFilters.length ? (
                                        <>
                                            <i>All current and future pipelines matching.</i>
                                            <div className="dc__devtron-tag__container">
                                                {row.appliedFilters.map((e) => {
                                                    return (
                                                        <span key={e.type + e.name} className="dc__devtron-tag m-2">
                                                            {e?.type}: {e?.name}
                                                        </span>
                                                    )
                                                })}
                                            </div>{' '}
                                        </>
                                    ) : (
                                        row.pipelineName
                                    )}
                                </td>
                                <th className="pipeline-list__pipeline-name fw-6">{row?.appName}</th>
                                <td className="pipeline-list__type">{renderPipelineTypeIcon(row)}</td>
                                <td className="pipeline-list__environment">
                                    {_isCi && (
                                        <span className="flex left">
                                            <CiPipelineSourceConfig
                                                sourceType={
                                                    _isWebhookCi ? SourceTypeMap.WEBHOOK : SourceTypeMap.BranchFixed
                                                }
                                                sourceValue={row.branch}
                                                showTooltip
                                            />
                                        </span>
                                    )}
                                    {row.type === 'CD' ? row?.environmentName : ''}
                                </td>
                                <td className="pipeline-list__stages flexbox flex-justify">
                                    <Tippy className="default-tt" arrow placement="top" content="Trigger">
                                        <div>
                                            <Checkbox
                                                dataTestId={`trigger-notification-checkbox-${rowIndex}`}
                                                rootClassName="gray"
                                                isChecked={row.trigger}
                                                value={CHECKBOX_VALUE.CHECKED}
                                                onChange={(e) => {
                                                    this.handlePipelineEventType(rowIndex, 'trigger')
                                                }}
                                            >
                                                <span />
                                            </Checkbox>
                                        </div>
                                    </Tippy>
                                    <Tippy className="default-tt" arrow placement="top" content="Success">
                                        <div>
                                            <Checkbox
                                                dataTestId={`success-notification-checkbox-${rowIndex}`}
                                                rootClassName="green"
                                                isChecked={row.success}
                                                value={CHECKBOX_VALUE.CHECKED}
                                                onChange={(e) => {
                                                    this.handlePipelineEventType(rowIndex, 'success')
                                                }}
                                            >
                                                <span />
                                            </Checkbox>
                                        </div>
                                    </Tippy>
                                    <Tippy className="default-tt" arrow placement="top" content="Failure">
                                        <div>
                                            <Checkbox
                                                dataTestId={`failure-notification-checkbox-${rowIndex}`}
                                                rootClassName="red"
                                                isChecked={row.failure}
                                                value={CHECKBOX_VALUE.CHECKED}
                                                onChange={(e) => {
                                                    this.handlePipelineEventType(rowIndex, 'failure')
                                                }}
                                            >
                                                <span />
                                            </Checkbox>
                                        </div>
                                    </Tippy>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        )
    }

    renderSendTo() {
        return (
            <div className="form__row">
                <p className="add-notification__title mb-16">Send to</p>
                <CreatableSelect
                    classNamePrefix="add-notification-send-to"
                    placeholder="Enter email addresses or slack channels"
                    value={this.state.selectedChannels}
                    isMulti
                    isSearchable
                    isClearable={false}
                    backspaceRemovesValue
                    className="react-select--height-44"
                    components={{
                        MultiValueContainer: ({ ...props }) => (
                            <MultiValueContainer {...props} validator={validateEmail} />
                        ),
                        MultiValueRemove,
                        IndicatorSeparator: null,
                        DropdownIndicator,
                        ClearIndicator,
                        Option,
                        MenuList: (props) => {
                            return (
                                <components.MenuList {...props}>
                                    {props.children}
                                    <div className="pipeline-filter__sticky-bottom cursor">
                                        <div
                                            className="pipeline-filter__sticky-bottom cursor"
                                            onClick={(e) => {
                                                this.setState({ showSlackConfigModal: true })
                                            }}
                                        >
                                            <Slack className="icon-dim-24 mr-12" />
                                            Configure Slack Channel
                                        </div>
                                        <div
                                            className="pipeline-filter__sticky-bottom cursor"
                                            onClick={(e) => {
                                                this.setState({ showWebhookConfigModal: true })
                                            }}
                                        >
                                            <Webhook className="icon-dim-24 mr-12" />
                                            Configure Webhook
                                        </div>
                                    </div>
                                </components.MenuList>
                            )
                        },
                    }}
                    styles={{
                        ...multiSelectStyles,
                        menuList: (base) => {
                            return {
                                ...base,
                                position: 'relative',
                                paddingBottom: '0px',
                            }
                        },
                    }}
                    onChange={(selected) => {
                        this.selectChannel(selected)
                    }}
                    options={this.state.channelOptions}
                />
            </div>
        )
    }

    renderAddCard() {
        return (
            <div className="white-card white-card--no-padding">
                <div className="m-24">
                    {this.renderSendTo()}
                    {this.renderEmailAgentSelector()}
                    <div className="form__row">
                        <div className="add-notification__title mb-16">Select pipelines</div>
                        {this.renderSelectPipelines()}
                    </div>
                    {this.renderPipelineList()}
                </div>
                <div className="form__button-group-bottom flex right">
                    <Link
                        to={`${URLS.GLOBAL_CONFIG_NOTIFIER}/channels`}
                        className="cta cancel mr-16 dc__no-decor"
                        tabIndex={8}
                    >
                        Cancel
                    </Link>
                    <button
                        data-testid="add-notification-save-button"
                        type="submit"
                        className="cta"
                        tabIndex={7}
                        disabled={this.state.isLoading}
                        onClick={(event) => {
                            this.saveNotification()
                        }}
                    >
                        {this.state.isLoading ? <Progressing /> : 'Save'}
                    </button>
                </div>
            </div>
        )
    }

    renderSESConfigModal() {
        if (this.state.showSESConfigModal) {
            return (
                <SESConfigModal
                    sesConfigId={0}
                    shouldBeDefault={false}
                    selectSESFromChild={this.selectEmailAgentConfigIdFromChild}
                    onSaveSuccess={() => {
                        this.setState({ showSESConfigModal: false })
                        getChannelConfigs()
                            .then((response: any) => {
                                const providers = response?.result.sesConfigs || []
                                this.setState({ sesConfigOptions: providers })
                            })
                            .catch((error) => {
                                showError(error)
                            })
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
                    smtpConfigId={0}
                    shouldBeDefault={false}
                    selectSMTPFromChild={this.selectEmailAgentConfigIdFromChild}
                    onSaveSuccess={() => {
                        this.setState({ showSMTPConfigModal: false })
                        getChannelConfigs()
                            .then((response: any) => {
                                const providers = response?.result.smtpConfig || []
                                this.setState({ smtpConfigOptions: providers })
                            })
                            .catch((error) => {
                                showError(error)
                            })
                    }}
                    closeSMTPConfigModal={(event) => {
                        this.setState({ showSMTPConfigModal: false })
                    }}
                />
            )
        }
    }

    renderShowSlackConfigModal() {
        if (this.state.showSlackConfigModal) {
            return (
                <SlackConfigModal
                    slackConfigId={0}
                    onSaveSuccess={() => {
                        this.setState({ showSlackConfigModal: false })
                        this.getInitialData()
                    }}
                    closeSlackConfigModal={() => {
                        this.setState({ showSlackConfigModal: false })
                    }}
                />
            )
        }
    }

    renderShowWebhookConfigModal() {
        if (this.state.showWebhookConfigModal) {
            return (
                <WebhookConfigModal
                    webhookConfigId={0}
                    onSaveSuccess={this.onSaveWebhookConfig}
                    closeWebhookConfigModal={() => {
                        this.setState({ showWebhookConfigModal: false })
                    }}
                />
            )
        }
    }

    onSaveWebhookConfig() {
        this.setState({ showWebhookConfigModal: false })
        this.getInitialData()
    }

    render() {
        return (
            <ErrorBoundary>
                <div className="add-notification-page">
                    <div data-testid="add-notifications-heading-title" className="form__title mb-16">
                        Add Notifications
                    </div>
                    {this.renderAddCard()}
                    {this.renderShowSlackConfigModal()}
                    {this.renderSESConfigModal()}
                    {this.renderSMTPConfigModal()}
                    {this.renderShowWebhookConfigModal()}
                </div>
            </ErrorBoundary>
        )
    }
}
