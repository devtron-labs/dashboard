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
    Checkbox,
    Drawer,
    CustomInput,
    CHECKBOX_VALUE,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'
import ReactSelect from 'react-select'
import { validateEmail } from '../common'
import { saveEmailConfiguration, getSESConfiguration } from './notifications.service'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Error } from '../../assets/icons/ic-warning.svg'
import { ReactComponent as Info } from '../../assets/icons/ic-info-filled.svg'
import { ViewType } from '../../config/constants'
import { multiSelectStyles, DropdownIndicator } from './notifications.util'
import { Option } from '../v2/common/ReactSelect.utils'
import awsRegionList from '../common/awsRegionList.json'
import { REQUIRED_FIELD_MSG } from '../../config/constantMessaging'

export interface SESConfigModalProps {
    sesConfigId: number
    shouldBeDefault: boolean
    selectSESFromChild?: (sesConfigId: number) => void
    onSaveSuccess: () => void
    closeSESConfigModal: (event) => void
}

export interface SESConfigModalState {
    view: string
    form: {
        configName: string
        accessKey: string
        secretKey: string
        region: { label: string; value: string }
        fromEmail: string
        default: boolean
        isLoading: boolean
        isError: boolean
    }
    isValid: {
        configName: boolean
        accessKey: boolean
        secretKey: boolean
        region: boolean
        fromEmail: boolean
    }
    secretKey: string
}

export class SESConfigModal extends Component<SESConfigModalProps, SESConfigModalState> {
    awsRegionListParsed = awsRegionList.map((region) => {
        return { label: region.name, value: region.value }
    })

    constructor(props) {
        super(props)
        this.state = {
            view: ViewType.LOADING,
            form: {
                configName: '',
                accessKey: '',
                secretKey: '',
                region: { label: '', value: '' },
                fromEmail: '',
                default: this.props.shouldBeDefault,
                isLoading: false,
                isError: true,
            },
            isValid: {
                configName: true,
                accessKey: true,
                secretKey: true,
                region: true,
                fromEmail: true,
            },
            secretKey: '',
        }
        this.handleConfigNameChange = this.handleConfigNameChange.bind(this)
        this.handleAWSRegionChange = this.handleAWSRegionChange.bind(this)
        this.handleAccessKeyIDChange = this.handleAccessKeyIDChange.bind(this)
        this.handleSecretAccessKeyChange = this.handleSecretAccessKeyChange.bind(this)
        this.handleEmailChange = this.handleEmailChange.bind(this)
        this.handleCheckbox = this.handleCheckbox.bind(this)
        this.handleBlur = this.handleBlur.bind(this)
        this.onSaveClickHandler = this.onSaveClickHandler.bind(this)
    }

    componentDidMount() {
        if (this.props.sesConfigId) {
            getSESConfiguration(this.props.sesConfigId)
                .then((response) => {
                    const state = { ...this.state }
                    const { region } = response.result
                    const awsRegion = this.awsRegionListParsed.find((r) => r.value === region)
                    state.form = {
                        ...response.result,
                        isLoading: false,
                        isError: true,
                        region: awsRegion,
                        secretKey: '*******',
                    }
                    state.view = ViewType.FORM
                    state.isValid = {
                        configName: true,
                        accessKey: true,
                        secretKey: true,
                        region: true,
                        fromEmail: true,
                    }
                    state.secretKey = response.result.secretKey
                    this.setState(state)
                })
                .catch((error) => {
                    showError(error)
                })
        } else {
            const state = { ...this.state }
            state.form.default = this.props.shouldBeDefault
            state.view = ViewType.FORM
            this.setState(state)
        }
    }

    handleBlur(event, key: string): void {
        const { isValid } = { ...this.state }
        if (key !== 'region') {
            isValid[key] = !!event.target.value.length
        } else {
            isValid[key] = !!this.state.form.region.value
        }
        this.setState({ isValid })
    }

    handleConfigNameChange(event: React.ChangeEvent<HTMLInputElement>): void {
        const { form } = { ...this.state }
        form.configName = event.target.value
        this.setState({ form })
    }

    handleAccessKeyIDChange(event: React.ChangeEvent<HTMLInputElement>): void {
        const { form, isValid } = { ...this.state }
        form.accessKey = event.target.value
        this.setState({ form, isValid })
    }

    handleSecretAccessKeyChange(event: React.ChangeEvent<HTMLInputElement>): void {
        const { form, isValid } = { ...this.state }
        let { secretKey } = this.state
        form.secretKey = event.target.value
        if (event.target.value.indexOf('*') < 0 && event.target.value.length > 0) {
            secretKey = event.target.value
        }
        this.setState({ form, isValid, secretKey })
    }

    handleAWSRegionChange(event): void {
        const { form, isValid } = { ...this.state }
        form.region = event
        isValid.region = !!event
        this.setState({ form, isValid })
    }

    handleEmailChange(event: React.ChangeEvent<HTMLInputElement>): void {
        const { form, isValid } = { ...this.state }
        form.fromEmail = event.target.value
        this.setState({ form, isValid })
    }

    handleCheckbox(event): void {
        const { form, isValid } = { ...this.state }
        form.default = !form.default
        this.setState({ form, isValid })
    }

    getPayload = () => {
        return {
            ...this.state.form,
            region: this.state.form.region.value,
            secretKey: this.state.secretKey,
        }
    }

    saveSESConfig(): void {
        const keys = Object.keys(this.state.isValid)
        let isFormValid = keys.reduce((isFormValid, key) => {
            isFormValid = isFormValid && this.state.isValid[key]
            return isFormValid
        }, true)
        isFormValid = isFormValid && validateEmail(this.state.form.fromEmail)
        if (!isFormValid) {
            const state = { ...this.state }
            state.form.isLoading = false
            state.form.isError = true
            this.setState(state)
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Some required fields are missing or Invalid',
            })
            return
        }
        const state = { ...this.state }
        state.form.isLoading = true
        state.form.isError = false
        this.setState(state)

        saveEmailConfiguration(this.getPayload(), 'ses')
            .then((response) => {
                const state = { ...this.state }
                state.form.isLoading = false
                this.setState(state)
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: 'Saved Successfully',
                })
                this.props.onSaveSuccess()
                if (this.props.selectSESFromChild) {
                    this.props.selectSESFromChild(response?.result[0])
                }
            })
            .catch((error) => {
                showError(error)
                const state = { ...this.state }
                state.form.isLoading = false
                this.setState(state)
            })
    }

    renderWithBackdrop(body) {
        return (
            <Drawer position="right">
                <div className="h-100 modal__body modal__body--w-600 modal__body--p-0 dc__no-border-radius mt-0">
                    <div className="h-48 flex flex-align-center dc__border-bottom flex-justify bcn-0 pb-12 pt-12 pl-20 pr-20">
                        <h1 className="fs-16 fw-6 lh-1-43 m-0 title-padding">Configure SES</h1>
                        <button type="button" className="dc__transparent" onClick={this.props.closeSESConfigModal}>
                            <Close className="icon-dim-24" />
                        </button>
                    </div>
                    <form>{body}</form>
                </div>
            </Drawer>
        )
    }

    onSaveClickHandler(event) {
        event.preventDefault()
        this.saveSESConfig()
    }

    render() {
        let body
        if (this.state.view === ViewType.LOADING) {
            body = (
                <div style={{ height: '554px' }}>
                    <Progressing pageLoader />
                </div>
            )
        } else {
            body = (
                <>
                    <div className="m-20" style={{ height: 'calc(100vh - 160px' }}>
                        <label className="form__row">
                            <CustomInput
                                label="Configuration Name"
                                data-testid="add-ses-configuration-name"
                                name="configname"
                                value={this.state.form.configName}
                                onChange={this.handleConfigNameChange}
                                onBlur={(event) => this.handleBlur(event, 'configName')}
                                placeholder="Configuration name"
                                autoFocus
                                tabIndex={1}
                                isRequiredField
                                error={!this.state.isValid.configName && REQUIRED_FIELD_MSG}
                            />
                        </label>
                        <label className="form__row">
                            <CustomInput
                                data-testid="add-ses-access-key"
                                label="Access Key ID"
                                type="text"
                                name="app-name"
                                value={this.state.form.accessKey}
                                onChange={this.handleAccessKeyIDChange}
                                onBlur={(event) => this.handleBlur(event, 'accessKey')}
                                placeholder="Access Key ID"
                                tabIndex={2}
                                isRequiredField
                                error={!this.state.isValid.accessKey && REQUIRED_FIELD_MSG}
                            />
                        </label>
                        <label className="form__row">
                            <CustomInput
                                label="Secret Access Key"
                                data-testid="add-ses-secret-access-key"
                                type="text"
                                name="app-name"
                                value={this.state.form.secretKey}
                                onChange={this.handleSecretAccessKeyChange}
                                onBlur={(event) => this.handleBlur(event, 'secretKey')}
                                placeholder="Secret Access Key"
                                tabIndex={3}
                                isRequiredField
                                error={!this.state.isValid.secretKey && REQUIRED_FIELD_MSG}
                            />
                        </label>
                        <div className="form__row">
                            <label htmlFor="" className="form__label dc__required-field">
                                AWS Region
                            </label>
                            <ReactSelect
                                classNamePrefix="add-ses-aws-region"
                                defaultValue={this.state.form.region}
                                components={{
                                    DropdownIndicator,
                                    Option,
                                }}
                                tabIndex={4}
                                placeholder="Select AWS Region"
                                styles={{
                                    ...multiSelectStyles,
                                    multiValue: (base) => ({
                                        ...base,
                                        border: `1px solid var(--N200)`,
                                        borderRadius: `4px`,
                                        background: 'white',
                                        height: '30px',
                                        margin: '0 8px 0 0',
                                        padding: '1px',
                                    }),
                                }}
                                onBlur={(event) => this.handleBlur(event, 'region')}
                                onChange={(selected) => this.handleAWSRegionChange(selected)}
                                options={this.awsRegionListParsed}
                            />
                            <span className="form__error">
                                {!this.state.isValid.region ? (
                                    <>
                                        <Error className="form__icon form__icon--error" />
                                        This is a required field <br />
                                    </>
                                ) : null}
                            </span>
                        </div>
                        <label className="form__row">
                            <CustomInput
                                label="Send email from"
                                data-testid="add-ses-send-email"
                                type="email"
                                name="app-name"
                                value={this.state.form.fromEmail}
                                onBlur={(event) => this.handleBlur(event, 'fromEmail')}
                                placeholder="Email"
                                tabIndex={5}
                                onChange={this.handleEmailChange}
                                isRequiredField
                                error={!this.state.isValid.fromEmail && REQUIRED_FIELD_MSG}
                            />
                            <span className="form__text-field-info">
                                <Info className="form__icon form__icon--info" />
                                This email must be verified with SES.
                            </span>
                        </label>
                    </div>
                    <div className="form__button-group-bottom flexbox flex-justify">
                        <Checkbox
                            isChecked={this.state.form.default}
                            value={CHECKBOX_VALUE.CHECKED}
                            tabIndex={6}
                            disabled={this.props.shouldBeDefault}
                            onChange={this.handleCheckbox}
                        >
                            Set as default configuration to send emails
                        </Checkbox>
                        <div className="flex right">
                            <button
                                type="button"
                                className="cta cancel mr-16"
                                tabIndex={8}
                                onClick={this.props.closeSESConfigModal}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={this.onSaveClickHandler}
                                data-testid="add-ses-save-button"
                                type="submit"
                                className="cta"
                                tabIndex={7}
                                disabled={this.state.form.isLoading}
                            >
                                {this.state.form.isLoading ? <Progressing /> : 'Save'}
                            </button>
                        </div>
                    </div>
                </>
            )
        }
        return this.renderWithBackdrop(body)
    }
}
