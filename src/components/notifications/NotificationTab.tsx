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

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    Checkbox,
    CHECKBOX_VALUE,
    Chip,
    CiPipelineSourceConfig,
    ComponentSizeType,
    ConfirmationModal,
    ConfirmationModalVariantType,
    EMPTY_STATE_STATUS,
    GenericEmptyState,
    Icon,
    Pagination,
    PopupMenu,
    Progressing,
    Reload,
    showError,
    SourceTypeMap,
    stopPropagation,
    TOAST_ACCESS_DENIED,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'

import { InValidHostUrlWarningBlock } from '@Components/common'

import EmptyImage from '../../assets/img/ic-empty-notifications.png'
import { URLS, ViewType } from '../../config'
import { getHostURLConfiguration } from '../../services/service'
import { ModifyRecipientsModal } from './ModifyRecipientsModal'
import {
    deleteNotifications,
    getChannelsAndEmailsFilteredByEmail,
    getNotificationConfigurations,
    updateNotificationEvents,
} from './notifications.service'
import { getRecipientChipStartIcon, renderPipelineTypeIcon } from './notifications.util'
import { NotificationPipelineType, NotificationTabState } from './types'
import { ModifyRecipientPopUp } from './ModifyRecipientPopUp'
import { EVENT_ID } from './constants'

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
                value: CHECKBOX_VALUE.INTERMEDIATE,
            },
            events: {
                trigger: {
                    isChecked: false,
                    value: CHECKBOX_VALUE.INTERMEDIATE,
                },
                success: {
                    isChecked: false,
                    value: CHECKBOX_VALUE.INTERMEDIATE,
                },
                failure: {
                    isChecked: false,
                    value: CHECKBOX_VALUE.INTERMEDIATE,
                },
                configApproval: {
                    isChecked: false,
                    value: CHECKBOX_VALUE.INTERMEDIATE,
                },
                imageApproval: {
                    isChecked: false,
                    value: CHECKBOX_VALUE.INTERMEDIATE,
                },
            },
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
            selectedNotificationList: [],
        }
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

    getHostURLConfig = () => {
        getHostURLConfiguration()
            .then((response) => {
                this.setState({ hostURLConfig: response.result })
            })
            .catch(() => {})
    }

    getAllNotifications = () => {
        getNotificationConfigurations(this.state.pagination.offset, this.state.pagination.pageSize)
            .then((response: any) => {
                this.setState({
                    view: ViewType.FORM,
                    payloadUpdateEvents: [],
                    notificationList: response.result.settings,
                    headerCheckbox: {
                        isChecked: false,
                        value: CHECKBOX_VALUE.INTERMEDIATE,
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

    getChannels = () => {
        getChannelsAndEmailsFilteredByEmail()
            .then((response) => {
                let list: any[] = response.result || []
                list = list.map((item) => ({
                    label: item.recipient,
                    value: item.recipient,
                    data: item,
                }))
                this.setState({ channelList: list })
            })
            .catch((error) => {
                this.setState({ disableEdit: true })
            })
    }

    changePage = (pageNo, pageSize?): void => {
        const state = { ...this.state }
        state.view = ViewType.LOADING
        state.pagination.offset = pageSize ? 0 : (pageNo - 1) * this.state.pagination.pageSize
        state.pagination.pageSize = pageSize ?? state.pagination.pageSize
        this.setState(state, () => {
            this.getAllNotifications()
        })
    }

    changePageSize = (pageSize): void => {
        this.changePage(1, pageSize)
    }

    toggleNotification = (id: number): void => {
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
        state.headerCheckbox.value = areAllSelected ? CHECKBOX_VALUE.CHECKED : CHECKBOX_VALUE.INTERMEDIATE
        this.setState(state)
    }

    toggleAllNotification = (): void => {
        const state = { ...this.state }
        state.headerCheckbox.isChecked = !state.headerCheckbox.isChecked
        state.headerCheckbox.value = state.headerCheckbox.isChecked
            ? CHECKBOX_VALUE.CHECKED
            : CHECKBOX_VALUE.INTERMEDIATE
        state.notificationList = state.notificationList.map((config) => {
            config.isSelected = state.headerCheckbox.isChecked
            return config
        })
        this.setState(state)
        this.setState({ selectedNotificationList: state.notificationList.filter((row) => row.isSelected) })
    }

    onOpenEditNotificationMenu = (): void => {
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
                if (row.configApproval) {
                    eventTypeIds.push(4)
                }
                if (row.imageApproval) {
                    eventTypeIds.push(7)
                }

                return {
                    id: row.id,
                    eventTypeIds,
                    trigger: row.trigger,
                    success: row.success,
                    failure: row.failure,
                    configApproval: row.configApproval,
                    imageApproval: row.imageApproval,
                }
            })
        let isAnyTriggerEventSelected = false
        let isAnySuccessEventSelected = false
        let isAnyFailureEventSelected = false
        let isAnyConfigApprovalEventSelected = false
        let isAnyImageApprovalEventSelected = false
        let areAllTriggerEventSelected = true
        let areAllSuccessEventSelected = true
        let areAllFailureEventSelected = true
        let areAllConfigApprovalEventSelected = true
        let areAllImageApprovalEventSelected = true
        for (let i = 0; i < allSelectedRows.length; i++) {
            isAnyTriggerEventSelected = isAnyTriggerEventSelected || allSelectedRows[i].trigger
            isAnySuccessEventSelected = isAnySuccessEventSelected || allSelectedRows[i].success
            isAnyFailureEventSelected = isAnyFailureEventSelected || allSelectedRows[i].failure
            isAnyConfigApprovalEventSelected = isAnyConfigApprovalEventSelected || allSelectedRows[i].configApproval
            isAnyImageApprovalEventSelected = isAnyImageApprovalEventSelected || allSelectedRows[i].imageApproval
            areAllTriggerEventSelected = areAllTriggerEventSelected && allSelectedRows[i].trigger
            areAllSuccessEventSelected = areAllSuccessEventSelected && allSelectedRows[i].success
            areAllFailureEventSelected = areAllFailureEventSelected && allSelectedRows[i].failure
            areAllConfigApprovalEventSelected = areAllConfigApprovalEventSelected && allSelectedRows[i].configApproval
            areAllImageApprovalEventSelected = areAllImageApprovalEventSelected && allSelectedRows[i].imageApproval
        }
        this.setState({
            events: {
                trigger: {
                    isChecked: isAnyTriggerEventSelected,
                    value: areAllTriggerEventSelected ? CHECKBOX_VALUE.CHECKED : CHECKBOX_VALUE.INTERMEDIATE,
                },
                success: {
                    isChecked: isAnySuccessEventSelected,
                    value: areAllSuccessEventSelected ? CHECKBOX_VALUE.CHECKED : CHECKBOX_VALUE.INTERMEDIATE,
                },
                failure: {
                    isChecked: isAnyFailureEventSelected,
                    value: areAllFailureEventSelected ? CHECKBOX_VALUE.CHECKED : CHECKBOX_VALUE.INTERMEDIATE,
                },
                configApproval: {
                    isChecked: isAnyConfigApprovalEventSelected,
                    value: areAllConfigApprovalEventSelected ? CHECKBOX_VALUE.CHECKED : CHECKBOX_VALUE.INTERMEDIATE,
                },
                imageApproval: {
                    isChecked: isAnyImageApprovalEventSelected,
                    value: areAllImageApprovalEventSelected ? CHECKBOX_VALUE.CHECKED : CHECKBOX_VALUE.INTERMEDIATE,
                },
            },
            payloadUpdateEvents: allSelectedRows,
        })
    }

    onChangeCheckboxHandler = (e, value) => () => {
        stopPropagation(e)
        const state = { ...this.state }
        state.events[value] = {
            isChecked: !state.events[value].isChecked,
            value: !state.events[value].isChecked ? CHECKBOX_VALUE.CHECKED : CHECKBOX_VALUE.INTERMEDIATE,
        }
        state.payloadUpdateEvents = state.payloadUpdateEvents.map((row) => {
            if (state.events[value].isChecked) {
                row.eventTypeIds.push(EVENT_ID[value])
            } else {
                row.eventTypeIds = row.eventTypeIds.filter((id) => id !== EVENT_ID[value])
            }
            return row
        })
        this.setState(state)
    }

    updateNotificationEvents = (): void => {
        this.setState({ view: ViewType.LOADING })
        const payload = this.state.payloadUpdateEvents.map((row) => ({
            id: row.id,
            eventTypeIds: row.eventTypeIds,
        }))
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

    deleteNotifications = async () => {
        this.setState({ showDeleteDialog: true, deleting: true })
        const candidates = this.state.notificationList.filter((n) => n.isSelected)
        try {
            await deleteNotifications(candidates, this.state.singleDeletedId)
            this.setState({ showDeleteDialog: false })
            this.getAllNotifications()
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: 'Deleted Successfully',
            })
        } catch (error) {
            showError(error)
        } finally {
            this.setState({ deleting: false })
        }
    }

    closeConfirmationModal = () => this.setState({ showDeleteDialog: false })

    renderDeleteDialog = () => {
        const notificationCount = this.state.singleDeletedId
            ? [this.state.singleDeletedId]
            : this.state.notificationList.filter((n) => n.isSelected)
        return (
            <ConfirmationModal
                title={`Delete ${notificationCount.length} notification configuration(s)`}
                variant={ConfirmationModalVariantType.delete}
                subtitle="Recipients will stop receiving notifications for selected pipelines."
                buttonConfig={{
                    secondaryButtonConfig: {
                        text: 'Cancel',
                        onClick: this.closeConfirmationModal,
                    },
                    primaryButtonConfig: {
                        text: 'Delete',
                        onClick: this.deleteNotifications,
                        isLoading: this.state.deleting,
                        disabled: this.state.deleting,
                    },
                }}
                handleClose={this.closeConfirmationModal}
            />
        )
    }

    createNewNotification = () => {
        if (this.state.disableEdit) {
            ToastManager.showToast({
                variant: ToastVariantType.notAuthorized,
                description: TOAST_ACCESS_DENIED.SUBTITLE,
            })
        } else {
            this.props.history.push(URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_NOTIFICATIONS_ADD_NEW)
        }
    }

    renderAddNotificationButton = () => (
        <Button
            text="Add Notification"
            variant={ButtonVariantType.primary}
            size={ComponentSizeType.medium}
            onClick={this.createNewNotification}
            dataTestId="add-notification-button"
            startIcon={<Icon name="ic-add" color={null} />}
        />
    )

    renderGenericEmptyState = () => (
        <GenericEmptyState
            image={EmptyImage}
            title={EMPTY_STATE_STATUS.NOTIFICATION_TAB.TITLE}
            subTitle={EMPTY_STATE_STATUS.NOTIFICATION_TAB.SUBTITL}
            isButtonAvailable
            renderButton={this.renderAddNotificationButton}
        />
    )

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

    applyModifyEvents = () => {
        if (this.state.disableEdit) {
            ToastManager.showToast({
                variant: ToastVariantType.notAuthorized,
                description: TOAST_ACCESS_DENIED.SUBTITLE,
            })
        } else {
            this.updateNotificationEvents()
        }
    }

    showModifyModal = (): void => {
        this.validateAccess({ showModifyRecipientsModal: !this.state.showModifyRecipientsModal })
    }

    renderModifyEventPopUpBody = () => (
        <PopupMenu.Body>
            <ModifyRecipientPopUp
                events={this.state.events}
                applyModifyEvents={this.applyModifyEvents}
                onChangeCheckboxHandler={this.onChangeCheckboxHandler}
                selectedNotificationList={this.state.selectedNotificationList}
            />
        </PopupMenu.Body>
    )

    renderBulkOptions = () => {
        if (this.state.headerCheckbox.isChecked) {
            return (
                <div className="flex left dc__gap-16">
                    <Button
                        dataTestId="notification-delete-button"
                        icon={<Icon name="ic-delete" color={null} />}
                        variant={ButtonVariantType.borderLess}
                        style={ButtonStyleType.neutral}
                        ariaLabel="Delete Notifications"
                        onClick={this.showDeleteModal}
                        showAriaLabelInTippy
                    />
                    <PopupMenu
                        onToggleCallback={(isOpen) => {
                            if (isOpen) {
                                this.onOpenEditNotificationMenu()
                            }
                        }}
                    >
                        <PopupMenu.Button rootClassName="popup-button--notification-tab">
                            <Icon
                                name="ic-bell"
                                color={null}
                                size={20}
                                tooltipProps={{ content: 'Modify events', alwaysShowTippyOnHover: true }}
                            />
                        </PopupMenu.Button>
                        {this.renderModifyEventPopUpBody()}
                    </PopupMenu>

                    <Button
                        dataTestId="button__modify-recipients"
                        icon={<Icon name="ic-users" color={null} />}
                        variant={ButtonVariantType.borderLess}
                        style={ButtonStyleType.neutral}
                        ariaLabel="Modify Recipients"
                        onClick={this.showModifyModal}
                        showAriaLabelInTippy
                    />
                </div>
            )
        }
    }

    onChangePipelineCheckbox = (e) => {
        stopPropagation(e)
        this.toggleAllNotification()
    }

    onClickDeleteButton = (e) => {
        this.validateAccess({
            showDeleteDialog: !this.state.showDeleteDialog,
            singleDeletedId: +e.currentTarget.getAttribute('data-id'),
        })
    }

    onClickToggleNotification = (id) => (e) => {
        stopPropagation(e)
        this.toggleNotification(id)
        this.setState({ selectedNotificationList: this.state.notificationList.filter((row) => row.isSelected) })
    }

    renderPipelineList = () => (
        <table className="flexbox-col flex-grow-1">
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
                    <th className="pipeline-list__pipeline-name fw-6">Resource</th>
                    <th className="pipeline-list__app-name fw-6">Application Name</th>
                    <th className="pipeline-list__type fw-6">Type</th>
                    <th className="pipeline-list__environment fw-6">Env/Branch</th>
                    <th className="pipeline-list__stages fw-6">Events</th>
                    <th className="pipeline-list__recipients fw-6">Recipients</th>
                    <th className="pipeline-list__hover " />
                </tr>
                {this.state.notificationList.map((row) => {
                    const _isCi = row.branch && row.pipelineType === NotificationPipelineType.CI
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
                                    value={row.isSelected ? CHECKBOX_VALUE.CHECKED : CHECKBOX_VALUE.INTERMEDIATE}
                                    onChange={this.onClickToggleNotification(row.id)}
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
                                        <i>{row.pipelineType === NotificationPipelineType.BASE ? 'Base configuration matching:' : 'All existing and future deployment pipelines matching:'}</i>
                                        <div className='flex left dc__gap-6'>
                                            {row.appliedFilters.project.map((element) => (
                                                <Chip
                                                    data-testid={`${row.pipelineType}-${element.name}`}
                                                    label={`Project: ${element.name}`}
                                                    size={ComponentSizeType.xs}
                                                />
                                            ))}
                                            {row.appliedFilters.application.map((element) => (
                                                <Chip
                                                    data-testid={`${row.pipelineType}-${element.name}`}
                                                    label={`Apps: ${element.name}`}
                                                    size={ComponentSizeType.xs}
                                                />
                                            ))}
                                            {row.appliedFilters.environment.map((element) => (
                                                <Chip
                                                    data-testid={`${row.pipelineType}-${element.name}`}
                                                    label={`Env: ${element.name}`}
                                                    size={ComponentSizeType.xs}
                                                />
                                            ))}
                                            {row.appliedFilters.cluster.map((element) => (
                                                <Chip
                                                    data-testid={`${row.pipelineType}-${element.name}`}
                                                    label={`Cluster: ${element.name}`}
                                                    size={ComponentSizeType.xs}
                                                />
                                            ))}
                                        </div>
                                    </>
                                ) : null}
                            </td>
                            <td className="pipeline-list__app-name">{row?.appName}</td>
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
                                {row.pipelineType === NotificationPipelineType.CD ? row?.environmentName : ''}
                            </td>
                            <td className="pipeline-list__stages p-10">
                                <div className="flexbox flex-justify dc__gap-12">
                                    {row.trigger ? (
                                        <Icon
                                            name="ic-play-outline"
                                            color={null}
                                            tooltipProps={{
                                                content: 'Trigger',
                                                alwaysShowTippyOnHover: true,
                                            }}
                                        />
                                    ) : (
                                        <div className="icon-dim-20" />
                                    )}
                                    {row.success ? (
                                        <Icon
                                            name="ic-check"
                                            color={null}
                                            tooltipProps={{
                                                content: 'Success',
                                                alwaysShowTippyOnHover: true,
                                            }}
                                        />
                                    ) : (
                                        <div className="icon-dim-20" />
                                    )}
                                    {row.failure ? (
                                        <Icon
                                            name="ic-close-small"
                                            color={null}
                                            tooltipProps={{
                                                content: 'Failure',
                                                alwaysShowTippyOnHover: true,
                                            }}
                                        />
                                    ) : (
                                        <div className="icon-dim-20" />
                                    )}
                                    {row.configApproval ? (
                                        <Icon
                                            name="ic-code"
                                            color={null}
                                            tooltipProps={{
                                                content: 'Config Change Approval',
                                                alwaysShowTippyOnHover: true,
                                            }}
                                        />
                                    ) : (
                                        <div className="icon-dim-20" />
                                    )}

                                    {row.imageApproval ? (
                                        <Icon
                                            name="ic-image-approve"
                                            color={null}
                                            tooltipProps={{
                                                content: 'Deployment Approval',
                                                alwaysShowTippyOnHover: true,
                                            }}
                                        />
                                    ) : (
                                        <div className="icon-dim-20" />
                                    )}
                                </div>
                            </td>
                            <td className="pipeline-list__recipients">
                                <div className="dc__devtron-tag__container">
                                    {row.providers.map((p) => (
                                        <Chip
                                            data-testid={`recipient-${p.configId}`}
                                            label={p.recipient ? p.recipient : p.name}
                                            size={ComponentSizeType.xs}
                                            startIcon={getRecipientChipStartIcon(p.dest)}
                                        />
                                    ))}
                                </div>
                            </td>
                            <td className="pipeline-list__hover flex p-10">
                                <Button
                                    icon={<Icon name="ic-delete" color={null} />}
                                    ariaLabel="Delete"
                                    variant={ButtonVariantType.borderLess}
                                    style={ButtonStyleType.negativeGrey}
                                    size={ComponentSizeType.medium}
                                    data-id={row.id}
                                    onClick={this.onClickDeleteButton}
                                    dataTestId={`delete-notification-${row.id}-button`}
                                />
                            </td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
    )

    renderPagination = () => {
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

    renderBody = () => (
        <div className="flexbox-col flex-grow-1 dc__gap-16">
            <Button
                variant={ButtonVariantType.primary}
                text="Add New"
                size={ComponentSizeType.medium}
                onClick={this.createNewNotification}
                dataTestId="delete-notification-button"
                startIcon={<Icon name="ic-add" color={null} />}
            />
            {this.renderBulkOptions()}
            {this.renderPipelineList()}
            {this.renderPagination()}
        </div>
    )

    renderModifyRecipients = () => {
        if (this.state.showModifyRecipientsModal) {
            const allCandidates = this.state.notificationList
                .filter((row) => row.isSelected)
                .map((row) => ({ id: row.id, providers: row.providers }))
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

    renderHostErrorMessage = () => {
        if (!this.state.hostURLConfig || this.state.hostURLConfig.value !== window.location.origin) {
            return <InValidHostUrlWarningBlock />
        }
    }

    render() {
        if (this.state.view === ViewType.LOADING) {
            return <Progressing pageLoader />
        }
        if (this.state.view === ViewType.ERROR) {
            return <Reload />
        }
        if (!this.state.notificationList.length) {
            return (
                <div className="flexbox-col flex-grow-1">
                    {this.renderHostErrorMessage()}
                    {this.renderGenericEmptyState()}
                </div>
            )
        }
        return (
            <div className="flexbox-col flex-grow-1 p-16 dc__gap-16">
                {this.renderHostErrorMessage()}
                {this.renderBody()}
                {this.state.showDeleteDialog && this.renderDeleteDialog()}
                {this.renderModifyRecipients()}
            </div>
        )
    }
}
