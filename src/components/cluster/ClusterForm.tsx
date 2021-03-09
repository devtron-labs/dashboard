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
        return <form onSubmit={this.handleSubmit} className="cluster-form">
            <h2 className="form__title">Edit cluster</h2>
            <div className="form__row">
                <CustomInput
                    autoComplete="off"
                    name="cluster_name"
                    value={this.state.form.cluster_name}
                    error={this.state.isError.cluster_name}
                    onChange={(e) => this.handleInputChange(e, 'cluster_name')}
                    label="Name*" />
            </div>
            <hr></hr>
            <div className="form__input-header mb-8">Kubernetes Cluster Info</div>
            <div className="form__row">
                <CustomInput
                    autoComplete="off"
                    name="server_url"
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
                <CustomInput
                    autoComplete="off"
                    name="endpoint"
                    value={this.state.form.prometheus_url}
                    error={this.state.isError.prometheus_url}
                    onChange={(e) => this.handleInputChange(e, 'prometheus_url')}
                    label="Prometheus endpoint*" />
            </div>
            <div className="form__row">
                <span className="form__label">Authentication Type*</span>
                <RadioGroup value={this.state.form.authType} name={`authType`} onChange={(e) => this.handleInputChange(e, 'authType')}>
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
                <button className="cta cancel" type="button" onClick={(e) => this.props.toggleEditMode(true)}>
                    Cancel
                </button>
                <button type="submit" className="cta">{this.state.saveLoading ? <Progressing /> : 'Save cluster'}</button>
            </div>
        </form>
    }
}
