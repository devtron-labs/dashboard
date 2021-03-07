import React, { Component } from 'react'
import { showError, Pencil, useForm, Progressing, CustomPassword, VisibleModal, sortCallback } from '../common';
import { RadioGroup, RadioGroupItem } from '../common/formFields/RadioGroup';
import {  CustomInput } from '../globalConfigurations/GlobalConfiguration'
import { toast } from 'react-toastify';
import { getClusterList, saveCluster, updateCluster, getCluster, retryClusterInstall } from './cluster.service';
import { ConfigMapForm, ResizableTextarea } from '../configMaps/ConfigMap'
import { ClusterFormState, ClusterFormProps, AuthenticationType } from './cluster.type';

const Config= {
    bearer_token: ""

}
const DefaultChartValue= {
    cluster_name: "",
    url: "",
    config: Config,
    endpoint: "",
    userName: "",
    password: "",
    tlsClientKey: "",
    tlsClientCert: "",
    clusterId: undefined,
    authType: "",
}

export class ClusterForm extends Component<ClusterFormProps, ClusterFormState> {
    constructor(props) {
        super(props)
    
        this.state = {
            id: undefined,
            loading: true,
            saveLoading: false,
            isClusterError: undefined,
            form: {
                ...DefaultChartValue
            },
            isError: {
                cluster_name: "",
                url: "",
                endpoint: "",
                userName: "",
                password: "",
            },
        }
        this.handleInputChange = this.handleInputChange.bind(this)
        //this.handleOnSubmit = this.handleOnSubmit.bind(this);
    }
    handleInputChange = (e, key: "environment_name" | "namespace" ) => {
        const { name, value } = e.target;
       if(value.length < 0){ return "too short"}



        this.setState({
            ...value,
            form: {
                ...this.state.form,
                [name]: value
            },
            isError: {
                [key]: e.target.value.length === 0 ? "This is a required field" : "",
                [key]: e.target.value.length < 3 ? "This is less than three " : "",
                [key]: e.target.value.length < 2 ? "This is less than one " : "",
            },
            isFormEdited: false,
        });
        console.log(name, value)
        
    };
    
    render() {
        return (
            <div>
                <form action="" className="cluster-form" //onSubmit={handleOnSubmit}
            >
                <h2 className="form__title">Edit cluster</h2>
                <div className="form__row">
                    <CustomInput
                        autoComplete="off"
                        name="cluster_name"
                        value={this.state.form.cluster_name}
                        error={[{name: this.state.isError.cluster_name}]}
                        onChange={(e) => this.handleInputChange(e, 'environment_name' )}
                        label="Name*" />
                </div>
                <hr></hr>
                <div className="form__input-header mb-8">Kubernetes Cluster Info</div>
                <div className="form__row">
                    <CustomInput
                        autoComplete="off"
                        name="url"
                        value={this.state.form.url}
                        error={[{name: this.state.isError.url}]}
                        onChange={(e) => this.handleInputChange(e, 'environment_name' )}
                        label="Server URL*" />
                </div>
                <div className="form__row form__row--bearer-token flex column left top">
                    <label htmlFor="" className="form__label">Bearer token*</label>
                    <div className="bearer-token">
                        <ResizableTextarea 
                        className="resizable-textarea__with-max-height" 
                        name="token" 
                        value={this.state.form.config && this.state.form.config.bearer_token ? this.state.form.config.bearer_token : ""} 
                        onChange={(e) => this.handleInputChange(e, 'environment_name' )} />
                    </div>
        
                </div>
                <hr></hr>
                <div className="form__input-header mb-8">Prometheus Info</div>
                <div className="form__row">
                    <CustomInput
                        autoComplete="off"
                        name="endpoint"
                        value={this.state.form.endpoint}
                        error={[{name: this.state.isError.endpoint}]}
                        onChange={(e) => this.handleInputChange(e, 'environment_name' )}
                        label="Prometheus endpoint*" />
                </div>
                <div className="form__row">
                    <span className="form__label">Authentication Type*</span>
                    <RadioGroup value={this.state.form.authType} name={`authType`} onChange={(e) => this.handleInputChange(e, 'environment_name' )}>
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
                            error={[{name: this.state.isError.userName}]} 
                            onChange={(e) => this.handleInputChange(e, 'environment_name' )} 
                            label="Username*" />
                        </div>
                        <div className="w-50 ml-8">
                            <CustomPassword 
                            name="password" 
                            value={this.state.form.password} 
                            error={[{name: this.state.isError.password}]}  
                            onChange={(e) => this.handleInputChange(e, 'environment_name' )} 
                            label="Password*" />
                        </div>
                    </div>
                    : null}
                <div className="form__row">
                    <span className="form__label">TLS Key</span>
                    <ResizableTextarea 
                    className="resizable-textarea__with-max-height w-100" 
                    name="tlsClientKey" 
                    value={this.state.form.tlsClientKey} 
                    onChange={(e) => this.handleInputChange(e, 'environment_name' )} />
                </div>
                <div className="form__row">
                    <span className="form__label">TLS Certificate</span>
                    <ResizableTextarea 
                    className="resizable-textarea__with-max-height w-100" 
                    name="tlsClientCert" 
                    value={this.state.form.tlsClientCert} 
                    onChange={(e) => this.handleInputChange(e, 'environment_name' )} />
                </div>
                <div className="form__buttons">
                    <button className="cta cancel" type="button"
                    //onClick={e => toggleEditMode(t => !t)}
                    >Cancel</button>
                    <button className="cta">{this.state.loading ? <Progressing /> : 'Save cluster'}</button>
                </div>
            </form>
                
            </div>
        )
    }
}
