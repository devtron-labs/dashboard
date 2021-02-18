import React, { Component } from 'react';
import EmptyState from '../EmptyState/EmptyState';
import EmptyImage from '../../assets/img/ic-empty-notifications.png';
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg';
import { ReactComponent as Delete } from '../../assets/icons/ic-delete.svg';
import { ReactComponent as Bell } from '../../assets/icons/ic-bell.svg';
import { ReactComponent as User } from '../../assets/icons/ic-users.svg';
import { PopupMenu, Checkbox, Progressing, showError, DeleteDialog, Pagination } from '../common';
import { ReactComponent as Slack } from '../../assets/img/slack-logo.svg';
import { ReactComponent as Email } from '../../assets/icons/ic-mail.svg';
import { ReactComponent as Check } from '../../assets/icons/ic-check.svg';
import { ReactComponent as Play } from '../../assets/icons/ic-play.svg';
import { ReactComponent as Info } from '../../assets/icons/ic-info-outline.svg';
import { ViewType, URLS } from '../../config';
import { getNotificationConfigurations, deleteNotifications, updateNotificationEvents, getChannelsAndEmails } from './notifications.service';
import { ModifyRecipientsModal } from './ModifyRecipientsModal';
import { toast } from 'react-toastify';
import { Link, NavLink } from 'react-router-dom';
import Tippy from '@tippyjs/react';
import Reload from '../Reload/Reload';
import { ReactComponent as Error } from '../../assets/icons/ic-error-exclamation.svg';
import { getHostURLConfiguration } from '../../services/service';
import { HostURLConfig } from '../../services/service.types';

export interface NotificationConfiguration {
    id: number;
    pipelineId?: number;
    pipelineName?: string;
    pipelineType: "CI" | "CD";
    environmentName?: string;
    trigger: boolean;
    success: boolean;
    failure: boolean;
    isSelected: boolean;
    providers: { dest: string; configId: number; recipient: string; name?: string }[];
    appliedFilters: {
        project: { id: number, name: string }[],
        application: { id: number, name: string }[],
        environment: { id: number, name: string }[],
    };
}

export interface NotificationTabState {
    view: string;
    statusCode: number;
    notificationList: NotificationConfiguration[];
    channelList: any[];
    showDeleteDialog: boolean;
    showModifyRecipientsModal: boolean;
    headerCheckbox: {
        isChecked: boolean;
        value: "INTERMEDIATE" | "CHECKED";
    };
    triggerCheckbox: {
        isChecked: boolean;
        value: "INTERMEDIATE" | "CHECKED";
    },
    successCheckbox: {
        isChecked: boolean;
        value: "INTERMEDIATE" | "CHECKED";
    };
    failureCheckbox: {
        isChecked: boolean;
        value: "INTERMEDIATE" | "CHECKED";
    };
    payloadUpdateEvents: Array<{ id: number; eventTypeIds: number[]; }>;
    pagination: {
        size: number;
        pageSize: number;
        offset: number;
    }
    hostURLConfig: HostURLConfig;
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
                value: "INTERMEDIATE",
            },
            triggerCheckbox: {
                isChecked: false,
                value: "INTERMEDIATE",
            },
            successCheckbox: {
                isChecked: false,
                value: "INTERMEDIATE",
            },
            failureCheckbox: {
                isChecked: false,
                value: "INTERMEDIATE",
            },
            //TODO: create new component for modify events menu
            payloadUpdateEvents: [],
            pagination: {
                size: 20,
                pageSize: 20,
                offset: 0,
            },
            hostURLConfig: undefined,
        }
        this.updateNotificationEvents = this.updateNotificationEvents.bind(this);
        this.changePageSize = this.changePageSize.bind(this);
        this.changePage = this.changePage.bind(this);
    }

    componentDidMount() {
        this.getHostURLConfig();
        this.getAllNotifications();
        this.getChannels();
    }

    getHostURLConfig() {
        getHostURLConfiguration().then((response) => {
            this.setState({ hostURLConfig: response.result, })
        }).catch((error) => {

        })
    }

    getAllNotifications() {
        getNotificationConfigurations(this.state.pagination.offset, this.state.pagination.pageSize).then((response: any) => {
            this.setState({
                view: ViewType.FORM,
                payloadUpdateEvents: [],
                notificationList: response.result.settings,
                headerCheckbox: {
                    isChecked: false,
                    value: "INTERMEDIATE",
                },
                pagination: {
                    ...this.state.pagination,
                    size: response.result.total,
                }
            })
        }).catch((error) => {
            showError(error)
            this.setState({ view: ViewType.ERROR })
        })
    }

    getChannels() {
        getChannelsAndEmails().then((response) => {
            let list: any[] = response.result || [];
            list = list.map((item) => {
                return {
                    label: item.recipient,
                    value: item.recipient,
                    data: item,
                }
            })
            this.setState({ channelList: list })
        }).catch((error) => {
            showError(error)
        })
    }

    changePage(pageNo): void {
        let state = { ...this.state };
        state.view = ViewType.LOADING;
        state.pagination.offset = (pageNo - 1) * this.state.pagination.pageSize;
        this.setState(state, () => {
            this.getAllNotifications();
        });
    }

    changePageSize(pageSize): void {
        let state = { ...this.state };
        state.view = ViewType.LOADING;
        state.pagination.pageSize = pageSize;
        this.setState(state, () => {
            this.getAllNotifications();
        });
    }

    toggleNotification(id: number): void {
        let state = { ...this.state };
        let isAnySelected = false;
        let areAllSelected = true;
        state.notificationList = state.notificationList.map((config) => {
            if (config.id === id) config.isSelected = !config.isSelected;
            isAnySelected = isAnySelected || config.isSelected;
            areAllSelected = areAllSelected && config.isSelected;
            return config;
        })
        state.headerCheckbox.isChecked = isAnySelected;
        state.headerCheckbox.value = areAllSelected ? "CHECKED" : "INTERMEDIATE"
        this.setState(state);
    }

    toggleAllNotification(): void {
        let state = { ...this.state }
        state.headerCheckbox.isChecked = !state.headerCheckbox.isChecked;
        state.headerCheckbox.value = state.headerCheckbox.isChecked ? "CHECKED" : "INTERMEDIATE";
        state.notificationList = state.notificationList.map((config) => {
            config.isSelected = state.headerCheckbox.isChecked;
            return config;
        })
        this.setState(state);
    }

    onOpenEditNotficationMenu(): void {
        let allSelectedRows = this.state.notificationList.filter(row => row.isSelected).map((row) => {
            let eventTypeIds = [];
            if (row.trigger) eventTypeIds.push(1);
            if (row.success) eventTypeIds.push(2);
            if (row.failure) eventTypeIds.push(3);

            return {
                id: row.id,
                eventTypeIds,
                trigger: row.trigger,
                success: row.success,
                failure: row.failure
            };
        })
        let isAnyTriggerEventSelected = false;
        let isAnySuccessEventSelected = false;
        let isAnyFailureEventSelected = false;
        let areAllTriggerEventSelected = true;
        let areAllSucessEventSelected = true;
        let areAllFailureEventSelected = true;
        for (let i = 0; i < allSelectedRows.length; i++) {
            isAnyTriggerEventSelected = isAnyTriggerEventSelected || allSelectedRows[i].trigger;
            isAnySuccessEventSelected = isAnySuccessEventSelected || allSelectedRows[i].success;
            isAnyFailureEventSelected = isAnyFailureEventSelected || allSelectedRows[i].failure;
            areAllTriggerEventSelected = areAllTriggerEventSelected && allSelectedRows[i].trigger;
            areAllSucessEventSelected = areAllSucessEventSelected && allSelectedRows[i].success;
            areAllFailureEventSelected = areAllFailureEventSelected && allSelectedRows[i].failure;
        }
        this.setState({
            triggerCheckbox: {
                isChecked: isAnyTriggerEventSelected,
                value: areAllTriggerEventSelected ? "CHECKED" : "INTERMEDIATE",
            },
            successCheckbox: {
                isChecked: isAnySuccessEventSelected,
                value: areAllSucessEventSelected ? "CHECKED" : "INTERMEDIATE",
            },
            failureCheckbox: {
                isChecked: isAnyFailureEventSelected,
                value: areAllFailureEventSelected ? "CHECKED" : "INTERMEDIATE",
            },
            payloadUpdateEvents: allSelectedRows
        });
    }

    triggerCheckboxHandler(): void {
        let state = { ...this.state };
        state.triggerCheckbox = {
            isChecked: !state.triggerCheckbox.isChecked,
            value: !state.triggerCheckbox.isChecked ? "CHECKED" : "INTERMEDIATE",
        }
        state.payloadUpdateEvents = state.payloadUpdateEvents.map((row) => {
            if (state.triggerCheckbox.isChecked) {
                row.eventTypeIds.push(1);
            }
            else row.eventTypeIds = row.eventTypeIds.filter(id => id !== 1)
            return row;
        })
        this.setState(state);
    }

    successCheckboxHandler(): void {
        let state = { ...this.state };
        state.successCheckbox.isChecked = !state.successCheckbox.isChecked;
        state.successCheckbox.value = state.successCheckbox.isChecked ? "CHECKED" : "INTERMEDIATE";
        state.payloadUpdateEvents = state.payloadUpdateEvents.map((row) => {
            if (state.successCheckbox.isChecked) {
                row.eventTypeIds.push(2);
            }
            else row.eventTypeIds = row.eventTypeIds.filter(id => id !== 2)
            return row;
        })
        this.setState(state);
    }

    failureCheckboxHandler(): void {
        let state = { ...this.state };
        state.failureCheckbox.isChecked = !state.failureCheckbox.isChecked;
        state.failureCheckbox.value = state.failureCheckbox.isChecked ? "CHECKED" : "INTERMEDIATE";
        state.payloadUpdateEvents = state.payloadUpdateEvents.map((row) => {
            if (state.failureCheckbox.isChecked) {
                row.eventTypeIds.push(3);
            }
            else row.eventTypeIds = row.eventTypeIds.filter(id => id !== 3)
            return row;
        })
        this.setState(state);
    }

    updateNotificationEvents(event): void {
        this.setState({ view: ViewType.LOADING });
        let payload = this.state.payloadUpdateEvents.map(row => {
            return {
                id: row.id,
                eventTypeIds: row.eventTypeIds,
            }
        })
        updateNotificationEvents(payload).then((response) => {
            if (response) {
                this.getAllNotifications();
            }
        }).catch((error) => {
            showError(error);
        })
    }

    deleteNotifications(): void {
        let candidates = this.state.notificationList.filter(n => n.isSelected);
        deleteNotifications(candidates).then((response) => {
            this.setState({ showDeleteDialog: false });
            this.getAllNotifications();
            toast.success("Deleted Successfully");
        }).catch((error) => {
            showError(error)
        })
    }

    renderDeleteDialog() {
        if (this.state.showDeleteDialog) {
            let n = this.state.notificationList.filter(n => n.isSelected);
            return <DeleteDialog title={`${n.length} configuration(s)`}
                description={`Recipients will stop recieving notifications for selected pipilines.`}
                closeDelete={() => { this.setState({ showDeleteDialog: false }) }}
                delete={() => { this.deleteNotifications(); }}
            />
        }
    }

    renderEmptyState() {
        return <EmptyState>
            <EmptyState.Image><img src={EmptyImage} alt="so empty" /></EmptyState.Image>
            <EmptyState.Title><h3>Notifications</h3></EmptyState.Title>
            <EmptyState.Subtitle>Receive alerts when a pipeline triggers, completes successfully or fails.</EmptyState.Subtitle>
            <Link to={`${URLS.GLOBAL_CONFIG_NOTIFIER_ADD_NEW}`} className="cta flex no-decor">
                <Add className="icon-dim-20 mr-5" />Add Notification
            </Link>
        </EmptyState>
    }

    renderOptions() {
        if (this.state.headerCheckbox.isChecked) {
            return <div className="block mt-20 mb-20">
                <Tippy placement="top" content="Delete" >
                    <Delete className="icon-dim-24 mr-20 notification-tab__option"
                        onClick={(event) => { this.setState({ showDeleteDialog: !this.state.showDeleteDialog }) }} />
                </Tippy>
                <PopupMenu onToggleCallback={(isOpen) => {
                    if (isOpen) {
                        this.onOpenEditNotficationMenu();
                    }
                }}>
                    <PopupMenu.Button rootClassName="popup-button--notification-tab" >
                        <Tippy placement="top" content="Modify Events" >
                            <Bell className="icon-dim-24 mr-20 notification-tab__option" />
                        </Tippy>
                    </PopupMenu.Button>
                    <PopupMenu.Body >
                        <ul className="kebab-menu__list kebab-menu__list--notification-tab ">
                            <li key="edit" className="kebab-menu__list-item flex-justify"   >
                                <span>Trigger</span>
                                <Checkbox rootClassName=""
                                    isChecked={this.state.triggerCheckbox.isChecked}
                                    value={this.state.triggerCheckbox.value}
                                    onChange={(e) => { this.triggerCheckboxHandler() }} >
                                    <span></span>
                                </Checkbox>
                            </li>
                            <li key="success" className="kebab-menu__list-item flex-justify">
                                <span>Success</span>
                                <Checkbox rootClassName=""
                                    isChecked={this.state.successCheckbox.isChecked}
                                    value={this.state.successCheckbox.value}
                                    onChange={(e) => { e.stopPropagation(); this.successCheckboxHandler() }} >
                                    <span></span>
                                </Checkbox>
                            </li>
                            <li key="failure" className="kebab-menu__list-item flex-justify" >
                                <span>Failure</span>
                                <Checkbox rootClassName=""
                                    isChecked={this.state.failureCheckbox.isChecked}
                                    value={this.state.failureCheckbox.value}
                                    onChange={(e) => { this.failureCheckboxHandler() }} >
                                    <span></span>
                                </Checkbox>
                            </li>
                        </ul>
                        <div className="kebab-menu__sticky-bottom">
                            <button type="button" className="cta w-100"
                                onClick={this.updateNotificationEvents}>
                                Apply
                            </button>
                        </div>
                    </PopupMenu.Body>
                </PopupMenu>
                <Tippy placement="top" content="Modify Recipients" >
                    <User className="icon-dim-24 mr-20 notification-tab__option"
                        onClick={(event) => { this.setState({ showModifyRecipientsModal: !this.state.showModifyRecipientsModal }) }} />
                </Tippy>
            </div>
        }
    }

    renderPipelineList() {
        return <table className="pipeline-list__table">
            <tbody>
                <tr className="pipeline-list__header">
                    <th className="pipeline-list__checkbox">
                        <Checkbox rootClassName=""
                            isChecked={this.state.headerCheckbox.isChecked}
                            value={this.state.headerCheckbox.value}
                            onChange={(e) => { e.stopPropagation(); this.toggleAllNotification() }} >
                            <span></span>
                        </Checkbox>
                    </th>
                    <th className="pipeline-list__pipeline-name">Pipeline Name</th>
                    <th className="pipeline-list__type">Type</th>
                    <th className="pipeline-list__environment">Environment</th>
                    <th className="pipeline-list__stages">Events</th>
                    <th className="pipeline-list__recipients">Recipients</th>
                </tr>
                {this.state.notificationList.map((row) => {
                    return <tr key={row.id} className={row.isSelected ? "pipeline-list__row pipeline-list__row--selected" : "pipeline-list__row"}>
                        <td className="pipeline-list__checkbox">
                            <Checkbox rootClassName=""
                                isChecked={row.isSelected}
                                value={"CHECKED"}
                                onChange={(e) => { e.stopPropagation(); this.toggleNotification(row.id); }} >
                                <span></span>
                            </Checkbox>
                        </td>
                        <td className="pipeline-list__pipeline-name">
                            {row.pipelineName ? row.pipelineName : ""}
                            {row.appliedFilters.environment?.length || row.appliedFilters.application.length || row.appliedFilters.project?.length ? <>
                                <i>All current and future pipelines matching.</i>
                                <div className="devtron-tag__container">
                                    {row.appliedFilters.project.map((element) => {
                                        return <span key={element.name} className="devtron-tag mr-5">Project:{element.name}</span>
                                    })}
                                    {row.appliedFilters.application.map((element) => {
                                        return <span key={element.name} className="devtron-tag mr-5">App:{element.name}</span>
                                    })}
                                    {row.appliedFilters.environment.map((element) => {
                                        return <span key={element.name} className="devtron-tag mr-5">Env:{element.name}</span>
                                    })}
                                </div> </> : null}
                        </td>
                        <td className="pipeline-list__type">
                            {row.pipelineType === "CI" ? "Build" : "Deployment"}
                        </td>
                        <td className="pipeline-list__environment">{row?.environmentName}</td>
                        <td className="pipeline-list__stages flexbox flex-justify">
                            {row.trigger ? <Tippy placement="top" content="on trigger" >
                                <Play className="icon-dim-20 icon-n5" />
                            </Tippy> : <span className="icon-dim-20"></span>}
                            {row.success ? <Tippy placement="top" content="on success" >
                                <Check className="icon-dim-20 icon-n5" />
                            </Tippy> : <span className="icon-dim-20"></span>}
                            {row.failure ? <Tippy placement="top" content="on failure" >
                                <Info className="icon-dim-20 icon-n5" />
                            </Tippy> : <span className="icon-dim-20"></span>}
                        </td>
                        <td className="pipeline-list__recipients">
                            <div className="devtron-tag__container">
                                {row.providers.map((p) => {
                                    return <div key={p.configId} className="devtron-tag">
                                        {p.dest === "ses" ? <Email className="icon-dim-20 mr-5" /> : null}
                                        {p.dest === "slack" ? <Slack className="icon-dim-20 mr-5" /> : null}
                                        {p.dest === "email" ? <Email className="icon-dim-20 mr-5" /> : null}
                                        {p.recipient ? p.recipient : p.name}
                                    </div>
                                })}
                            </div>
                        </td>
                    </tr>
                })}
            </tbody>
        </table>

    }

    renderBody() {
        return <div className="notification-tab">
            <Link to={`edit`} style={{ width: "100px" }}
                className="cta small flex no-decor">
                <Add className="icon-dim-16 mr-5" />Add New
            </Link>
            {this.renderOptions()}
            {this.renderPipelineList()}
            {this.state.pagination.size > 0 ? <Pagination offset={this.state.pagination.offset}
                pageSize={this.state.pagination.pageSize}
                size={this.state.pagination.size}
                changePage={this.changePage}
                changePageSize={this.changePageSize} /> : null}
        </div>
    }

    remderModifyRecipients() {
        if (this.state.showModifyRecipientsModal) {
            let allCandidates = this.state.notificationList.filter(row => row.isSelected).map((row) => {
                return { id: row.id, providers: row.providers };
            });
            return <ModifyRecipientsModal
                notificationListFromParent={allCandidates}
                channelList={this.state.channelList}
                onSaveSuccess={() => {
                    this.setState({ view: ViewType.LOADING, showModifyRecipientsModal: false });
                    this.getAllNotifications()
                }}
                closeModifyRecipientsModal={() => { this.setState({ showModifyRecipientsModal: false }); }}
            />
        }
    }

    renderHostErrorMessage() {
        if (!this.state.hostURLConfig || this.state.hostURLConfig.value !== window.location.origin) {
            return <div className="br-4 bw-1 er-2 pt-10 pb-10 pl-16 pr-16 bcr-1 mb-16 flex left">
                <Error className="icon-dim-20 mr-8" />
                <div className="cn-9 fs-13">Host url is not configured or is incorrect. Reach out to your DevOps team (super-admin) to &nbsp;
                <NavLink className="hosturl__review" to={URLS.GLOBAL_CONFIG_HOST_URL}>Review and update</NavLink>
                </div>
            </div>
        }
    }

    render() {
        if (this.state.view === ViewType.LOADING) {
            return <div style={{ "height": "calc(100vh - 215px)" }}>
                <Progressing pageLoader />
            </div>
        }
        if (this.state.view === ViewType.ERROR) {
            return <div style={{ "height": "calc(100vh - 215px)" }}>
                <Reload />
            </div>
        }
        else if (!this.state.notificationList.length) {
            return <div className="pt-16" style={{ "height": "calc(100vh - 215px)" }}>
                {this.renderHostErrorMessage()}
                {this.renderEmptyState()}
            </div>
        }
        else return <div className="bcn-0 pt-16" style={{ "minHeight": "calc(100vh - 215px)" }}>
            {this.renderHostErrorMessage()}
            {this.renderBody()}
            {this.renderDeleteDialog()}
            {this.remderModifyRecipients()}
        </div>
    }
}