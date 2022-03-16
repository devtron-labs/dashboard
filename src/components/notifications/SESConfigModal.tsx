import React, { Component } from 'react';
import { VisibleModal, showError, Progressing, Checkbox, validateEmail } from '../common';
import { saveSESConfiguration, updateSESConfiguration, getSESConfiguration } from './notifications.service';
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg';
import { ReactComponent as Error } from '../../assets/icons/ic-warning.svg';
import { ReactComponent as Info } from '../../assets/icons/ic-info-filled.svg';
import { toast } from 'react-toastify';
import { ViewType } from '../../config/constants';
import { multiSelectStyles, DropdownIndicator } from './notifications.util';
import awsRegionList from '../common/awsRegionList.json'
import ReactSelect from 'react-select';

export interface SESConfigModalProps {
    sesConfigId: number;
    shouldBeDefault: boolean;
    selectSESFromChild?: (sesConfigId: number) => void;
    onSaveSuccess: () => void;
    closeSESConfigModal: (event) => void;
}

export interface SESConfigModalState {
    view: string;
    form: {
        configName: string;
        accessKey: string;
        secretKey: string;
        region: { label: string; value: string },
        fromEmail: string;
        default: boolean;
        isLoading: boolean;
        isError: boolean;
    };
    isValid: {
        configName: boolean;
        accessKey: boolean;
        secretKey: boolean;
        region: boolean;
        fromEmail: boolean;
    };
    secretKey: string;
}

export class SESConfigModal extends Component<SESConfigModalProps, SESConfigModalState> {
    _configName;
    awsRegionListParsed = awsRegionList.map(region => { return { label: region.name, value: region.value } });
    constructor(props) {
        super(props);
        this.state = {
            view: ViewType.LOADING,
            form: {
                configName: "",
                accessKey: "",
                secretKey: "",
                region: { label: "", value: "" },
                fromEmail: "",
                default: this.props.shouldBeDefault,
                isLoading: false,
                isError: true,
            },
            isValid: {
                configName: true,
                accessKey: true,
                secretKey: true,
                region: true,
                fromEmail: true,
            },
            secretKey: "",
        }
        this.handleConfigNameChange = this.handleConfigNameChange.bind(this);
        this.handleAWSRegionChange = this.handleAWSRegionChange.bind(this);
        this.handleAccessKeyIDChange = this.handleAccessKeyIDChange.bind(this);
        this.handleSecretAccessKeyChange = this.handleSecretAccessKeyChange.bind(this);
        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handleCheckbox = this.handleCheckbox.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
    }

    componentDidMount() {
        if (this.props.sesConfigId) {
            getSESConfiguration(this.props.sesConfigId).then((response) => {
                let state = { ...this.state };
                let region = response.result.region;
                let awsRegion = this.awsRegionListParsed.find(r => r.value === region);
                state.form = {
                    ...response.result,
                    isLoading: false,
                    isError: true,
                    region: awsRegion,
                    secretKey: "*******"
                };
                state.view = ViewType.FORM;
                state.isValid = {
                    configName: true,
                    accessKey: true,
                    secretKey: true,
                    region: true,
                    fromEmail: true,
                };
                state.secretKey = response.result.secretKey;
                this.setState(state);
            }).then(() => {
                this._configName.focus();
            }).catch((error) => {
                showError(error);
            })
        }
        else {
            let state = { ...this.state };
            state.form.default = this.props.shouldBeDefault;
            state.view = ViewType.FORM;
            this.setState(state);
            setTimeout(() => {
                if (this._configName) this._configName.focus();
            }, 100)
        }
    }

    handleBlur(event, key: string): void {
        let { isValid } = { ...this.state };
        if (key !== "region") isValid[key] = !!event.target.value.length;
        else isValid[key] = !!this.state.form.region.value;
        this.setState({ isValid });
    }

    handleConfigNameChange(event: React.ChangeEvent<HTMLInputElement>): void {
        let { form } = { ...this.state };
        form.configName = event.target.value;
        this.setState({ form });
    }

    handleAccessKeyIDChange(event: React.ChangeEvent<HTMLInputElement>): void {
        let { form, isValid } = { ...this.state };
        form.accessKey = event.target.value;
        this.setState({ form, isValid });
    }

    handleSecretAccessKeyChange(event: React.ChangeEvent<HTMLInputElement>): void {
        let { form, isValid } = { ...this.state };
        let secretKey = this.state.secretKey
        form.secretKey = event.target.value;
        if ((event.target.value.indexOf("*") < 0) && event.target.value.length > 0) {
            secretKey = event.target.value;
        }
        this.setState({ form, isValid, secretKey });
    }

    handleAWSRegionChange(event): void {
        let { form, isValid } = { ...this.state };
        form.region = event;
        isValid.region = !!event;
        this.setState({ form, isValid });
    }

    handleEmailChange(event: React.ChangeEvent<HTMLInputElement>): void {
        let { form, isValid } = { ...this.state };
        form.fromEmail = event.target.value;
        this.setState({ form, isValid });
    }

    handleCheckbox(event): void {
        let { form, isValid } = { ...this.state };
        form.default = !form.default;
        this.setState({ form, isValid });
    }

    getPayload = () => {
       return {
            ...this.state.form,
            region: this.state.form.region.value,
            secretKey: this.state.secretKey,
        };
    }

    saveSESConfig(): void {
        let keys = Object.keys(this.state.isValid);
        let isFormValid = keys.reduce((isFormValid, key) => {
            isFormValid = isFormValid && this.state.isValid[key];
            return isFormValid;
        }, true);
        isFormValid = isFormValid && validateEmail(this.state.form.fromEmail);
        if (!isFormValid) {
            let state = { ...this.state };
            state.form.isLoading = false;
            state.form.isError = true;
            this.setState(state);
            toast.error("Some required fields are missing or Invalid");
            return;
        }
        else {
            let state = { ...this.state };
            state.form.isLoading = true;
            state.form.isError = false;
            this.setState(state);
        }

        let promise = this.props.sesConfigId ? updateSESConfiguration(this.getPayload()) : saveSESConfiguration(this.getPayload());
        promise.then((response) => {
            let state = { ...this.state };
            state.form.isLoading = false;
            this.setState(state);
            toast.success("Saved Successfully");
            this.props.onSaveSuccess();
            if (this.props.selectSESFromChild) {
                this.props.selectSESFromChild(response?.result[0]);
            }
        }).catch((error) => {
            showError(error);
            let state = { ...this.state };
            state.form.isLoading = false;
            this.setState(state);
        })
    }

    renderWithBackdrop(body) {
        return <VisibleModal className="">
            <div className="modal__body modal__body--w-600 modal__body--p-0">
                <div className="modal__header m-24">
                    <h1 className="modal__title">Configure SES</h1>
                    <button type="button" className="transparent" onClick={this.props.closeSESConfigModal}>
                        <Close className="icon-dim-24" />
                    </button>
                </div>
                <form onSubmit={(event) => { event.preventDefault(); this.saveSESConfig() }}>
                    {body}
                </form>
            </div>
        </VisibleModal>
    }

    render() {
        let body;
        if (this.state.view === ViewType.LOADING) {
            body = <div style={{ height: "554px" }}>
                <Progressing pageLoader />
            </div>
        }
        else
            body = <>
                <div className="m-24 mb-32">
                    <label className="form__row">
                        <span className="form__label">Configuration Name*</span>
                        <input ref={node => this._configName = node} className="form__input" type="text" name="configname"
                            value={this.state.form.configName} onChange={this.handleConfigNameChange}
                            onBlur={(event) => this.handleBlur(event, "configName")}
                            placeholder="Configuration name" autoFocus={true} tabIndex={1} required />
                        <span className="form__error">
                            {!this.state.isValid.configName
                                ? <><Error className="form__icon form__icon--error" />This is a required field <br /></>
                                : null}
                        </span>
                    </label>
                    <label className="form__row">
                        <span className="form__label">Access Key ID*</span>
                        <input className="form__input" type="text" name="app-name"
                            value={this.state.form.accessKey} onChange={this.handleAccessKeyIDChange}
                            onBlur={(event) => this.handleBlur(event, "accessKey")}
                            placeholder="Access Key ID" tabIndex={2} required />
                        <span className="form__error">
                            {!this.state.isValid.accessKey
                                ? <><Error className="form__icon form__icon--error" />This is a required field <br /></>
                                : null}
                        </span>
                    </label>
                    <label className="form__row">
                        <span className="form__label">Secret Access Key*</span>
                        <input className="form__input" type="text" name="app-name"
                            value={this.state.form.secretKey} onChange={this.handleSecretAccessKeyChange}
                            onBlur={(event) => this.handleBlur(event, "secretKey")}
                            placeholder="Secret Access Key" tabIndex={3} required />
                        <span className="form__error">
                            {!this.state.isValid.secretKey
                                ? <><Error className="form__icon form__icon--error" />This is a required field <br /></>
                                : null}
                        </span>
                    </label>
                    <div className="form__row">
                        <label htmlFor="" className="form__label">AWS Region*</label>
                        <ReactSelect
                            defaultValue={this.state.form.region}
                            components={{
                                DropdownIndicator
                            }}
                            tabIndex={4}
                            placeholder="Select AWS Region"
                            styles={{
                                ...multiSelectStyles,
                                multiValue: base => ({
                                    ...base,
                                    border: `1px solid var(--N200)`,
                                    borderRadius: `4px`,
                                    background: 'white',
                                    height: '30px',
                                    margin: '0 8px 0 0',
                                    padding: '1px',
                                }),
                            }}
                            onBlur={(event) => this.handleBlur(event, "region")}
                            onChange={(selected) => this.handleAWSRegionChange(selected)}
                            options={this.awsRegionListParsed}
                        />
                        <span className="form__error">
                            {!this.state.isValid.region
                                ? <><Error className="form__icon form__icon--error" />This is a required field <br /></>
                                : null}
                        </span>

                    </div>
                    <label className="form__row">
                        <span className="form__label">Send email from*</span>
                        <input className="form__input" type="email" name="app-name"
                            value={this.state.form.fromEmail}
                            onBlur={(event) => this.handleBlur(event, "fromEmail")}
                            placeholder="Email" tabIndex={5} onChange={this.handleEmailChange} required />
                        <span className="form__error">
                            {!this.state.isValid.fromEmail
                                ? <><Error className="form__icon form__icon--error" />
                                        This is a required field
                                    <br /></>
                                : null}
                        </span>
                        <span className="form__text-field-info">
                            <Info className="form__icon form__icon--info" />This email must be verified with SES.
                            </span>
                    </label>
                </div>
                <div className="form__button-group-bottom flexbox flex-justify">
                    <Checkbox isChecked={this.state.form.default}
                        value={"CHECKED"}
                        tabIndex={6}
                        disabled={this.props.shouldBeDefault}
                        onChange={this.handleCheckbox} >
                        Set as default configuration to send emails
                    </Checkbox>
                    <div className="flex right">
                        <button type="button" className="cta cancel mr-16" tabIndex={8}
                            onClick={this.props.closeSESConfigModal}>Cancel
                            </button>
                        <button type="submit" className="cta" tabIndex={7} disabled={this.state.form.isLoading}>
                            {this.state.form.isLoading ? <Progressing /> : "Save"}
                        </button>
                    </div>
                </div>
            </>
        return this.renderWithBackdrop(body);
    }
}

