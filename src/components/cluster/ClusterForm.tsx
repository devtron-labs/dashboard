import React, { Component } from 'react'
import { CustomInput, Progressing, CustomPassword, showError } from '../common';
import { RadioGroup, RadioGroupItem } from '../common/formFields/RadioGroup';
import { toast } from 'react-toastify';
import { saveCluster, updateCluster } from './cluster.service';
import { ResizableTextarea } from '../configMaps/ConfigMap';
import { ClusterFormState, AuthenticationType } from './cluster.type';
import { Cluster } from './cluster.type';

const DefaultCluster: Cluster = {
    id: undefined,
    cluster_name: "",
    bearer_token: "",
    prometheus_url: "",
    server_url: "",
    userName: "",
    password: "",
    tlsClientKey: "",
    tlsClientCert: "",
    authType: "",
    active: false,
}

export interface ClusterFormProps {
    id: number;
    cluster_name: string;
    server_url: string;
    active: boolean;
    config: {
        bearer_token: string;
    };
    environments: string[];
    prometheus_url: string;
    prometheusAuth: {
        userName?: string;
        password?: string;
        tlsClientKey?: string;
        tlsClientCert?: string;
    };
    toggleEditMode: (flag: boolean) => void;
    reload: () => void;
}

export class ClusterForm extends Component<ClusterFormProps, ClusterFormState> {

    constructor(props) {
        super(props)
        let authenTicationType = this.props.prometheusAuth && this.props.prometheusAuth.userName ? AuthenticationType.BASIC : AuthenticationType.ANONYMOUS

        this.state = {
            isFormLoading: true,
            saveLoading: false,
            form: {
                id: this.props.id,
                cluster_name: this.props.cluster_name,
                bearer_token: this.props.config?.bearer_token || "",
                prometheus_url: this.props.prometheus_url,
                server_url: this.props.server_url,
                userName: this.props.prometheusAuth?.userName,
                password: this.props.prometheusAuth?.password,
                tlsClientKey: this.props.prometheusAuth?.tlsClientKey,
                tlsClientCert: this.props.prometheusAuth?.tlsClientCert,
                authType: authenTicationType,
                active: this.props.active,
            },
            isError: {
                cluster_name: [],
                bearer_token: [],
                prometheus_url: [],
                server_url: [],
                userName: [],
                password: [],
                tlsClientKey: [],
                tlsClientCert: [],
            },
        }
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleInputChange = (event, key): void => {
        const value = event.target.value;
        let errors = [];
        switch (key) {
            case 'cluster_name': errors = this.handleNameValdation(value); break;
            case 'server_url': errors = this.handleServerUrlValidation(value); break;
            case 'bearer_token': errors = this.handleBearerTokenValidation(value); break;
            case 'prometheus_url': errors = this.handlePrometheusUrlValidation(value); break;
            case 'userName': errors = this.handleUsernameValidation(this.state.form.authType, value); break;
            case 'password': errors = this.handlePasswordValidation(this.state.form.authType, value); break;
            case 'tlsClientKey': errors = this.handleTlsClientKeyValidation(value); break;
            case 'tlsClientCert': errors = this.handleTlsClientCertValidation(value); break;
            default: break;
        }

        this.setState({
            ...this.state,
            form: {
                ...this.state.form,
                [key]: value
            },
            isError: {
                ...this.state.isError,
                [key]: errors
            }
        });
    };

    handleNameValdation(name: string): { name: string }[] {
        if (!name.length) return [{ name: "This is a required field" }];
        if (name.length <= 5) {
            return [{ name: "Atleast 5 characters required" }];
        }
        if (name.length >= 16) {
            return [{ name: "More than 16 characters are not allowed" }];
        }

        let errors = [];
        let allLowercaseAlphanumeric = new RegExp(/[a-z0-9._-]+/);
        let startAndEndsWithLowercase = new RegExp(/^[a-z]$/);

        if (!allLowercaseAlphanumeric.test(name)) {
            errors.push({ name: "Use only lowercase alphabet, '_', '-' and '.' " });
        }
        if (!startAndEndsWithLowercase.test(name)) {
            errors.push({ name: "Must start and end with lowercase alphabet only" });
        }

        return errors;
    }

    handleServerUrlValidation(serverUrl: string): { name: string }[] {
        if (!serverUrl.length) return [{ name: "This is a required field" }];
    }

    handleBearerTokenValidation(token: string): { name: string }[] {
        if (!token.length) return [{ name: "This is a required field" }];
    }

    handlePrometheusUrlValidation(prometheusUrl: string): { name: string }[] {
        if (!prometheusUrl.length) return [{ name: "This is a required field" }];
    }

    handleUsernameValidation(authType, username: string): { name: string }[] {
        if (authType === AuthenticationType.BASIC && !username.length) return [{ name: "This is a required field" }];
    }

    handlePasswordValidation(authType, password: string): { name: string }[] {
        if (authType === AuthenticationType.BASIC && !password.length) return [{ name: "This is a required field" }];
    }

    handleTlsClientKeyValidation(tlsClientKey: string): { name: string }[] {
        let errors = [];
        return errors;
    }

    handleTlsClientCertValidation(tlsClientCert: string): { name: string }[] {
        let errors = [];
        return errors;
    }

    handleSubmit(event): void {
        event.preventDefault();

        let payload = {
            id: this.state.form.id,
            active: this.state.form.active,
            cluster_name: this.state.form.cluster_name,
            config: {
                bearer_token: this.state.form.bearer_token
            },
            prometheusAuth: {
                userName: this.state.form.userName,
                password: this.state.form.password,
            },
            server_url: this.state.form.server_url,
            prometheus_url: this.state.form.prometheus_url,
        }

        if (this.state.form.authType === AuthenticationType.BASIC) {
            payload.prometheusAuth['userName'] = this.state.form.userName || "";
            payload.prometheusAuth['password'] = this.state.form.password || "";
        }
        if (this.state.form.tlsClientKey || this.state.form.tlsClientCert) {
            payload.prometheusAuth['tlsClientKey'] = this.state.form.tlsClientKey || "";
            payload.prometheusAuth['tlsClientCert'] = this.state.form.tlsClientCert || "";
        }

        this.setState({ saveLoading: true })
        const api = this.state.form.id ? updateCluster(payload) : saveCluster(payload);

        api.then((response) => {
            this.props.reload();
            this.props.toggleEditMode(false);
            this.setState({ saveLoading: false });
            toast.success("Saved Successfully");
        }).catch((error) => {
            showError(error);
        })
    }

    render() {
        return <form onSubmit={this.handleSubmit} className="pl-24 pr-24 pb-24 pt-0 cluster-form">
            <h2 className="fs-16 fw-6 cn-9 mt-22 mb-22 lh-1-25">{this.state.form.id ? "Edit Cluster" : "Add Cluster"}</h2>
            <div className="form__row">
                <CustomInput
                    name="cluster_name"
                    autoComplete="off"
                    value={this.state.form.cluster_name}
                    error={this.state.isError.cluster_name}
                    onChange={(e) => this.handleInputChange(e, 'cluster_name')}
                    label="Name*" />
            </div>
            <hr></hr>
            <div className="form__input-header mb-8">Kubernetes Cluster Info</div>
            <div className="form__row">
                <CustomInput name="server_url"
                    autoComplete="off"
                    value={this.state.form.server_url}
                    error={this.state.isError.server_url}
                    onChange={(e) => this.handleInputChange(e, 'server_url')}
                    label="Server URL*" />
            </div>
            <div className="form__row form__row--bearer-token flex column left top">
                <label htmlFor="" className="form__label">Bearer token*</label>
                <div className="bearer-token">
                    <ResizableTextarea className="resizable-textarea__with-max-height"
                        name="token"
                        value={this.state.form.bearer_token}
                        onChange={(e) => this.handleInputChange(e, 'bearer_token')} />
                </div>
            </div>
            <hr></hr>
            <div className="form__input-header mb-8">Prometheus Info</div>
            <div className="form__row">
                <CustomInput name="endpoint"
                    autoComplete="off"
                    value={this.state.form.prometheus_url}
                    error={this.state.isError.prometheus_url}
                    onChange={(e) => this.handleInputChange(e, 'prometheus_url')}
                    label="Prometheus endpoint*" />
            </div>
            <div className="form__row">
                <span className="form__label">Authentication Type*</span>
                <RadioGroup value={this.state.form.authType} name={`authType`}
                    onChange={(e) => this.handleInputChange(e, 'authType')}>
                    <RadioGroupItem value={AuthenticationType.BASIC}> Basic  </RadioGroupItem>
                    <RadioGroupItem value={AuthenticationType.ANONYMOUS}>  Anonymous  </RadioGroupItem>
                </RadioGroup>
            </div>
            {this.state.form.authType === AuthenticationType.BASIC ?
                <div className="form__row form__row--flex">
                    <div className="w-50 mr-8">
                        <CustomInput
                            name="userName"
                            value={this.state.form.userName}
                            error={this.state.isError.userName}
                            onChange={(e) => this.handleInputChange(e, 'userName')}
                            label="Username*" />
                    </div>
                    <div className="w-50 ml-8">
                        <CustomPassword
                            name="password"
                            value={this.state.form.password}
                            error={this.state.isError.password}
                            onChange={(e) => this.handleInputChange(e, 'password')}
                            label="Password*" />
                    </div>
                </div> : null}
            <div className="form__row">
                <span className="form__label">TLS Key</span>
                <ResizableTextarea
                    className="resizable-textarea__with-max-height w-100"
                    name="tlsClientKey"
                    value={this.state.form.tlsClientKey}
                    onChange={(e) => this.handleInputChange(e, 'tlsClientKey')} />
            </div>
            <div className="form__row">
                <span className="form__label">TLS Certificate</span>
                <ResizableTextarea
                    className="resizable-textarea__with-max-height w-100"
                    name="tlsClientCert"
                    value={this.state.form.tlsClientCert}
                    onChange={(e) => this.handleInputChange(e, 'tlsClientCert')} />
            </div>
            <div className="form__buttons">
                <button className="cta cancel" type="button" onClick={(e) => this.props.toggleEditMode(false)}>
                    Cancel
                </button>
                <button type="submit" className="cta">{this.state.saveLoading ? <Progressing /> : 'Save cluster'}</button>
            </div>
        </form>
    }
}