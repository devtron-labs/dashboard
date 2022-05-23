import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router'
import { SESConfigModal } from './SESConfigModal';
import { SlackConfigModal } from './SlackConfigModal';
import { Checkbox, Progressing, showError, Select, validateEmail, ErrorBoundary, ClearIndicator, MultiValueRemove } from '../common';
import { ReactComponent as Slack } from '../../assets/img/slack-logo.svg';
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg';
import { ReactComponent as Filter } from '../../assets/icons/ic-filter.svg';
import { ReactComponent as Folder } from '../../assets/icons/img-folder-empty.svg';
import { ReactComponent as CI } from '../../assets/icons/ic-CI.svg';
import { ReactComponent as CD } from '../../assets/icons/ic-CD.svg';
import { ReactComponent as Branch } from '../../assets/icons/ic-branch.svg';
import { getAddNotificationInitData, getPipelines, saveNotification, getChannelConfigs } from './notifications.service';
import { ViewType, URLS, SourceTypeMap } from '../../config';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { components } from 'react-select';
import { multiSelectStyles, DropdownIndicator, Option, MultiValueContainer } from './notifications.util';
import Tippy from '@tippyjs/react';
import CreatableSelect from 'react-select/creatable';
import { CiPipelineSourceConfig } from '../ciPipeline/CiPipelineSourceConfig';
import './notifications.css';
import { getAppListMin, getEnvironmentListMin, getTeamListMin } from '../../services/service';

interface AddNotificationsProps extends RouteComponentProps<{}> {

}

export interface PipelineType {
    checkbox: {
        isChecked: boolean;
        value: "CHECKED" | "INTERMEDIATE";
    }
    type: "CI" | "CD";
    pipelineId: number;
    pipelineName: string;
    environmentName?: string;
    branch?: string;
    appName: string;
    success: boolean;
    trigger: boolean;
    failure: boolean;
    appliedFilters: Array<{ type: string, value: number | string | undefined; name: string; label: string | undefined }>;
}

interface AddNotificationState {
    view: string;
    showSlackConfigModal: boolean;
    showSESConfigModal: boolean;
    channelOptions: { label: string; value; data: { dest: "slack" | "ses" | "", configId: number; recipient: string; } }[];
    sesConfigOptions: { id: number; configName: string; dest: "slack" | "ses" | ""; recipient: string }[];
    isLoading: boolean;
    appliedFilters: Array<{ type: string, value: number | string | undefined, label: string | undefined }>;
    selectedChannels: { __isNew__?: boolean; label: string; value; data: { dest: "slack" | "ses" | "", configId: number; recipient: string; } }[];
    openSelectPipeline: boolean;
    pipelineList: PipelineType[];
    filterInput: string;
    sesConfigId: number;
    options: {
        value: string;
        label: string
        type: string
    }[]
}

export class AddNotification extends Component<AddNotificationsProps, AddNotificationState> {
    filterOptionsMain = [
        { value: "application", label: "application", type: "main" },
        { value: "project", label: "project", type: "main" },
        { value: "environment", label: "environment", type: "main" },
    ];
    filterOptionsInner = [];

    constructor(props) {
        super(props);
        this.state = {
            view: ViewType.FORM,
            channelOptions: [],
            sesConfigOptions: [],
            showSlackConfigModal: false,
            showSESConfigModal: false,
            openSelectPipeline: false,
            filterInput: "",
            appliedFilters: [],
            isLoading: false,
            selectedChannels: [],
            pipelineList: [],
            sesConfigId: 0,
            options:[],
        }
        this.handleFilterInput = this.handleFilterInput.bind(this);
        this.selectFilterType = this.selectFilterType.bind(this);
        this.toggleSelectPipeline = this.toggleSelectPipeline.bind(this);
        this.handlePipelineEventType = this.handlePipelineEventType.bind(this);
        this.selectChannel = this.selectChannel.bind(this);
        this.handleFilterTag = this.handleFilterTag.bind(this);
        this.selectSES = this.selectSES.bind(this);
        this.selectSESFromChild = this.selectSESFromChild.bind(this);
    }

    componentDidMount() {
        this.getInitialData();

    }

    getInitialData() {
        getAddNotificationInitData().then((result) => {
            // this.filterOptionsInner = result.filterOptionsInner;
            this.setState({
                sesConfigOptions: result.sesConfigOptions,
                channelOptions: result.channelOptions,
                view: ViewType.FORM
            });
        })
    }

    handleFilterInput(event): void {
        this.setState({
            filterInput: event.target.value,
            openSelectPipeline: true
        });
        this.getData(event.target.value)
    }

    handleFilterTag(event): void {
        let theKeyCode = event.key;
        if (theKeyCode === " " || theKeyCode === "Enter") {
            let state = { ...this.state };
            let unsavedFilterIndex = state.appliedFilters.findIndex(e => e.type && !e.value && e.type === "pipeline");
            if (unsavedFilterIndex >= 0) {
                state.filterInput = "";
                state.appliedFilters[unsavedFilterIndex] = {
                    type: "pipeline",
                    label: event.target.value,
                    value: event.target.value,
                }
                state.view = ViewType.LOADING;
                this.setState(state, () => {
                    getPipelines(state.appliedFilters).then((response) => {
                        let selectedPipelines = this.state.pipelineList.filter(pipeline => pipeline.checkbox.isChecked);
                        let newPipelines = response.result || [];
                        this.setState({ view: ViewType.FORM, pipelineList: selectedPipelines.concat(newPipelines), openSelectPipeline: false });
                    }).catch((error) => {
                        showError(error);
                    })
                });
            }
        }
        else if (theKeyCode === "Backspace") {
            let unsavedFilterIndex = this.state.appliedFilters.findIndex(e => e.type && !e.value);
            if (this.state.filterInput.length === 0 && unsavedFilterIndex >= 0) {
                let state = { ...this.state };
                state.appliedFilters.pop();
                this.setState(state);
            }
        }
    }

    showSesDropdown(): boolean {
        let allEmails = this.state.selectedChannels?.filter(p => p.data.dest === "" || p.data.dest === "ses");
        let show = allEmails.reduce((isValid, item) => {
            isValid = isValid || validateEmail(item.data.recipient);
            return isValid
        }, false)
        return show;
    }

    toggleSelectPipeline() {
        let appliedFilters = this.state.appliedFilters;
        if (this.state.openSelectPipeline) {
            appliedFilters = this.state.appliedFilters.filter(e => e.value);
        }
        this.setState({ appliedFilters, openSelectPipeline: !this.state.openSelectPipeline });
    }

    selectFilterType(filter: { label: string, value: string | number, type: string }): void {
        let state = { ...this.state };
        let unsavedFilterIndex = state.appliedFilters.findIndex(e => e.type && !e.value);
        if (unsavedFilterIndex < 0) {
            state.appliedFilters.push({ type: filter.label, value: undefined, label: undefined });
            if (filter.label === "pipeline") state.openSelectPipeline = false;
            this.setState(state);
        }
        else {
            state.view = ViewType.LOADING;
            state.appliedFilters[unsavedFilterIndex] = filter;
            this.setState(state, () => {
                getPipelines(state.appliedFilters).then((response) => {
                    let selectedPipelines = this.state.pipelineList.filter(pipeline => pipeline.checkbox.isChecked);
                    let newPipelines = response.result || [];
                    this.setState({ view: ViewType.FORM, pipelineList: selectedPipelines.concat(newPipelines), openSelectPipeline: false });
                }).catch((error) => {
                    showError(error);
                })
            });
        }
        this.setState({options:[]})
    }

    clearFilter(filter: { type, label, value }) {
        let state = { ...this.state };
        state.appliedFilters = state.appliedFilters.filter(f => !(f.type === filter.type && f.value === filter.value))
        this.setState(state, () => {
            getPipelines(state.appliedFilters).then((response) => {
                let selectedPipelines = this.state.pipelineList.filter(pipeline => pipeline.checkbox.isChecked);
                let newPipelines = response.result || [];
                this.setState({ view: ViewType.FORM, pipelineList: selectedPipelines.concat(newPipelines), openSelectPipeline: false });
            }).catch((error) => {
                showError(error);
            })
        });
    }

    handlePipelineEventType(pipelineIndex: number, stage: 'success' | 'trigger' | 'failure'): void {
        let state = { ...this.state };
        let pipeline = state.pipelineList[pipelineIndex];
        pipeline[stage] = !pipeline[stage];
        if (pipeline.success && pipeline.trigger && pipeline.failure) pipeline.checkbox = {
            value: "CHECKED",
            isChecked: true,
        }
        else if (pipeline.success || pipeline.trigger || pipeline.failure) pipeline.checkbox = {
            value: "INTERMEDIATE",
            isChecked: true,
        }
        else if (!(pipeline.success && pipeline.trigger && pipeline.failure)) pipeline.checkbox = {
            value: "CHECKED",
            isChecked: false,
        }
        state.pipelineList[pipelineIndex] = pipeline;
        this.setState(state);
    }

    togglePipelineCheckbox(pipelineIndex: number): void {
        let state = { ...this.state };
        let pipeline = state.pipelineList[pipelineIndex];
        pipeline.checkbox.isChecked = !pipeline.checkbox.isChecked;
        pipeline.checkbox.value = pipeline.checkbox.isChecked ? "CHECKED" : "INTERMEDIATE";
        pipeline.trigger = pipeline.checkbox.isChecked;
        pipeline.success = pipeline.checkbox.isChecked;
        pipeline.failure = pipeline.checkbox.isChecked;
        state.pipelineList[pipelineIndex] = pipeline;
        this.setState(state);
    }

    selectChannel(selectedChannels): void {
        let state = { ...this.state };
        state.selectedChannels = selectedChannels || [];
        state.selectedChannels = state.selectedChannels.map((p) => {
            if (p.__isNew__) return { ...p, data: { dest: "", configId: 0, recipient: p.value } }
            return p;
        })
        this.setState(state);
    }

    selectSES(event): void {
        this.setState({ sesConfigId: event.target.value })
    }

    selectSESFromChild(sesConfigId: number): void {
        if (sesConfigId && sesConfigId > 0) {
            this.setState({ sesConfigId: sesConfigId })
        }
    }

    saveNotification(): void {
        let selectedPipelines = this.state.pipelineList.filter(p => p.checkbox.isChecked);
        let isAnyEmail = this.state.selectedChannels.find(p => p.data.dest === "" || p.data.dest === "ses");

        if (!selectedPipelines.length) {
            toast.error("Select atleast one pipeline");
            return;
        }
        else if (!this.state.selectedChannels.length) {
            toast.error("Select atleast one recipient");
            return;
        }
        else if (isAnyEmail && !this.state.sesConfigId) {
            toast.error("Select SES Account");
            return;
        }

        saveNotification(selectedPipelines, this.state.selectedChannels, this.state.sesConfigId).then((response) => {
            this.props.history.push(`${URLS.GLOBAL_CONFIG_NOTIFIER}/channels`);
            toast.success("Saved Successfully");
        }).catch((error) => { showError(error) })
    }

    renderSESAccountDropdown() {
        let show = this.showSesDropdown();
        if (show) {
            let sesConfig = this.state.sesConfigOptions.find(config => config.id === this.state.sesConfigId);
            return <label className="form__row form__row--ses-account">
                <span className="form__label">SES Account (used for sending email notifications)</span>
                <Select rootClassName="" onChange={this.selectSES} value={this.state.sesConfigId} >
                    <Select.Button rootClassName="select-button--default">
                        {sesConfig ? sesConfig.configName : "Select SES Account"}
                    </Select.Button>
                    {this.state.sesConfigOptions.map((sesConfig) =>
                        <Select.Option key={sesConfig.id} value={sesConfig.id}>
                            <span className="ellipsis-left">{sesConfig.configName}</span>
                        </Select.Option>)}
                    <div className="select__sticky-bottom" onClick={(e) => { this.setState({ showSESConfigModal: true }) }}>
                        <Add className="icon-dim-20 mr-5" /> Add SES Account
                    </div>
                </Select>
            </label>
        }
    }

    getData(text) {
        if (text.length > 2) {
            let unsavedFilter = this.state.appliedFilters.find((e) => e.type && !e.value)
            let getDataList
            if (unsavedFilter.type === 'environment') {
                getDataList = getEnvironmentListMin()
            } else if (unsavedFilter.type === 'project') {
                getDataList = getTeamListMin()
            } else if (unsavedFilter.type === 'application') {
                getDataList = getAppListMin()
            }

            getDataList?.then((response) => {
                let state = { ...this.state }
                state.options = response.result.map((elem) => {
                    return {
                        label:
                            unsavedFilter.type === 'environment'
                                ? `${elem.environment_name.toLowerCase()}`
                                : `${elem.name.toLowerCase()}`,
                        value: elem.id,
                        type: unsavedFilter.type,
                    }
                })
                this.setState(state)
            })
        }
        console.log(text,this.state)
    }

    renderSelectPipelines() {
        let unsavedFilter = this.state.appliedFilters.find(e => e.type && !e.value);
        let options = this.filterOptionsMain;
        if (unsavedFilter) {
            let input = this.state.filterInput.toLowerCase();
            if (input.length > 0) {
                options = this.state.options
            }
            else options = this.state.options
        }
        return <div className="position-rel">
            <div className="form__input pipeline-filter__select-pipeline" onClick={() => this.setState({ openSelectPipeline: true })}>
                <Filter className="icon-dim-20 mr-5 vertical-align-middle" />
                {this.state.appliedFilters.filter(p => p.value).map((p) => {
                    return <span key={p.label} className="devtron-tag m-2">
                        {`${p.type}:${" "}${p.label}`}
                        <button type="button" className="transparent ml-5" onClick={(event) => this.clearFilter(p)}>
                            <i className="fa fa-times-circle" aria-hidden="true"></i>
                        </button>
                    </span>
                })}
                {unsavedFilter ? `${unsavedFilter.type}: ` : ""}
                {unsavedFilter ? <input autoComplete="off" type="text" className="pipeline-filter__search transparent flex-1" autoFocus onKeyDown={this.handleFilterTag}
                    placeholder="Type 3 chars to see matching results"
                    onChange={this.handleFilterInput} value={this.state.filterInput} /> : !this.state.appliedFilters.length && <span>Filter by Project, applications and environment, search by name.</span>}
            </div>
            {this.state.openSelectPipeline ? <div className="transparent-div" onClick={this.toggleSelectPipeline}></div> : null}
            {this.state.openSelectPipeline ? <div className="pipeline-filter__menu">
                <div className="select-button--pipeline-filter">Filter by</div>
                {options.map((o) => {
                    return <div className="pipeline-filter__option" key={o.label}
                        onClick={() => { this.selectFilterType(o); }}>{o.label}</div>
                })}
            </div> : null}
        </div>
    }

    renderPipelineList() {
        if (this.state.view === ViewType.LOADING) {
            return <div className="pipeline-list__empty-state">
                <Progressing pageLoader />
            </div>
        }
        else if (!this.state.pipelineList.length) {
            return <div className="pipeline-list__empty-state">
                <Folder className="block margin-auto" />
                <p className="empty__subtitle margin-auto">Apply filters to find matching pipelines</p>
            </div>
        }
        else {
            return <table className="pipeline-list__table">
                <tbody>
                    <tr className="pipeline-list__header">
                        <th className="pipeline-list__checkbox fw-6"></th>
                        <th className="pipeline-list__pipeline-name fw-6">Pipeline Name</th>
                        <th className="pipeline-list__pipeline-name fw-6">Application Name</th>
                        <th className="pipeline-list__type fw-6">Type</th>
                        <th className="pipeline-list__environment fw-6">Env/Branch</th>
                        <th className="pipeline-list__stages block fw-6">Events</th>
                    </tr>
                    {this.state.pipelineList.map((row, rowIndex) => {
                        let _isCi = row.branch && row.type === "CI";
                        let _isWebhookCi;
                        if (_isCi){
                            try {
                                JSON.parse(row.branch);
                                _isWebhookCi = true;
                            } catch (e) {
                                _isWebhookCi = false;
                            }
                        }

                        return <tr key={row.pipelineId + row.type} className="pipeline-list__row">
                            <td className="pipeline-list__checkbox">
                                <Checkbox rootClassName=""
                                    isChecked={row.checkbox.isChecked}
                                    value={row.checkbox.value}
                                    onChange={(e) => { this.togglePipelineCheckbox(rowIndex); }} >
                                    <span></span>
                                </Checkbox>
                            </td>
                            <td className="pipeline-list__pipeline-name">
                                {row.appliedFilters.length ? <>
                                    <i>All current and future pipelines matching.</i>
                                    <div className="devtron-tag__container">
                                        {row.appliedFilters.map((e) => {
                                            return <span key={e.type + e.name} className="devtron-tag m-2">{e?.type}: {e?.name}</span>
                                        })}
                                    </div>  </> : row.pipelineName}
                            </td>
                            <th className="pipeline-list__pipeline-name fw-6">{row?.appName}</th>
                            <td className="pipeline-list__type">
                                {row.type === "CI" ? <CI className="icon-dim-20" /> : ''}
                                {row.type === "CD" ? <CD className="icon-dim-20" /> : ''}
                            </td>
                            <td className="pipeline-list__environment">
                                {_isCi &&
                                    <span className="flex left">
                                        <CiPipelineSourceConfig sourceType={_isWebhookCi ? SourceTypeMap.WEBHOOK : SourceTypeMap.BranchFixed} sourceValue={row.branch} showTooltip={true} />
                                    </span>
                                }
                                {row.type === "CD" ? row?.environmentName : ''}
                            </td>
                            <td className="pipeline-list__stages flexbox flex-justify">
                                <Tippy className="default-tt" arrow={true} placement="top" content="Trigger" >
                                    <div>
                                        <Checkbox rootClassName="gray"
                                            isChecked={row.trigger}
                                            value={"CHECKED"}
                                            onChange={(e) => { this.handlePipelineEventType(rowIndex, "trigger") }} >
                                            <span></span>
                                        </Checkbox>
                                    </div>
                                </Tippy>
                                <Tippy className="default-tt" arrow={true} placement="top" content="Success">
                                    <div>
                                        <Checkbox rootClassName="green"
                                            isChecked={row.success}
                                            value={"CHECKED"}
                                            onChange={(e) => { this.handlePipelineEventType(rowIndex, "success") }} >
                                            <span></span>
                                        </Checkbox>
                                    </div>
                                </Tippy>
                                <Tippy className="default-tt" arrow={true} placement="top" content="Failure">
                                    <div>
                                        <Checkbox rootClassName="red"
                                            isChecked={row.failure}
                                            value={"CHECKED"}
                                            onChange={(e) => { this.handlePipelineEventType(rowIndex, "failure") }} >
                                            <span></span>
                                        </Checkbox>
                                    </div>
                                </Tippy>
                            </td>
                        </tr>
                    })}
                </tbody>
            </table>
        }
    }

    renderSendTo() {
        return <div className="form__row">
            <p className="add-notification__title mb-16">Send to</p>
            <CreatableSelect placeholder="Enter email addresses or slack channels"
                value={this.state.selectedChannels}
                isMulti
                isSearchable
                isClearable={false}
                backspaceRemovesValue
                className="react-select--height-44"
                components={{
                    MultiValueContainer: ({ ...props }) => <MultiValueContainer {...props} validator={validateEmail} />,
                    MultiValueRemove: MultiValueRemove,
                    IndicatorSeparator: null,
                    DropdownIndicator: DropdownIndicator,
                    // MultiValueContainer: MultiValueContainer,
                    ClearIndicator: ClearIndicator,
                    Option: Option,
                    MenuList: (props) => {
                        return <components.MenuList {...props}>
                            {props.children}
                            <div className="pipeline-filter__sticky-bottom cursor"
                                onClick={(e) => { this.setState({ showSlackConfigModal: true }) }}>
                                <Slack className="icon-dim-24 mr-12" />Configure Slack Channel
                            </div>
                        </components.MenuList>
                    }
                }}
                styles={{
                    ...multiSelectStyles,
                    menuList: (base) => {
                        return {
                            ...base,
                            position: 'relative',
                            paddingBottom: '0px',
                        }
                    }
                }}
                onChange={(selected) => { this.selectChannel(selected) }}
                options={this.state.channelOptions} />
        </div>
    }

    renderAddCard() {
        return <div className="white-card white-card--no-padding">
            <div className="m-24">
                {this.renderSendTo()}
                {this.renderSESAccountDropdown()}
                <div className="form__row">
                    <div className="add-notification__title mb-16">Select pipelines</div>
                    {this.renderSelectPipelines()}
                </div>
                {this.renderPipelineList()}
            </div>
            <div className="form__button-group-bottom flex right">
                <Link to={`${URLS.GLOBAL_CONFIG_NOTIFIER}/channels`} className="cta cancel mr-16 no-decor" tabIndex={8}>Cancel</Link>
                <button type="submit" className="cta" tabIndex={7} disabled={this.state.isLoading}
                    onClick={(event) => { this.saveNotification() }}>
                    {this.state.isLoading ? <Progressing /> : "Save"}
                </button>
            </div>
        </div >
    }

    renderSESConfigModal() {
        if (this.state.showSESConfigModal) {
            return <SESConfigModal sesConfigId={0}
                shouldBeDefault={false}
                selectSESFromChild={this.selectSESFromChild}
                onSaveSuccess={() => {
                    this.setState({ showSESConfigModal: false });
                    getChannelConfigs().then((response: any) => {
                        let providers = response?.result.sesConfigs || [];
                        this.setState({ sesConfigOptions: providers })
                    }).catch((error) => {
                        showError(error);
                    })
                }}
                closeSESConfigModal={(event) => { this.setState({ showSESConfigModal: false }); }}
            />
        }
    }

    renderShowSlackConfigModal() {
        if (this.state.showSlackConfigModal) {
            return <SlackConfigModal
                slackConfigId={0}
                onSaveSuccess={() => {
                    this.setState({ showSlackConfigModal: false });
                    this.getInitialData();
                }}
                closeSlackConfigModal={() => { this.setState({ showSlackConfigModal: false }) }}
            />
        }
    }

    render() {
        return <ErrorBoundary>

            <div className="add-notification-page">
                <div className="form__title mb-16">Add Notifications</div>
                {this.renderAddCard()}
                {this.renderShowSlackConfigModal()}
                {this.renderSESConfigModal()}
            </div>
        </ErrorBoundary>
    }
}