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
    getTeamListMin as getProjectListMin,
    Drawer,
    CustomInput,
    ClipboardButton,
    CodeEditor,
    ToastVariantType,
    ToastManager,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ViewType } from '../../config/constants'
import { getWebhookAttributes, getWebhookConfiguration, saveUpdateWebhookConfiguration } from './notifications.service'
import { ReactComponent as Error } from '../../assets/icons/ic-warning.svg'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as Help } from '../../assets/icons/ic-help.svg'
import { WebhhookConfigModalState, WebhookConfigModalProps } from './types'
import CreateHeaderDetails from './CreateHeaderDetails'
import { REQUIRED_FIELD_MSG } from '../../config/constantMessaging'

export class WebhookConfigModal extends Component<WebhookConfigModalProps, WebhhookConfigModalState> {
    constructor(props) {
        super(props)
        this.state = {
            view: ViewType.LOADING,
            form: {
                configName: '',
                webhookUrl: '',
                isLoading: false,
                isError: false,
                payload: '',
                header: [{ key: '', value: '' }],
            },
            isValid: {
                configName: true,
                webhookUrl: true,
                payload: true,
            },
            webhookAttribute: {},
            copyAttribute: false,
        }
        this.handleWebhookConfigNameChange = this.handleWebhookConfigNameChange.bind(this)
        this.handleWebhookUrlChange = this.handleWebhookUrlChange.bind(this)
        this.handleWebhookPaylodChange = this.handleWebhookPaylodChange.bind(this)
        this.addNewHeader = this.addNewHeader.bind(this)
        this.renderHeadersList = this.renderHeadersList.bind(this)
        this.setHeaderData = this.setHeaderData.bind(this)
        this.removeHeader = this.removeHeader.bind(this)
        this.renderHeadersList = this.renderHeadersList.bind(this)
        this.setCopied = this.setCopied.bind(this)
        this.isValid = this.isValid.bind(this)
        this.onSaveClickHandler = this.onSaveClickHandler.bind(this)
        this.onClickSave = this.onClickSave.bind(this)
        this.onBlur = this.onBlur.bind(this)
    }

    componentDidMount() {
        if (this.props.webhookConfigId) {
            getWebhookConfiguration(this.props.webhookConfigId)
                .then((response) => {
                    const state = { ...this.state }
                    const _headers = [...this.state.form.header]
                    state.view = ViewType.FORM
                    const _responseKeys = response.result?.header ? Object.keys(response.result.header) : []
                    _responseKeys.forEach((_key) => {
                        _headers.push({ key: _key, value: response.result.header[_key] })
                    })
                    const _responsePayload = response.result?.payload ?? ''
                    state.form = {
                        ...response.result,
                        header: _headers,
                        payload: _responsePayload,
                    }
                    state.isValid = {
                        configName: true,
                        webhookUrl: true,
                        payload: true,
                    }
                    this.setState(state)
                })
                .catch((error) => {
                    showError(error)
                })
        } else {
            getProjectListMin()
                .then((response) => {
                    this.setState({
                        view: ViewType.FORM,
                    })
                })
                .catch((error) => {
                    showError(error)
                })
        }
        getWebhookAttributes()
            .then((response) => {
                const state = { ...this.state }
                state.webhookAttribute = { ...response.result }
                this.setState(state)
            })
            .catch((error) => {
                showError(error)
            })
    }

    handleWebhookConfigNameChange(event: React.ChangeEvent<HTMLInputElement>): void {
        const { form } = { ...this.state }
        form.configName = event.target.value
        this.setState({ form })
    }

    isValid(event, key: 'configName' | 'webhookUrl' | 'payload'): void {
        const { form, isValid } = { ...this.state }
        if (key != 'payload') {
            isValid[key] = event.target.value.length !== 0
        } else if (this.state.form.payload != '') {
            try {
                isValid[key] = event.target.value.length !== 0
                if (isValid[key]) {
                    isValid[key] = true
                }
            } catch (err) {
                isValid[key] = false
            }
        }
        this.setState({ form, isValid })
    }

    handleWebhookUrlChange(event: React.ChangeEvent<HTMLInputElement>): void {
        const { form } = { ...this.state }
        form.webhookUrl = event.target.value
        this.setState({ form })
    }

    handleWebhookPaylodChange(value): void {
        const { form } = { ...this.state }
        form.payload = value
        this.setState({ form })
    }

    saveWebhookConfig(): void {
        const state = { ...this.state }
        state.form.isLoading = true
        this.setState(state)
        const keys = Object.keys(this.state.isValid)
        const isFormValid = keys.reduce((isFormValid, key) => {
            isFormValid = isFormValid && this.state.isValid[key]
            return isFormValid
        }, true)
        if (!isFormValid) {
            state.form.isLoading = false
            state.form.isError = true
            this.setState(state)
            return
        }
        const requestBody = this.state.form
        if (this.props.webhookConfigId) {
            requestBody['id'] = this.props.webhookConfigId
        } else {
            requestBody['id'] = 0
        }
        saveUpdateWebhookConfiguration(requestBody)
            .then((response) => {
                const state = { ...this.state }
                state.form.isLoading = false
                state.form.isError = false
                this.setState(state)
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: 'Saved Successfully',
                })
                this.props.onSaveSuccess()
            })
            .catch((error) => {
                showError(error)
            })
    }

    setHeaderData(index, _headerData) {
        const _headers = [...this.state.form.header]
        _headers[index] = _headerData
        const { form } = { ...this.state }
        form.header = _headers
        this.setState({ form })
    }

    addNewHeader() {
        const _headers = [...this.state.form.header]
        _headers.splice(0, 0, {
            key: '',
            value: '',
        })
        const { form } = { ...this.state }
        form.header = _headers
        this.setState({ form })
    }

    removeHeader(index) {
        const _headers = [...this.state.form.header]
        _headers.splice(index, 1)
        const { form } = { ...this.state }
        form.header = _headers
        this.setState({ form })
    }

    setCopied(value: boolean) {
        this.setState({ copyAttribute: value })
    }

    renderDataList(attribute, index) {
        return (
            <div
                className="dc__visible-hover dc__visible-hover--parent w-100-imp cn-7 fs-12 mb-8 flex left data-conatiner hover-trigger"
                data-testid={`${this.state.webhookAttribute[attribute]}-${index}`}
                key={`${index}-${attribute}`}
            >
                <span className="bcn-1 br-4 fs-12 fw-4 lh-16 p-4">{this.state.webhookAttribute[attribute]}</span>
                <div className="flex dc__visible-hover--child pl-4">
                    <ClipboardButton content={this.state.webhookAttribute[attribute]} />
                </div>
            </div>
        )
    }

    renderConfigureLinkInfoColumn() {
        const keys = Object.keys(this.state.webhookAttribute)
        return (
            <div
                className="h-100 w-280 flex column dc__border-left dc__align-start dc__content-start p-16 dc__overflow-scroll"
                data-testid="available-webhook-data"
            >
                <div className="flex dc__align-items-center p-0 mb-16">
                    <Help className="icon-dim-18 fcv-5" />
                    <span className="ml-8 fw-6 fs-13 lh-20"> Available data</span>
                </div>
                <span className="fw-4 fs-13 lh-20 mb-16">
                    Following data are available to be shared through Webhook. Use Payload to configure.
                </span>
                {keys.map((attribute, index) => this.renderDataList(attribute, index))}
            </div>
        )
    }

    renderHeadersList() {
        return (
            <div className="mb-8">
                {this.state.form.header?.map((headerData, index) => (
                    <CreateHeaderDetails
                        key={`tag-${index}`}
                        index={index}
                        headerData={headerData}
                        setHeaderData={this.setHeaderData}
                        removeHeader={this.removeHeader}
                    />
                ))}
            </div>
        )
    }

    renderWithBackdrop(body) {
        return (
            <Drawer position="right">
                <div className="h-100 modal__body w-885 modal__body--p-0 dc__no-border-radius mt-0 dc__position-rel">
                    <div className="h-48 flex flex-align-center dc__border-bottom flex-justify bcn-0 pb-12 pt-12 pl-20 pr-20">
                        <h1 className="fs-16 fw-6 lh-1-43 m-0 title-padding">Configure Webhook</h1>
                        <button type="button" className="dc__transparent" onClick={this.props.closeWebhookConfigModal}>
                            <Close className="icon-dim-24" />
                        </button>
                    </div>
                    {body}
                </div>
            </Drawer>
        )
    }

    onSaveClickHandler(event) {
        event.preventDefault()
        this.saveWebhookConfig()
    }

    onClickSave(event) {
        event.preventDefault()
        this.saveWebhookConfig()
    }

    onBlur(event) {
        this.isValid(event, event.currentTarget.dataset.field)
    }

    renderWebhookModal = () => {
        if (this.state.view === ViewType.LOADING) {
            return (
                <div style={{ height: '350px' }}>
                    <Progressing pageLoader />
                </div>
            )
        }
        return (
            <>
                <div className="flex" style={{ height: 'calc(100vh - 120px' }}>
                    <div
                        className="w-600 p-20 flex column dc__align-start dc__content-start dc__overflow-scroll"
                        style={{ height: 'calc(100vh - 120px)' }}
                    >
                        <label className="form__row w-100-imp">
                            <CustomInput
                                label="Configuration name"
                                data-testid="add-webhook-config-name"
                                name="app-name"
                                value={this.state.form.configName}
                                onChange={this.handleWebhookConfigNameChange}
                                data-field="configName"
                                handleOnBlur={this.onBlur}
                                placeholder="Enter name"
                                autoFocus
                                tabIndex={1}
                                error={!this.state.isValid.configName && REQUIRED_FIELD_MSG}
                                isRequiredField
                            />
                        </label>
                        <label className="form__row w-100-imp">
                            <CustomInput
                                label="Webhook URL"
                                type="text"
                                name="app-name"
                                value={this.state.form.webhookUrl}
                                autoFocus
                                placeholder="Enter Incoming Webhook URL"
                                tabIndex={2}
                                onChange={this.handleWebhookUrlChange}
                                data-field="webhookUrl"
                                handleOnBlur={this.onBlur}
                                isRequiredField
                                error={!this.state.isValid.webhookUrl && REQUIRED_FIELD_MSG}
                                data-testid="webhook-url-error"
                            />
                        </label>
                        <div className="form__row w-100-imp">
                            <div className="flex ml-0 dc__content-space">
                                <span className="form__label">Headers</span>
                                <span
                                    className="flex dc__align-end dc__content-end cb-5 fw-6 fs-13 flex right mb-4 cursor"
                                    data-testid="add-new-header-button"
                                    onClick={this.addNewHeader}
                                >
                                    <Add className="icon-dim-20 fcb-5" /> Add
                                </span>
                            </div>
                            {this.renderHeadersList()}
                        </div>
                        <label className="form__row w-100-imp">
                            <span className="form__label dc__required-field">Data to be shared through Webhook</span>
                            <div className="dc__border pt-8 pb-8 br-4" data-field="payload" onBlur={this.onBlur}>
                                <CodeEditor
                                    value={this.state.form.payload}
                                    theme="vs-alice-blue"
                                    mode="json"
                                    onChange={this.handleWebhookPaylodChange}
                                    inline
                                    height={200}
                                />
                            </div>
                            <span className="form__error">
                                {!this.state.isValid.payload ? (
                                    this.state.form.payload !== '' && (
                                        <>
                                            <Error className="form__icon form__icon--error" />
                                            Write valid JSON.
                                            <br />
                                        </>
                                    )
                                ) : (
                                    <>
                                        <Error className="form__icon form__icon--error" />
                                        This is a required field.
                                        <br />
                                    </>
                                )}
                            </span>
                        </label>
                    </div>
                    {this.renderConfigureLinkInfoColumn()}
                </div>
                <div className="pt-16 pb-16 pl-24 pr-24 flex right dc__border-top">
                    <div className="flex right">
                        <button
                            type="button"
                            className="cta cancel mr-16"
                            tabIndex={5}
                            onClick={this.props.closeWebhookConfigModal}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={this.onClickSave}
                            data-testid="add-webhook-save-button"
                            type="submit"
                            className="cta"
                            tabIndex={4}
                            disabled={this.state.form.isLoading}
                        >
                            {this.state.form.isLoading ? <Progressing /> : 'Save'}
                        </button>
                    </div>
                </div>
            </>
        )
    }

    render() {
        return this.renderWithBackdrop(this.renderWebhookModal())
    }
}
