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

import { Component } from 'react'
import Tippy from '@tippyjs/react'
import {
    showError,
    Progressing,
    DeleteDialog,
    PopupMenu,
    Checkbox,
    Reload,
    GenericEmptyState,
    CiPipelineSourceConfig,
    EMPTY_STATE_STATUS,
    Pagination,
    ToastManager,
    ToastVariantType,
    TOAST_ACCESS_DENIED,
} from '@devtron-labs/devtron-fe-common-lib'
import { NavLink } from 'react-router-dom'
import EmptyImage from '../../assets/img/ic-empty-notifications.png'
import {
    getNotificationConfigurations,
    deleteNotifications,
    updateNotificationEvents,
    getChannelsAndEmailsFilteredByEmail,
} from './notifications.service'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as Delete, ReactComponent as Trash } from '../../assets/icons/ic-delete.svg'
import { ReactComponent as Bell } from '../../assets/icons/ic-bell.svg'
import { ReactComponent as User } from '../../assets/icons/ic-users.svg'
import { ReactComponent as Slack } from '../../assets/img/slack-logo.svg'
import { ReactComponent as Email } from '../../assets/icons/ic-mail.svg'
import { ReactComponent as Check } from '../../assets/icons/ic-check.svg'
import { ReactComponent as Play } from '../../assets/icons/ic-play.svg'
import { ReactComponent as Info } from '../../assets/icons/ic-info-outline.svg'
import { ReactComponent as Error } from '../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as Webhook } from '../../assets/icons/ic-CIWebhook.svg'
import { ViewType, URLS, SourceTypeMap } from '../../config'
import { ModifyRecipientsModal } from './ModifyRecipientsModal'
import { getHostURLConfiguration } from '../../services/service'
import { HostURLConfig } from '../../services/service.types'
import { renderPipelineTypeIcon } from './notifications.util'

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

export interface NotificationTabState {
    view: string
    statusCode: number
    notificationList: NotificationConfiguration[]
    channelList: any[]
    showDeleteDialog: boolean
    showModifyRecipientsModal: boolean
    headerCheckbox: {
        isChecked: boolean
        value: 'INTERMEDIATE' | 'CHECKED'
    }
    triggerCheckbox: {
        isChecked: boolean
        value: 'INTERMEDIATE' | 'CHECKED'
    }
    successCheckbox: {
        isChecked: boolean
        value: 'INTERMEDIATE' | 'CHECKED'
    }
    failureCheckbox: {
        isChecked: boolean
        value: 'INTERMEDIATE' | 'CHECKED'
    }
    payloadUpdateEvents: Array<{ id: number; eventTypeIds: number[] }>
    pagination: {
        size: number
        pageSize: number
        offset: number
    }
    hostURLConfig: HostURLConfig
    deleting: boolean
    confirmation: boolean
    singleDeletedId: number
    disableEdit: boolean
}

export class NotificationTab extends Component<any, NotificationTabState> {
    constructor(props) {
        super(props)
        this.state = {
            view: ViewType.LOADING,
            statusCode: 0,
            notificationList: [],
            channelList: [],
            showModifyRecipientsModal: false,
            showDeleteDialog: false,
            headerCheckbox: {
                isChecked: false,
                value: 'INTERMEDIATE',
            },
            triggerCheckbox: {
                isChecked: false,
                value: 'INTERMEDIATE',
            },
            successCheckbox: {
                isChecked: false,
                value: 'INTERMEDIATE',
            },
            failureCheckbox: {
                isChecked: false,
                value: 'INTERMEDIATE',
            },
            // TODO: create new component for modify events menu
            payloadUpdateEvents: [],
            pagination: {
                size: 20,
                pageSize: 20,
                offset: 0,
            },
            hostURLConfig: undefined,
            deleting: false,
            confirmation: false,
            singleDeletedId: 0,
            disableEdit: false,
        }
        this.updateNotificationEvents = this.updateNotificationEvents.bind(this)
        this.changePageSize = this.changePageSize.bind(this)
        this.changePage = this.changePage.bind(this)
        this.onChangePipelineCheckbox = this.onChangePipelineCheckbox.bind(this)
    }

    componentDidMount() {
        this.getHostURLConfig()
        this.getAllNotifications()
        this.getChannels()
    }

    setDeleting = () => {
        this.setState({
            deleting: true,
        })
    }

    getHostURLConfig() {
        getHostURLConfiguration()
            .then((response) => {
                this.setState({ hostURLConfig: response.result })
            })
            .catch((error) => {})
    }

    getAllNotifications() {
        getNotificationConfigurations(this.state.pagination.offset, this.state.pagination.pageSize)
            .then((response: any) => {
                this.setState({
                    view: ViewType.FORM,
                    payloadUpdateEvents: [],
                    notificationList: response.result.settings,
                    headerCheckbox: {
                        isChecked: false,
                        value: 'INTERMEDIATE',
                    },
                    pagination: {
                        ...this.state.pagination,
                        size: response.result.total,
                    },
                })
            })
            .catch((error) => {
                showError(error)
                this.setState({ view: ViewType.ERROR })
            })
    }

    getChannels() {
        getChannelsAndEmailsFilteredByEmail()
            .then((response) => {
                let list: any[] = response.result || []
                list = list.map((item) => {
                    return {
                        label: item.recipient,
                        value: item.recipient,
                        data: item,
                    }
                })
                this.setState({ channelList: list })
            })
            .catch((error) => {
                this.setState({ disableEdit: true })
            })
    }

    changePage(pageNo, pageSize?): void {
        const state = { ...this.state }
        state.view = ViewType.LOADING
        state.pagination.offset = pageSize ? 0 : (pageNo - 1) * this.state.pagination.pageSize
        state.pagination.pageSize = pageSize ?? state.pagination.pageSize
        this.setState(state, () => {
            this.getAllNotifications()
        })
    }

    changePageSize(pageSize): void {
        this.changePage(1, pageSize)
    }

    toggleNotification(id: number): void {
        const state = { ...this.state }
        let isAnySelected = false
        let areAllSelected = true
        state.notificationList = state.notificationList.map((config) => {
            if (config.id === id) {
                config.isSelected = !config.isSelected
            }
            isAnySelected = isAnySelected || config.isSelected
            areAllSelected = areAllSelected && config.isSelected
            return config
        })
        state.headerCheckbox.isChecked = isAnySelected
        state.headerCheckbox.value = areAllSelected ? 'CHECKED' : 'INTERMEDIATE'
        this.setState(state)
    }

    toggleAllNotification(): void {
        const state = { ...this.state }
        state.headerCheckbox.isChecked = !state.headerCheckbox.isChecked
        state.headerCheckbox.value = state.headerCheckbox.isChecked ? 'CHECKED' : 'INTERMEDIATE'
        state.notificationList = state.notificationList.map((config) => {
            config.isSelected = state.headerCheckbox.isChecked
            return config
        })
        this.setState(state)
    }

    onOpenEditNotficationMenu(): void {
        const allSelectedRows = this.state.notificationList
            .filter((row) => row.isSelected)
            .map((row) => {
                const eventTypeIds = []
                if (row.trigger) {
                    eventTypeIds.push(1)
                }
                if (row.success) {
                    eventTypeIds.push(2)
                }
                if (row.failure) {
                    eventTypeIds.push(3)
                }

                return {
                    id: row.id,
                    eventTypeIds,
                    trigger: row.trigger,
                    success: row.success,
                    failure: row.failure,
                }
            })
        let isAnyTriggerEventSelected = false
        let isAnySuccessEventSelected = false
        let isAnyFailureEventSelected = false
        let areAllTriggerEventSelected = true
        let areAllSucessEventSelected = true
        let areAllFailureEventSelected = true
        for (let i = 0; i < allSelectedRows.length; i++) {
            isAnyTriggerEventSelected = isAnyTriggerEventSelected || allSelectedRows[i].trigger
            isAnySuccessEventSelected = isAnySuccessEventSelected || allSelectedRows[i].success
            isAnyFailureEventSelected = isAnyFailureEventSelected || allSelectedRows[i].failure
            areAllTriggerEventSelected = areAllTriggerEventSelected && allSelectedRows[i].trigger
            areAllSucessEventSelected = areAllSucessEventSelected && allSelectedRows[i].success
            areAllFailureEventSelected = areAllFailureEventSelected && allSelectedRows[i].failure
        }
        this.setState({
            triggerCheckbox: {
                isChecked: isAnyTriggerEventSelected,
                value: areAllTriggerEventSelected ? 'CHECKED' : 'INTERMEDIATE',
            },
            successCheckbox: {
                isChecked: isAnySuccessEventSelected,
                value: areAllSucessEventSelected ? 'CHECKED' : 'INTERMEDIATE',
            },
            failureCheckbox: {
                isChecked: isAnyFailureEventSelected,
                value: areAllFailureEventSelected ? 'CHECKED' : 'INTERMEDIATE',
            },
            payloadUpdateEvents: allSelectedRows,
        })
    }

    triggerCheckboxHandler(): void {
        const state = { ...this.state }
        state.triggerCheckbox = {
            isChecked: !state.triggerCheckbox.isChecked,
            value: !state.triggerCheckbox.isChecked ? 'CHECKED' : 'INTERMEDIATE',
        }
        state.payloadUpdateEvents = state.payloadUpdateEvents.map((row) => {
            if (state.triggerCheckbox.isChecked) {
                row.eventTypeIds.push(1)
            } else {
                row.eventTypeIds = row.eventTypeIds.filter((id) => id !== 1)
            }
            return row
        })
        this.setState(state)
    }

    successCheckboxHandler(): void {
        const state = { ...this.state }
        state.successCheckbox.isChecked = !state.successCheckbox.isChecked
        state.successCheckbox.value = state.successCheckbox.isChecked ? 'CHECKED' : 'INTERMEDIATE'
        state.payloadUpdateEvents = state.payloadUpdateEvents.map((row) => {
            if (state.successCheckbox.isChecked) {
                row.eventTypeIds.push(2)
            } else {
                row.eventTypeIds = row.eventTypeIds.filter((id) => id !== 2)
            }
            return row
        })
        this.setState(state)
    }

    failureCheckboxHandler(): void {
        const state = { ...this.state }
        state.failureCheckbox.isChecked = !state.failureCheckbox.isChecked
        state.failureCheckbox.value = state.failureCheckbox.isChecked ? 'CHECKED' : 'INTERMEDIATE'
        state.payloadUpdateEvents = state.payloadUpdateEvents.map((row) => {
            if (state.failureCheckbox.isChecked) {
                row.eventTypeIds.push(3)
            } else {
                row.eventTypeIds = row.eventTypeIds.filter((id) => id !== 3)
            }
            return row
        })
        this.setState(state)
    }

    updateNotificationEvents(event): void {
        this.setState({ view: ViewType.LOADING })
        const payload = this.state.payloadUpdateEvents.map((row) => {
            return {
                id: row.id,
                eventTypeIds: row.eventTypeIds,
            }
        })
        updateNotificationEvents(payload)
            .then((response) => {
                if (response) {
                    this.getAllNotifications()
                }
            })
            .catch((error) => {
                showError(error)
            })
    }

    deleteNotifications(): void {
        const candidates = this.state.notificationList.filter((n) => n.isSelected)
        deleteNotifications(candidates, this.state.singleDeletedId)
            .then((response) => {
                this.setState({ showDeleteDialog: false })
                this.getAllNotifications()
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: 'Deleted Successfully',
                })

            })
            .catch((error) => {
                showError(error)
            })
    }

    renderDeleteDialog() {
        if (this.state.showDeleteDialog) {
            const n = this.state.singleDeletedId
                ? [this.state.singleDeletedId]
                : this.state.notificationList.filter((n) => n.isSelected)
            return (
                <DeleteDialog
                    title={`Delete ${n.length} notification configuration(s)`}
                    description="Recipients will stop recieving notifications for selected pipilines."
                    closeDelete={() => {
                        this.setState({ showDeleteDialog: false })
                    }}
                    delete={() => {
                        this.deleteNotifications()
                    }}
                />
            )
        }
    }

    CreateNewNotification = () => {
        if (this.state.disableEdit) {
            ToastManager.showToast({
                variant: ToastVariantType.notAuthorized,
                description: TOAST_ACCESS_DENIED.SUBTITLE,
            })
        } else {
            this.props.history.push(URLS.GLOBAL_CONFIG_NOTIFIER_ADD_NEW)
        }
    }

    renderGenericState() {
        const renderGenericStateButton = () => {
            return (
                <button
                    data-testid="add-notification-button"
                    onClick={this.CreateNewNotification}
                    className="cta flex dc__no-decor"
                >
                    <Add className="icon-dim-20 mr-5" />
                    Add Notification
                </button>
            )
        }
        return (
            <GenericEmptyState
                image={EmptyImage}
                title={EMPTY_STATE_STATUS.NOTIFICATION_TAB.TITLE}
                subTitle={EMPTY_STATE_STATUS.NOTIFICATION_TAB.SUBTITL}
                isButtonAvailable
                renderButton={renderGenericStateButton}
            />
        )
    }

    validateAccess = (updateState): void => {
        if (this.state.disableEdit) {
            ToastManager.showToast({
                variant: ToastVariantType.notAuthorized,
                description: TOAST_ACCESS_DENIED.SUBTITLE,
            })
        } else {
            this.setState(updateState)
        }
    }

    showDeleteModal = (): void => {
        this.validateAccess({ showDeleteDialog: !this.state.showDeleteDialog, singleDeletedId: 0 })
    }

    applyModifyEvents = (event) => {
        if (this.state.disableEdit) {
           ToastManager.showToast({
               variant: ToastVariantType.notAuthorized,
               description: TOAST_ACCESS_DENIED.SUBTITLE,
           })
        } else {
            this.updateNotificationEvents(event)
        }
    }

    showModifyModal = (): void => {
        this.validateAccess({ showModifyRecipientsModal: !this.state.showModifyRecipientsModal })
    }

    renderOptions() {
        if (this.state.headerCheckbox.isChecked) {
            return (
                <div className="flex left mt-20 mb-20">
                    <Tippy placement="top" content="Delete">
                        <div className="flex">
                            <Delete
                                className="icon-dim-24 mr-20 notification-tab__option"
                                onClick={this.showDeleteModal}
                                data-testid="notification-delete-button"
                            />
                        </div>
                    </Tippy>
                    <PopupMenu
                        onToggleCallback={(isOpen) => {
                            if (isOpen) {
                                this.onOpenEditNotficationMenu()
                            }
                        }}
                    >
                        <PopupMenu.Button rootClassName="popup-button--notification-tab">
                            <Tippy placement="top" content="Modify Events">
                                <div className="flex">
                                    <Bell className="icon-dim-24 mr-20 notification-tab__option" />
                                </div>
                            </Tippy>
                        </PopupMenu.Button>
                        <PopupMenu.Body>
                            <ul className="dc__kebab-menu__list kebab-menu__list--notification-tab ">
                                <li key="edit" className="dc__kebab-menu__list-item flex-justify">
                                    <span>Trigger</span>
                                    <Checkbox
                                        rootClassName=""
                                        isChecked={this.state.triggerCheckbox.isChecked}
                                        value={this.state.triggerCheckbox.value}
                                        onChange={(e) => {
                                            this.triggerCheckboxHandler()
                                        }}
                                    >
                                        <span />
                                    </Checkbox>
                                </li>
                                <li key="success" className="dc__kebab-menu__list-item flex-justify">
                                    <span>Success</span>
                                    <Checkbox
                                        rootClassName=""
                                        isChecked={this.state.successCheckbox.isChecked}
                                        value={this.state.successCheckbox.value}
                                        onChange={(e) => {
                                            e.stopPropagation()
                                            this.successCheckboxHandler()
                                        }}
                                    >
                                        <span />
                                    </Checkbox>
                                </li>
                                <li key="failure" className="dc__kebab-menu__list-item flex-justify">
                                    <span>Failure</span>
                                    <Checkbox
                                        rootClassName=""
                                        isChecked={this.state.failureCheckbox.isChecked}
                                        value={this.state.failureCheckbox.value}
                                        onChange={(e) => {
                                            this.failureCheckboxHandler()
                                        }}
                                    >
                                        <span />
                                    </Checkbox>
                                </li>
                            </ul>
                            <div className="kebab-menu__sticky-bottom">
                                <button type="button" className="cta w-100" onClick={this.applyModifyEvents}>
                                    Apply
                                </button>
                            </div>
                        </PopupMenu.Body>
                    </PopupMenu>
                    <Tippy placement="top" content="Modify Recipients">
                        <div className="flex">
                            <User
                                className="icon-dim-24 mr-20 notification-tab__option"
                                onClick={this.showModifyModal}
                            />
                        </div>
                    </Tippy>
                </div>
            )
        }
    }

    onChangePipelineCheckbox(e) {
        e.stopPropagation()
        this.toggleAllNotification()
    }

    renderPipelineList() {
        return (
            <table className="pipeline-list__table">
                <tbody>
                    <tr className="pipeline-list__header">
                        <th className="pipeline-list__checkbox">
                            <Checkbox
                                rootClassName=""
                                isChecked={this.state.headerCheckbox.isChecked}
                                value={this.state.headerCheckbox.value}
                                onChange={this.onChangePipelineCheckbox}
                                dataTestId="notification-list"
                            >
                                <span />
                            </Checkbox>
                        </th>
                        <th className="pipeline-list__pipeline-name fw-6">Pipeline Name</th>
                        <th className="pipeline-list__pipeline-name fw-6">Application Name</th>
                        <th className="pipeline-list__type fw-6">Type</th>
                        <th className="pipeline-list__environment fw-6">Env/Branch</th>
                        <th className="pipeline-list__stages fw-6">Events</th>
                        <th className="pipeline-list__recipients fw-6">Recipients</th>
                        <th className="pipeline-list__hover " />
                    </tr>
                    {this.state.notificationList.map((row) => {
                        const _isCi = row.branch && row.pipelineType === 'CI'
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
                            <tr
                                key={row.id}
                                className={
                                    row.isSelected
                                        ? 'pipeline-list__row pipeline-list__row--selected'
                                        : 'pipeline-list__row'
                                }
                            >
                                <td className="pipeline-list__checkbox">
                                    <Checkbox
                                        rootClassName=""
                                        isChecked={row.isSelected}
                                        value="CHECKED"
                                        onChange={(e) => {
                                            e.stopPropagation()
                                            this.toggleNotification(row.id)
                                        }}
                                    >
                                        <span />
                                    </Checkbox>
                                </td>
                                <td className="pipeline-list__pipeline-name">
                                    {row.pipelineName ? row.pipelineName : ''}
                                    {row.appliedFilters.environment?.length ||
                                    row.appliedFilters.application.length ||
                                    row.appliedFilters.project?.length ||
                                    row.appliedFilters.cluster?.length ? (
                                        <>
                                            <i>All current and future pipelines matching.</i>
                                            <div className="dc__devtron-tag__container">
                                                {row.appliedFilters.project.map((element) => {
                                                    return (
                                                        <span
                                                            data-testid={`${row.pipelineType}-${element.name}`}
                                                            key={element.name}
                                                            className="dc__devtron-tag mr-5"
                                                        >
                                                            Project:{element.name}
                                                        </span>
                                                    )
                                                })}
                                                {row.appliedFilters.application.map((element) => {
                                                    return (
                                                        <span
                                                            data-testid={`${row.pipelineType}-${element.name}`}
                                                            key={element.name}
                                                            className="dc__devtron-tag mr-5"
                                                        >
                                                            App:{element.name}
                                                        </span>
                                                    )
                                                })}
                                                {row.appliedFilters.environment.map((element) => {
                                                    return (
                                                        <span
                                                            data-testid={`${row.pipelineType}-${element.name}`}
                                                            key={element.name}
                                                            className="dc__devtron-tag mr-5"
                                                        >
                                                            Env:{element.name}
                                                        </span>
                                                    )
                                                })}
                                                {row.appliedFilters.cluster.map((element) => {
                                                    return (
                                                        <span
                                                            data-testid={`${row.pipelineType}-${element.name}`}
                                                            key={element.name}
                                                            className="dc__devtron-tag mr-5"
                                                        >
                                                            Cluster:{element.name}
                                                        </span>
                                                    )
                                                })}
                                            </div>{' '}
                                        </>
                                    ) : null}
                                </td>
                                <td className="pipeline-list__pipeline-name">{row?.appName}</td>
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
                                    {row.pipelineType === 'CD' ? row?.environmentName : ''}
                                </td>
                                <td className="pipeline-list__stages flexbox flex-justify">
                                    {row.trigger ? (
                                        <Tippy placement="top" content="on trigger">
                                            <div className="flex">
                                                <Play className="icon-dim-20 icon-n5" />
                                            </div>
                                        </Tippy>
                                    ) : (
                                        <span className="icon-dim-20" />
                                    )}
                                    {row.success ? (
                                        <Tippy placement="top" content="on success">
                                            <div className="flex">
                                                <Check className="icon-dim-20 icon-n5" />
                                            </div>
                                        </Tippy>
                                    ) : (
                                        <span className="icon-dim-20" />
                                    )}
                                    {row.failure ? (
                                        <Tippy placement="top" content="on failure">
                                            <div className="flex">
                                                <Info className="icon-dim-20 icon-n5" />
                                            </div>
                                        </Tippy>
                                    ) : (
                                        <span className="icon-dim-20" />
                                    )}
                                </td>
                                <td className="pipeline-list__recipients">
                                    <div className="dc__devtron-tag__container">
                                        {row.providers.map((p) => {
                                            return (
                                                <div key={p.configId} className="dc__devtron-tag">
                                                    {p.dest === 'ses' ? <Email className="icon-dim-20 mr-5" /> : null}
                                                    {p.dest === 'slack' ? <Slack className="icon-dim-20 mr-5" /> : null}
                                                    {p.dest === 'email' ? <Email className="icon-dim-20 mr-5" /> : null}
                                                    {p.dest === 'smtp' ? <Email className="icon-dim-20 mr-5" /> : null}
                                                    {p.dest === 'webhook' ? (
                                                        <Webhook className="icon-dim-20 mr-5" />
                                                    ) : null}
                                                    {p.recipient ? p.recipient : p.name}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </td>
                                <td className="pipeline-list__hover flex">
                                    <Tippy className="default-tt" arrow={false} placement="top" content="Delete">
                                        <button
                                            type="button"
                                            className="dc__transparent dc__align-right"
                                            onClick={(event) => {
                                                this.validateAccess({
                                                    showDeleteDialog: !this.state.showDeleteDialog,
                                                    singleDeletedId: row.id,
                                                })
                                            }}
                                        >
                                            <Trash className="scn-5 icon-dim-20" />
                                        </button>
                                    </Tippy>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        )
    }

    renderPagination() {
        if (this.state.pagination.size) {
            return (
                <Pagination
                    rootClassName="flex dc__content-space px-20 dc__border-top"
                    offset={this.state.pagination.offset}
                    pageSize={this.state.pagination.pageSize}
                    size={this.state.pagination.size}
                    changePage={this.changePage}
                    changePageSize={this.changePageSize}
                />
            )
        }
        return null
    }

    renderBody() {
        return (
            <div className="notification-tab">
                <div
                    data-testid="add-new-notification-button"
                    onClick={this.CreateNewNotification}
                    style={{ width: '100px' }}
                    className="cta small flex dc__no-decor"
                >
                    <Add className="icon-dim-16 mr-5" />
                    Add New
                </div>
                {this.renderOptions()}
                {this.renderPipelineList()}
                {this.renderPagination()}
            </div>
        )
    }

    remderModifyRecipients() {
        if (this.state.showModifyRecipientsModal) {
            const allCandidates = this.state.notificationList
                .filter((row) => row.isSelected)
                .map((row) => {
                    return { id: row.id, providers: row.providers }
                })
            return (
                <ModifyRecipientsModal
                    notificationListFromParent={allCandidates}
                    channelList={this.state.channelList}
                    onSaveSuccess={() => {
                        this.setState({ view: ViewType.LOADING, showModifyRecipientsModal: false })
                        this.getAllNotifications()
                    }}
                    closeModifyRecipientsModal={() => {
                        this.setState({ showModifyRecipientsModal: false })
                    }}
                />
            )
        }
    }

    renderHostErrorMessage() {
        if (!this.state.hostURLConfig || this.state.hostURLConfig.value !== window.location.origin) {
            return (
                <div className="br-4 bw-1 er-2 pt-10 pb-10 pl-16 pr-16 bcr-1 mb-16 ml-20 mr-20 flex left">
                    <Error className="icon-dim-20 mr-8" />
                    <div className="cn-9 fs-13">
                        Host url is not configured or is incorrect. Reach out to your DevOps team (super-admin) to
                        &nbsp;
                        <NavLink className="dc__link-bold" to={URLS.GLOBAL_CONFIG_HOST_URL}>
                            Review and update
                        </NavLink>
                    </div>
                </div>
            )
        }
    }

    render() {
        if (this.state.view === ViewType.LOADING) {
            return (
                <div style={{ height: 'calc(100vh - 215px)' }}>
                    <Progressing pageLoader />
                </div>
            )
        }
        if (this.state.view === ViewType.ERROR) {
            return (
                <div style={{ height: 'calc(100vh - 215px)' }}>
                    <Reload />
                </div>
            )
        }
        if (!this.state.notificationList.length) {
            return (
                <div className="pt-16" style={{ height: 'calc(100vh - 215px)' }}>
                    {this.renderHostErrorMessage()}
                    {this.renderGenericState()}
                </div>
            )
        }
        return (
            <div className="bcn-0 pt-16" style={{ minHeight: 'calc(100vh - 215px)' }}>
                {this.renderHostErrorMessage()}
                {this.renderBody()}
                {this.renderDeleteDialog()}
                {this.remderModifyRecipients()}
                {this.state.confirmation && this.renderDeleteDialog()}
            </div>
        )
    }
}
