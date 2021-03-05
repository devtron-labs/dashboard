import React, { Component } from 'react'
import { showError, Pencil, useForm, Progressing, CustomPassword, VisibleModal, CustomInput, sortCallback } from '../common';
import { getClusterList, saveCluster, updateCluster, saveEnvironment, updateEnvironment, getEnvironmentList, getCluster, retryClusterInstall } from './cluster.service';
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg';
import { EnvironmentValue,EnvironmentProps, EnvironmentState } from './cluster.type'
import { toast } from 'react-toastify';

const DefaultEnvironmentValue = {
    environment_name: "",
    namespace: "",
    isProduction: "true",
    prometheus_endpoint: "",
    cluster_id: undefined
}

export class Environment extends Component<EnvironmentProps, EnvironmentState> {
    constructor(props) {
        super(props)
        this.state = {
            environment: [],
            id: undefined,
            loading: false,
            isclosed: false,
            saveLoading: false,
            isError: {
                environment_name: "",
                namespace: "",
            },
            form: {
                ...DefaultEnvironmentValue
            },
        }
        this.handleInputChange = this.handleInputChange.bind(this)
        this.handleOnSubmit = this.handleOnSubmit.bind(this);
    }

    componentDidMount() {
        this.fetchEnvironmentList();
    }

    fetchEnvironmentList() {
        getEnvironmentList().then((response) => {
            let environment = response.result?.find(item => item.active);
            this.setState({
                environment: environment,
            })
            if(!environment){
                environment = {
                    ...DefaultEnvironmentValue
                }
            }
            let isError = this.getFormErrors(false, environment)
            this.setState({
                environment: response.result || "",
                loading: false,
                saveLoading: false,
                form: environment,
                isError: isError,
                id: this.state.id
            })
            
        })
    }

    getFormErrors(isFormEdited, form: EnvironmentValue): any {
        if (!isFormEdited) return {
            environment_name : "",
            namespace: "",
        }

        let isError = {
            host: form.environment_name.length ? "" : "This is a required field",
            username: form.namespace.length ? "" : "This is a required field",
        };
        return isError;
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
                ...this.state.isError,
                [key]: e.target.value.length === 0 ? "This is a required field" : "",
                [key]: e.target.value.length < 3 ? "This is less than three " : "",
                [key]: e.target.value.length < 1 ? "This is less than one " : "",
            },
            isFormEdited: false,
        });
        console.log(name, value)
        
    };

    validation

    handleIgnore() {
        this.setState({

        })
    }

    handleOnSubmit() {

        this.setState({ saveLoading: true })
        let payload = {
            id: this.state.id,
            environment_name: this.state.form.environment_name,
            cluster_id: this.state.form.cluster_id,
            prometheus_endpoint: this.state.form.prometheus_endpoint,
            namespace: this.state.form.namespace || "",
            active: true,
            default: this.state.form.isProduction === 'true',
        }
        const api = payload.id ? updateEnvironment : saveEnvironment
        try {
            this.setState({
                loading: true,
            })
            api(payload, payload.id)
            toast.success(`Successfully ${payload.id ? 'updated' : 'saved'}`)
            this.setState({
                isclosed: true
            })
        }
        catch (err) {
            showError(err)
        }
        finally {

        }

    }

    render() {
        return <VisibleModal className="environment-create-modal" close={this.props.close}>
            <form className="environment-create-body" onClick={(e) => e.stopPropagation()} onSubmit={this.handleOnSubmit} >
                <div className="form__row">
                    <div className="flex left">
                        <div className="form__title">{this.state.id ? 'Update Environment' : 'New Environment'}</div>
                        <Close className="icon-dim-24 align-right cursor"  onClick={this.props.close} />
                    </div>
                </div>
                <div className="form__row">
                    <CustomInput
                        autoComplete="off"
                        name="environment_name"
                        value={this.state.form.environment_name}
                        error={[{name: this.state.isError.environment_name}]}
                        onChange={(e) => this.handleInputChange(e, 'environment_name' )}
                        label="Environment Name*" />
                </div>
                <div className="form__row form__row--namespace">
                    <CustomInput
                        autoComplete="off"
                        name="namespace"
                        value={this.state.form.namespace}
                        error={[{name: this.state.isError.namespace}]}
                        onChange={e => this.handleInputChange(e, 'namespace')}
                        label={`Enter Namespace ${this.props.isNamespaceMandatory ? '*' : ''}`} />
                </div>
                {!this.props.isNamespaceMandatory && <><div className="form__row form__row--ignore-namespace">
                    <input type="checkbox"
                        onChange={this.handleIgnore}
                        checked={this.props.ignore} />
                    <div className="form__label bold">Ignore namespace</div>
                </div>
                    <div className="form__row form__row--warn">
                        If left empty, you won't be able to add more
                        environments to this cluster
                </div>
                    {this.props.ignoreError && <div className="form__row form__error">{this.props.ignoreError}</div>}
                </>}
                <div className="form__row">
                    <div className="form__label">Environment type*</div>
                    <div className="environment-type pointer">
                        <div className="flex left environment environment--production">
                            <label className="form__label">
                                <input
                                    type="radio"
                                    name="isProduction"
                                    checked={DefaultEnvironmentValue.isProduction === 'true'}
                                    value="true"
                                   // onChange={this.handleInputChange(e)}
                                />
                                <span>Production</span></label>
                        </div>
                        <div className="flex left environment environment--non-production">
                            <label className="form__label">
                                <input
                                    type="radio"
                                    name="isProduction"
                                    checked={DefaultEnvironmentValue.isProduction === 'false'}
                                    value="false"
                                 //   onChange={this.handleInputChange}
                                />
                                <span>Non - Production</span></label>
                        </div>
                    </div>
                </div>
                <div className="form__buttons">
                    <button className="cta" type="submit" disabled={this.state.loading}>{this.state.loading ? <Progressing /> : this.state.id ? 'Update' : 'Save'}</button>
                </div>
            </form>
        </VisibleModal>
    }
}
