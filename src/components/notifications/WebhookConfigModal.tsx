import React, { Component } from 'react';
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg';
import { copyToClipboard, Select } from '../common';
import { showError, Progressing, VisibleModal, getTeamListMin as getProjectListMin, Drawer } from '@devtron-labs/devtron-fe-common-lib'
import { ViewType } from '../../config/constants';
import { toast } from 'react-toastify';
import { saveSlackConfiguration, updateSlackConfiguration, getSlackConfiguration, getWebhookAttributes, updateWebhookConfiguration, saveWebhookConfiguration, getWebhookConfiguration } from './notifications.service';
import Tippy from '@tippyjs/react';
import { ReactComponent as Error } from '../../assets/icons/ic-warning.svg';
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg';
import { ReactComponent as Help } from '../../assets/icons/ic-help.svg'
import { ReactComponent as Clipboard } from '../../assets/icons/ic-copy.svg'
import CodeEditor from '../CodeEditor/CodeEditor';
import { HeaderType } from './types';
import CreateHeaderDetails from './CreateHeaderDetails';

export interface WebhookConfigModalProps {
    webhookConfigId: number;
    onSaveSuccess: () => void;
    closeWebhookConfigModal: (event) => void;
}

export interface WebhhookConfigModalState {
    view: string;
    form: {
        configName: string;
        webhookUrl: string;
        isLoading: boolean;
        isError: boolean;
        payload: string;
        header: HeaderType[];
    };
    isValid: {
        configName: boolean;
        webhookUrl: boolean;
    };
    webhookAttribute: Record<string, string>;
    copyAttribute: boolean;
}

export class WebhookConfigModal extends Component<WebhookConfigModalProps, WebhhookConfigModalState> {

    constructor(props) {
        super(props);
        this.state = {
            view: ViewType.LOADING,
            form: {
                configName: "",
                webhookUrl: "",
                isLoading: false,
                isError: false,
                payload: "",
                header: [{ key: "", value: "" }],
            },
            isValid: {
                configName: true,
                webhookUrl: true,
            },
            webhookAttribute: {},
            copyAttribute: false
        }
        this.handleWebhookConfigNameChange = this.handleWebhookConfigNameChange.bind(this);
        this.handleWebhookUrlChange = this.handleWebhookUrlChange.bind(this);
        this.handleWebhookPaylodChange = this.handleWebhookPaylodChange.bind(this);
        this.addNewHeader = this.addNewHeader.bind(this);
        this.renderHeadersList = this.renderHeadersList.bind(this);
        this.setHeaderData = this.setHeaderData.bind(this);
        this.removeHeader = this.removeHeader.bind(this);
        this.renderHeadersList = this.renderHeadersList.bind(this);
        this.setCopied = this.setCopied.bind(this);
        this.copyToClipboard = this.copyToClipboard.bind(this);
        this.isValid = this.isValid.bind(this);
    }

    componentDidMount() {
        if (this.props.webhookConfigId) {
            getWebhookConfiguration(this.props.webhookConfigId)
            .then((response) => {
                let state = { ...this.state };
                state.view = ViewType.FORM;
                state.form = { ...response.result };
                state.isValid = {
                    configName: true,
                    webhookUrl: true,
                }
                this.setState(state);
                console.log(response.result)
            }).catch((error) => {
                showError(error);
            })
        }
        else {
            getProjectListMin().then((response) => {
                this.setState({
                    view: ViewType.FORM
                })
            }).catch((error) => {
                showError(error);
            })
        }
        getWebhookAttributes()
            .then((response) => {
                let state = { ...this.state }
                state.webhookAttribute = { ...response.result };
                this.setState(state)
            }).catch((error) => {
                showError(error)
            })
    }

    handleWebhookConfigNameChange(event: React.ChangeEvent<HTMLInputElement>,): void {
        let { form } = { ...this.state };
        form.configName = event.target.value;
        this.setState({ form });
    }

    isValid(event, key: 'configName' | 'webhookUrl' ): void {
        let { form, isValid } = { ...this.state };
        isValid[key] = event.target.value.length !== 0;
        this.setState({ form, isValid });
    }

    handleWebhookUrlChange(event: React.ChangeEvent<HTMLInputElement>): void {
        let { form } = { ...this.state };
        form.webhookUrl = event.target.value;
        this.setState({ form });
    }

    handleWebhookPaylodChange(value): void {
        let { form } = { ...this.state };
        form.payload = value;
        this.setState({ form });
    }

    saveWebhookConfig(): void {
        let state = { ...this.state };
        state.form.isLoading = true;
        this.setState(state);
        let keys = Object.keys(this.state.isValid);
        let isFormValid = keys.reduce((isFormValid, key) => {
            isFormValid = isFormValid && this.state.isValid[key];
            return isFormValid;
        }, true);

        if (!isFormValid) {
            state.form.isLoading = false;
            state.form.isError = true;
            this.setState(state);
            return;
        }
        let requestBody = this.state.form;
        if (this.props.webhookConfigId) requestBody['id'] = this.props.webhookConfigId;
        let promise = this.props.webhookConfigId ? updateWebhookConfiguration(requestBody) : saveWebhookConfiguration(requestBody);
        promise.then((response) => {
            let state = { ...this.state };
            state.form.isLoading = false;
            state.form.isError = false;
            this.setState(state);
            toast.success("Saved Successfully");
            this.props.onSaveSuccess();
        }).catch((error) => {
            showError(error);
        })
    }

    setHeaderData(index, _headerData) {
        const _headers = [...this.state.form.header]
        _headers[index] = _headerData
        let { form } = { ...this.state };
        form.header = _headers;
        this.setState({ form });
    }

    addNewHeader() {
        const _headers = [...this.state.form.header]
        _headers.splice(0, 0, {
            key: '',
            value: '',
        })
        let { form } = { ...this.state };
        form.header = _headers;
        this.setState({ form });
    }

    removeHeader(index) {
        const _headers = [...this.state.form.header]
        _headers.splice(index, 1)
        let { form } = { ...this.state };
        form.header = _headers;
        this.setState({ form });
    }

    setCopied(value: boolean) {
        let { copyAttribute } = { ...this.state }
        copyAttribute = value;
        this.setState({ copyAttribute })
    }

    copyToClipboard(e) {
        e.stopPropagation()
        copyToClipboard(e.currentTarget.dataset.value, () => this.setCopied(true))
    }

    renderConfigureLinkInfoColumn() {
        let keys = Object.keys(this.state.webhookAttribute)
        return (
            <div className="h-100 w-280 flex column dc__border-left dc__align-start dc__content-start p-16">
                <div className="flex dc__align-items-center p-0 mb-16">
                    <Help className="icon-dim-18 fcv-5" />
                    <span className="ml-8 fw-6 fs-13 lh-20"> Available data</span>
                </div>
                <span className="fw-4 fs-13 lh-20 mb-16">Following data are available to be shared through Webhook. Use Payload to configure.</span>
                {keys.map((atrribute, index) => (
                    <div className="w-100-imp cn-7 fs-12 mb-8 flex left hover-trigger" >
                        <span className="bcn-1 br-4 fs-12 fw-4 lh-16 p-4">{this.state.webhookAttribute[atrribute]}</span>
                        <Tippy
                            className="default-tt"
                            arrow={false}
                            placement="bottom"
                            content={this.state.copyAttribute ? 'Copied!' : 'Copy'}
                            trigger="mouseenter click"
                            onShow={(_tippy) => {
                                setTimeout(() => {
                                    _tippy.hide()
                                    this.setCopied(false)
                                }, 4000)
                            }}
                            interactive={true}
                        >
                            <Clipboard
                                data-value={this.state.webhookAttribute[atrribute]}
                                className="ml-8 pointer hover-only icon-dim-16"
                                onClick={this.copyToClipboard}
                            />
                        </Tippy>
                    </div>

                ))}
            </div>
        )
    }

    renderHeadersList() {
        return (
            <div>
                <div className="mb-8">
                    {this.state.form.header?.map((headerData, index) => (
                        <CreateHeaderDetails
                            key={`tag-${index}`}
                            index={index}
                            headerData={headerData}
                            setHeaderData={this.setHeaderData}
                            removeHeader={this.removeHeader}
                            headerIndex={3 + (index + 2)}
                        />
                    ))}
                </div>
            </div>
        )
    }

    renderWithBackdrop(body) {
        return <Drawer position="right">
            <div className="h-100 modal__body w-885 modal__body--p-0 dc__no-top-radius mt-0 dc__position-rel">
                <div className="h-48 flex flex-align-center dc__border-bottom flex-justify bcn-0 pb-12 pt-12 pl-20 pr-20">
                    <h1 className="fs-16 fw-6 lh-1-43 m-0 title-padding">Configure Webhook</h1>
                    <button type="button" className="dc__transparent" onClick={this.props.closeWebhookConfigModal}>
                        <Close className="icon-dim-24" />
                    </button>
                </div>
                {body}
            </div>
        </Drawer>
    }

    render() {
        let body;
        if (this.state.view === ViewType.LOADING) {
            body = <div style={{ height: "350px" }}>
                <Progressing pageLoader />
            </div>
        }
        else body = <>
            <div className="flex" style={{ height: 'calc(100vh - 120px' }}>
                <div className="w-600 m-20 flex column dc__align-start dc__content-start dc__overflow-scroll" style={{ height: 'calc(100vh - 160px)' }}>
                    <label className="form__row w-100-imp">
                        <span className="form__label dc__required-field">Configuration name</span>
                        <input data-testid="add-slack-channel" className="form__input" type="text" name="app-name"
                            value={this.state.form.configName} onChange={this.handleWebhookConfigNameChange}
                            onBlur={(event) => this.isValid(event, 'configName')}
                            placeholder="Enter name" autoFocus={true} tabIndex={1} />
                        <span className="form__error">
                            {!this.state.isValid.configName
                                ? <><Error className="form__icon form__icon--error" />This is required field.<br /></>
                                : null}
                        </span>
                    </label>
                    <label className="form__row w-100-imp">
                        <span className="form__label dc__required-field">Webhook URL
                            <Tippy className="default-tt" arrow={true} trigger={"click"}
                                interactive={true}
                                placement="top" content={
                                    <a href="https://slack.com/intl/en-gb/help/articles/115005265063-Incoming-webhooks-for-Slack" target="_blank" rel="noopener noreferrer"
                                        style={{ color: "white", textTransform: "none" }}>
                                        Learn how to setup slack webhooks
                                    </a>
                                }>
                                <Help className="ml-5 dc__vertical-align-middle icon-dim-16 cursor" />
                            </Tippy>
                        </span>
                        <input data-testid="add-webhook-url" className="form__input" type="text" name="app-name"
                            value={this.state.form.webhookUrl}
                            placeholder="Enter Incoming Webhook URL" tabIndex={2} onChange={this.handleWebhookUrlChange}
                            onBlur={(event) => this.isValid(event, 'webhookUrl')} />
                        <span className="form__error">
                            {!this.state.isValid.webhookUrl
                                ? <><Error className="form__icon form__icon--error" />This is a required field. <br /></>
                                : null}
                        </span>
                    </label>
                    <div className="form__row w-100-imp" >
                        <div className="flex ml-0 dc__content-space">
                            <span className="form__label">Headers
                            </span>
                            <span className="flex dc__align-end dc__content-end cb-5 fw-6 fs-13 flex right mb-4 cursor" onClick={this.addNewHeader}>
                                <Add className="icon-dim-20 fcb-5" /> Add
                            </span>
                        </div>
                        {this.renderHeadersList()}
                    </div>
                    <label className="form__row w-100-imp">
                        <span className="form__label dc__required-field">Data to be shared through Webhook</span>
                        <div className="script-container">
                            <CodeEditor
                                value={this.state.form.payload}
                                theme="vs-alice-blue"
                                mode="shell"
                                onChange={(value) => this.handleWebhookPaylodChange(value)}
                                inline
                                height={200}
                            ></CodeEditor>
                        </div>
                    </label>
                </div>
                {this.renderConfigureLinkInfoColumn()}
            </div>
            <div className=" form__button-group-bottom flex right">
                <div className="flex right">
                    <button type="button" className="cta cancel mr-16" tabIndex={5}
                        onClick={this.props.closeWebhookConfigModal}>Cancel
                    </button>
                    <button onClick={(event) => { event.preventDefault(); this.saveWebhookConfig() }} data-testid="add-slack-save-button" type="submit" className="cta" tabIndex={4} disabled={this.state.form.isLoading}>
                        {this.state.form.isLoading ? <Progressing /> : "Save"}
                    </button>
                </div>
            </div>
        </>

        return this.renderWithBackdrop(body);
    }
}