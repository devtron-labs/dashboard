import React, { Component } from 'react';
import { ReactComponent as Info } from '../../assets/icons/ic-info-filled.svg';
import { ReactComponent as Warn } from '../../assets/icons/ic-info-warn.svg';
import { ReactComponent as Error } from '../../assets/icons/ic-info-error.svg';
import { HostURLState, HostURLProps } from './hosturl.type';
import './hosturl.css';
import { Progressing, showError } from '../common';
import { ViewType } from '../../config';
import { toast } from 'react-toastify';
import { getHostURLConfigurationList } from '../../services/service';
import {  saveHostURLConfiguration, updateHostURLConfiguration } from './hosturl.service';

export default class HostURL extends Component<HostURLProps, HostURLState> {
    constructor(props) {
        super(props)
        this.state = ({
            view: ViewType.LOADING,
            statusCode: 0,
            isHostUrlSaved: false,
            form: {
                id: undefined,
                key: "url",
                value: "",
                active: true,
            },
            value: window.location.host,
            saveLoading: false,
        })
    }

    componentDidMount() {
        getHostURLConfigurationList().then((response) => {
             let form = response.result
             if (!form){
                 form = {
                    id: undefined,
                    key: "url",
                    value: "",
                    active: true,
                }
             }
                 this.setState({
                     view: ViewType.FORM,
                     form: form
                 },()=>{console.log(this.state)})
         }).catch((error) => {
             showError(error);
             this.setState({ view: ViewType.ERROR, statusCode: error.code });
         })
    }

    handleChange(event) {
        let newURL = event.target.value
        this.setState({
            form: {
                ...this.state.form,
                value: newURL
            }
        })
    }

    onSave() {
        this.setState({
            saveLoading: true
        })

        let payload = {
            id: this.state.form.id,
            key: this.state.form.key,
            value: this.state.form.value,
            active: this.state.form.active,
        }
        let promise = payload.id ? updateHostURLConfiguration(payload) : saveHostURLConfiguration(payload);
        console.log(payload)
        promise.then((response) => {
            toast.success("Saved Successful")
            this.setState({ 
                saveLoading: false ,
                form: response.result
            })
        }).catch((error) => {
            showError(error);
            this.setState({
                statusCode: error.code,
                saveLoading: false
            });
        })

    }

    handleHostURLLocation(value: string): void {
        this.setState({
            form :{   
                ...this.state.form,
                value: value
                } })
    }

    renderHostErrorMessage() {
        return <div className="hosturl__error ml-20 mr-20 mb-16 flex left">
            <Error className="icon-dim-20 mr-8" />
            <div>Saved host URL doesn’t match the domain address in your browser.</div>
        </div>
    }

    render() {
        if (this.state.view === ViewType.LOADING) return <div>
            <Progressing pageLoader />
        </div>
        return <section className="git-page">
            <h2 className="form__title">Host URL</h2>
            <h5 className="form__subtitle">Host URL is the domain address at which your devtron dashboard can be reached. &nbsp; </h5>
            <div className="white-wrapper">
                <div className="hosturl__description">
                    <div>
                        <div className="flex left">
                            <Info className="icon-dim-20 mr-8 " />
                            <div>Host URL is the domain address at which your devtron dashboard can be reached.</div>
                        </div>
                        <div className="ml-30">It is used to reach your devtron dashboard from external sources like configured webhooks, e-mail or slack notifications, grafana dashboard, etc.</div>
                    </div>
                </div>
                {(this.state.isHostUrlSaved) ? this.renderHostErrorMessage() : ''}

                <div className="pl-20 pr-20">
                    <div className="flex column left top ">
                        <div className="gitops__id fw-5 fs-13 mb-8">Host URL*</div>
                        <input id="host"
                            value={this.state.form.value}
                            type="text"
                            className="form__input"
                            placeholder={"Enter Host URL"}
                            onChange={(event) => this.handleChange(event)}
                            autoComplete="off" />
                    </div>
                    <div className="hosturl__autodetection flex left pt-4">
                        <Warn className="icon-dim-16 mr-8 " />
                        Auto-detected from your browser:
                        <button onClick={(e) => this.handleHostURLLocation(this.state.value)} className="hosturl__url"> {window.location.host}</button>
                    </div>
                    <div className="form__buttons pt-20">
                        <button type="submit" disabled={this.state.saveLoading} onClick={(e) => { e.preventDefault(); this.onSave() }} tabIndex={5} className="cta">
                            {this.state.saveLoading ? <Progressing /> : this.state.form.id ? "Update" : "Save"}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    }
}
