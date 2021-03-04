import React, { Component } from 'react'
import { showError, Pencil, useForm, Progressing, CustomPassword, VisibleModal, sortCallback } from '../common';
import { List, CustomInput } from '../globalConfigurations/GlobalConfiguration'
import { getClusterList, saveCluster, updateCluster, saveEnvironment, updateEnvironment, getEnvironmentList, getCluster, retryClusterInstall } from './cluster.service';
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg';
import { EnvironmentProps, EnvironmentState } from './cluster.type'

const DefaultEnvironmentValue = {
    environment_name: "",
    namespace: "",
    isProduction: "true"
}

export class Environment extends Component<EnvironmentProps, EnvironmentState> {
    constructor(props) {
        super(props)
        this.state = {
            environment: [],
            id: undefined,
            loading: false,
            error: "",
            form: {
                ...DefaultEnvironmentValue
            },
        }
        this.handleInputChange = this.handleInputChange.bind(this)
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
        })
    }

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState({
            ...value,
            form: {
                ...this.state.form,
                [name]: value
            }
        });
        console.log(name, value)
    };

    handleClose() {
        this.setState({

        })
    }

    handleIgnore() {
        this.setState({

        })
    }
    render() {
        return <VisibleModal className="environment-create-modal" close={this.handleClose}>
            <form className="environment-create-body" onClick={(e) => e.stopPropagation()} >
                <div className="form__row">
                    <div className="flex left">
                        <div className="form__title">{this.state.id ? 'Update Environment' : 'New Environment'}</div>
                        <Close className="icon-dim-24 align-right cursor" onClick={this.handleClose} />
                    </div>
                </div>
                <div className="form__row">
                    <CustomInput
                        autoComplete="off"
                        name="environment_name"
                        value={this.state.form.environment_name}
                        error={this.state.error}
                        onChange={this.handleInputChange}
                        label="Environment Name*" />
                </div>
                <div className="form__row form__row--namespace">
                    <CustomInput
                        disabled={!!DefaultEnvironmentValue.namespace || this.props.ignore}
                        name="namespace"
                        value={DefaultEnvironmentValue.namespace}
                        error={this.state.error} onChange={this.handleInputChange}
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
                                    onChange={this.handleInputChange}
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
                                    onChange={this.handleInputChange}
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