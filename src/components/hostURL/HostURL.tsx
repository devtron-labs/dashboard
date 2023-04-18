import React, { Component } from 'react';
import { ReactComponent as Info } from '../../assets/icons/ic-info-filled.svg';
import { ReactComponent as Warn } from '../../assets/icons/ic-info-warn.svg';
import { ReactComponent as Error } from '../../assets/icons/ic-error-exclamation.svg';
import { HostURLConfigState, HostURLConfigProps } from './hosturl.type';
import {
    showError,
    Progressing,
    ErrorScreenManager,
    ErrorScreenNotAuthorized,
    InfoColourBar,
} from '@devtron-labs/devtron-fe-common-lib'
import { ViewType } from '../../config';
import { toast } from 'react-toastify';
import { getHostURLConfiguration } from '../../services/service';
import TriangleAlert from '../../assets/icons/ic-alert-triangle.svg';
import { saveHostURLConfiguration, updateHostURLConfiguration } from './hosturl.service';
import './hosturl.scss';
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
        if(this.props.isSuperAdmin){
        getHostURLConfiguration()
            .then((response) => {
                let form = response.result || {
                    id: undefined,
                    key: 'url',
                    value: '',
                    active: true,
                }

                if (!form.value) {
                    const payload = {
                        id: form.id,
                        key: form.key,
                        value: window.location.origin,
                        active: form.active,
                    }
                    saveHostURLConfiguration(payload)
                        .then((response) => {
                            this.setState({
                                view: ViewType.FORM,
                                form: response.result,
                            })
                        })
                        .catch((err) => {
                            showError(err)
                            this.setState({ view: ViewType.ERROR, statusCode: err.code })
                        })
                } else {
                    this.setState({
                        view: ViewType.FORM,
                        form: form,
                    })
                }
            })
            .catch((error) => {
                showError(error)
                this.setState({ view: ViewType.ERROR, statusCode: error.code })
            })
        }
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
        }else if(!this.state.form.id){
          return
        }
        this.setState({ saveLoading: true, })
        const payload = {
            id: this.state.form.id,
            key: this.state.form.key,
            value: this.state.form.value,
            active: this.state.form.active,
        }

        updateHostURLConfiguration(payload).then((response) => {
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
        return <InfoColourBar classname='dc__hosturl-error m-20' message="Saved host URL doesn’t match the domain address in your browser." Icon={Error} />
    }

    renderBlankHostField() {
        return (
            <div className="flex left pt-4">
                <img src={TriangleAlert} alt="" className="icon-dim-16 mr-8" />
                <div className="dc__deprecated-warn-text fs-11" data-testid="empty-host-url">
                    Please enter host url
                </div>
            </div>
        )
    }

    render() {
        if (!this.props.isSuperAdmin) {
            return <ErrorScreenNotAuthorized />
        }
        if (this.state.view === ViewType.LOADING) {
            return <Progressing pageLoader />
        } else if (this.state.view === ViewType.ERROR) {
            return (
                <section className="global-configuration__component flex">
                    <ErrorScreenManager code={this.state.statusCode} />
                </section>
            )
        }
        return (
            <>
                <section
                    className="mt-16 mb-16 ml-20 mr-20 global-configuration__component"
                    data-testid="section-host-url"
                >
                    <h2 className="form__title" data-testid="host-url-heading">
                        Host URL
                    </h2>
                    <p className="form__subtitle">
                        Host URL is the domain address at which your devtron dashboard can be reached. &nbsp;{' '}
                    </p>
                    <form className="bcn-0 br-8 bw-1 en-2 pb-22 " data-testid="form-host-url">
                        <InfoColourBar
                            classname="hosturl__description m-20"
                            message={
                                <>
                                    Host URL is the domain address at which your devtron dashboard can be reached.
                                    <br />
                                    It is used to reach your devtron dashboard from external sources like configured
                                    webhooks, e-mail or slack notifications, grafana dashboard, etc.
                                </>
                            }
                            Icon={Info}
                        />
                        {this.state.form.id && window.location.origin !== this.state.form.value
                            ? this.renderHostErrorMessage()
                            : ''}
                        <div className="pl-20 pr-20">
                            <div className="flex column left top ">
                                <div className="gitops__id fw-5 fs-13 mb-8 dc__required-field">Host URL</div>
                                <input
                                    id="host"
                                    value={this.state.form.value}
                                    autoFocus
                                    tabIndex={1}
                                    type="text"
                                    className="form__input"
                                    placeholder={'Enter Host URL'}
                                    onChange={(event) => this.handleChange(event)}
                                    autoComplete="off"
                                    data-testid="host-url-textbox"
                                />
                            </div>
                            {!this.state.isHostUrlValid ? this.renderBlankHostField() : ''}
                            <div className="hosturl__autodetection flex fs-12 left pt-4">
                                <Warn className="icon-dim-16 mr-4 " />
                                Auto-detected from your browser:
                                <button
                                    type="button"
                                    onClick={(e) => this.handleHostURLLocation(window.location.origin)}
                                    className="hosturl__url fw-4 cg-5"
                                    data-testid="clickable-url"
                                >
                                    {window.location.origin}
                                </button>
                            </div>
                            <div className="form__buttons pt-20">
                                <button
                                    type="button"
                                    tabIndex={2}
                                    disabled={this.state.saveLoading}
                                    onClick={(e) => {
                                        this.onSave()
                                    }}
                                    className="cta"
                                    data-testid="host-url-update-button"
                                >
                                    {this.state.saveLoading ? <Progressing /> : this.state.form.id ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </form>
                </section>
            </>
        )
    }
}
