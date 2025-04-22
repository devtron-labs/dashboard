/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component } from 'react'
import {
    showError,
    Progressing,
    ErrorScreenManager,
    ErrorScreenNotAuthorized,
    CustomInput,
    FeatureTitleWithInfo,
    ToastVariantType,
    ToastManager,
    InfoBlock,
} from '@devtron-labs/devtron-fe-common-lib'
import { HostURLConfigState, HostURLConfigProps } from './hosturl.type'
import { HEADER_TEXT, NO_HOST_URL, ViewType } from '../../config'
import { getHostURLConfiguration } from '../../services/service'
import TriangleAlert from '../../assets/icons/ic-alert-triangle.svg'
import { saveHostURLConfiguration, updateHostURLConfiguration } from './hosturl.service'
import './hosturl.scss'

const renderInfoContent = () => (
    <>
        Host URL is the domain address at which your devtron dashboard can be reached.
        <br />
        It is used to reach your devtron dashboard from external sources like configured webhooks, e-mail or
        slack notifications, grafana dashboard, etc.
    </>
)
export default class HostURLConfiguration extends Component<HostURLConfigProps, HostURLConfigState> {
    constructor(props) {
        super(props)
        this.state = {
            view: ViewType.LOADING,
            statusCode: 0,
            form: {
                id: undefined,
                key: 'url',
                value: '',
                active: true,
            },
            isHostUrlValid: true,
            saveLoading: false,
        }
    }

    componentDidMount() {
        if (this.props.isSuperAdmin) {
            getHostURLConfiguration()
                .then((response) => {
                    const form = response.result || {
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
                            form,
                        })
                    }
                })
                .catch((error) => {
                    showError(error)
                    this.setState({ view: ViewType.ERROR, statusCode: error.code })
                })
        }
    }

    handleChange = (event): void => {
        this.setState({
            form: {
                ...this.state.form,
                value: event.target.value,
            },
            isHostUrlValid: event.target.value?.length > 0,
        })
    }

    onSave = (e: React.SyntheticEvent): void => {
        e.preventDefault()
        if (!this.state.form.value.length) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Some required fields are missing',
            })
            return
        }
        if (!this.state.form.id) {
            return
        }
        this.setState({ saveLoading: true })
        const payload = {
            id: this.state.form.id,
            key: this.state.form.key,
            value: this.state.form.value,
            active: this.state.form.active,
        }

        updateHostURLConfiguration(payload)
            .then((response) => {
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: 'Saved Successfully',
                })
                this.setState({
                    saveLoading: false,
                    form: response.result,
                })
                this.props.refreshGlobalConfig()
                this.props.handleChecklistUpdate('hostUrl')
            })
            .catch((error) => {
                showError(error)
                this.setState({
                    statusCode: error.code,
                    saveLoading: false,
                })
            })
    }

    handleHostURLLocation(value: string): void {
        this.setState({
            form: {
                ...this.state.form,
                value,
            },
            isHostUrlValid: value?.length > 0,
        })
    }

    renderHostErrorMessage() {
        return (
            <div className="w-100">
                <InfoBlock
                    variant="error"
                    description="Saved host URL doesn’t match the domain address in your browser."
                />
            </div>
        )
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
            return (
                <div className="dc__align-reload-center">
                    <ErrorScreenNotAuthorized />
                </div>
            )
        }
        if (this.state.view === ViewType.LOADING) {
            return (
                <div className="bg__primary h-100">
                    <Progressing pageLoader />
                </div>
            )
        }
        if (this.state.view === ViewType.ERROR) {
            return (
                <section className="dc__align-reload-center">
                    <ErrorScreenManager code={this.state.statusCode} />
                </section>
            )
        }

      

        return (
            <section
                className="flex column left top bg__primary h-100 dc__gap-24 px-20 py-16"
                data-testid="section-host-url"
            >
                <FeatureTitleWithInfo
                    title={HEADER_TEXT.HOST_URL.title}
                    renderDescriptionContent={() => HEADER_TEXT.HOST_URL.description}
                    docLink={HEADER_TEXT.HOST_URL.docLink}
                    showInfoIconTippy
                    dataTestId="host-url-heading"
                />
                <form
                    className="flex left column dc__gap-16 bg__primary br-8 bw-1 en-2 p-20"
                    data-testid="form-host-url"
                    onSubmit={this.onSave}
                >
                    <InfoBlock description={renderInfoContent()} />
                    {this.state.form.id && window.location.origin !== this.state.form.value
                        ? this.renderHostErrorMessage()
                        : ''}
                    <div className="w-100">
                        <CustomInput
                            name="host-url"
                            label="Host URL"
                            value={this.state.form.value || window.location.origin}
                            placeholder="Enter Host URL"
                            onChange={this.handleChange}
                            required
                            error={!this.state.isHostUrlValid && NO_HOST_URL}
                            helperText={
                                <>
                                    Auto-detected from your browser:
                                    <button
                                        type="button"
                                        onClick={(e) => this.handleHostURLLocation(window.location.origin)}
                                        className="hosturl__url fw-4 cg-5 py-0"
                                        data-testid="clickable-url"
                                    >
                                        {window.location.origin}
                                    </button>
                                </>
                            }
                        />
                    </div>
                    <div className="flex left w-100 dc__border-top-n1 pt-16">
                        <button
                            type="submit"
                            tabIndex={2}
                            disabled={this.state.saveLoading}
                            className="cta small"
                            data-testid="host-url-update-button"
                        >
                            {this.state.saveLoading ? <Progressing /> : this.state.form.id ? 'Update' : 'Save'}
                        </button>
                    </div>
                </form>
            </section>
        )
    }
}
