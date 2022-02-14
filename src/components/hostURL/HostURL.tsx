import React, { Component } from 'react';
import { ReactComponent as Info } from '../../assets/icons/ic-info-filled.svg';
import { ReactComponent as Warn } from '../../assets/icons/ic-info-warn.svg';
import { ReactComponent as Error } from '../../assets/icons/ic-error-exclamation.svg';
import { HostURLConfigState, HostURLConfigProps } from './hosturl.type';
import { ErrorScreenManager, Progressing, showError } from '../common';
import { ViewType } from '../../config';
import { toast } from 'react-toastify';
import { getHostURLConfiguration } from '../../services/service';
import TriangleAlert from '../../assets/icons/ic-alert-triangle.svg';
import { saveHostURLConfiguration, updateHostURLConfiguration } from './hosturl.service';
import './hosturl.css';
export default class HostURLConfiguration extends Component<HostURLConfigProps, HostURLConfigState> {

    constructor(props) {
        super(props)
        this.state = ({
            view: ViewType.LOADING,
            statusCode: 0,
            form: {
                id: undefined,
                key: "url",
                value: "",
                active: true,
            },
            isHostUrlValid: true,
            saveLoading: false,
        })
    }

    componentDidMount() {
        getHostURLConfiguration().then((response) => {
            let form = response.result;
            if (!form) {
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
            })
        }).catch((error) => {
            showError(error);
            this.setState({ view: ViewType.ERROR, statusCode: error.code });
        })
    }

    handleChange(event): void {
        let newURL = event.target.value
        this.setState({
            form: {
                ...this.state.form,
                value: newURL
            },
            isHostUrlValid: newURL?.length > 0
        })
    }

    onSave(): void {
        if (!this.state.form.value.length) {
            toast.error("Some required fields are missing");
            return;
        }
        this.setState({ saveLoading: true, })
        let payload = {
            id: this.state.form.id,
            key: this.state.form.key,
            value: this.state.form.value,
            active: this.state.form.active,
        }
        let promise = payload.id ? updateHostURLConfiguration(payload) : saveHostURLConfiguration(payload);
        promise.then((response) => {
            toast.success("Saved Successful")
            this.setState({
                saveLoading: false,
                form: response.result,
            })
            this.props.refreshGlobalConfig();
            this.props.handleChecklistUpdate('hostUrl')
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
            form: {
                ...this.state.form,
                value: value
            },
            isHostUrlValid: value?.length > 0
        })
    }

    renderHostErrorMessage() {
        return <div className="hosturl__error ml-20 mr-20 mb-16 flex left">
            <Error className="icon-dim-20 mr-8" />
            <div>Saved host URL doesn’t match the domain address in your browser.</div>
        </div>
    }

    renderBlankHostField() {
        return <div className="flex left pt-4">
            <img src={TriangleAlert} alt="" className="icon-dim-16 mr-8" />
            <div className="deprecated-warn__text fs-11">Please enter host url</div>
        </div>
    }

    render() {
        if (this.state.view === ViewType.LOADING) {
            return <Progressing pageLoader />
        }
        else if (this.state.view === ViewType.ERROR) {
            return <section className="global-configuration__component flex" >
                <ErrorScreenManager code={this.state.statusCode} />
            </section>
        }
        return <>
            <section className="mt-16 mb-16 ml-20 mr-20 global-configuration__component">
                <h2 className="form__title">Host URL</h2>
                <h5 className="form__subtitle">Host URL is the domain address at which your devtron dashboard can be reached. &nbsp; </h5>
                <form className="bcn-0 br-8 bw-1 en-2 pb-22 ">
                    <div className="hosturl__description">
                        <div>
                            <div className="flex left ">
                                <Info className="icon-dim-20 mr-8 " />
                                <div>Host URL is the domain address at which your devtron dashboard can be reached.</div>
                            </div>
                            <div className="ml-30">It is used to reach your devtron dashboard from external sources like configured webhooks, e-mail or slack notifications, grafana dashboard, etc.</div>
                        </div>
                    </div>
                    {(this.state.form.id && window.location.origin !== this.state.form.value) ? this.renderHostErrorMessage() : ''}
                    <div className="pl-20 pr-20">
                        <div className="flex column left top ">
                            <div className="gitops__id fw-5 fs-13 mb-8">Host URL*</div>
                            <input id="host"
                                value={this.state.form.value}
                                autoFocus
                                tabIndex={1}
                                type="text"
                                className="form__input"
                                placeholder={"Enter Host URL"}
                                onChange={(event) => this.handleChange(event)}
                                autoComplete="off" />
                        </div>
                        {!this.state.isHostUrlValid ? this.renderBlankHostField() : ''}
                        <div className="hosturl__autodetection flex fs-12 left pt-4">
                            <Warn className="icon-dim-16 mr-4 " />
                        Auto-detected from your browser:
                        <button type="button" onClick={(e) => this.handleHostURLLocation(window.location.origin)} className="hosturl__url fw-4 cg-5"> {window.location.origin}</button>
                        </div>
                        <div className="form__buttons pt-20">
                            <button type="button"
                                tabIndex={2}
                                disabled={this.state.saveLoading}
                                onClick={(e) => { this.onSave() }}
                                className="cta">
                                {this.state.saveLoading ? <Progressing /> : this.state.form.id ? "Update" : "Save"}
                            </button>
                        </div>
                    </div>
                </form>
            </section>
        </>
    }
}
