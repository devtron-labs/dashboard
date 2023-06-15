import React, { Component } from 'react'
import { validateEmail } from '../common'
import { showError, Progressing, VisibleModal, Checkbox, Drawer } from '@devtron-labs/devtron-fe-common-lib'
import { getSMTPConfiguration, saveEmailConfiguration } from './notifications.service'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Error } from '../../assets/icons/ic-warning.svg'
import { toast } from 'react-toastify'
import { ViewType } from '../../config/constants'
import { ProtectedInput } from '../globalConfigurations/GlobalConfiguration'
import { SMTPConfigModalProps, SMTPConfigModalState } from './types'

export class SMTPConfigModal extends Component<SMTPConfigModalProps, SMTPConfigModalState> {
    _configName
    constructor(props) {
        super(props)
        this.state = {
            view: ViewType.LOADING,
            form: {
                configName: '',
                port: null,
                host: '',
                authUser: '',
                authPassword: '',
                fromEmail: '',
                default: this.props.shouldBeDefault,
                isLoading: false,
                isError: true,
            },
            isValid: {
                configName: true,
                port: true,
                host: true,
                authUser: true,
                authPassword: true,
                fromEmail: true,
            },
        }
        this.handleCheckbox = this.handleCheckbox.bind(this)
        this.handleBlur = this.handleBlur.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this)
        this.onSaveClickHandler = this.onSaveClickHandler.bind(this)
    }

    componentDidMount() {
        if (this.props.smtpConfigId) {
            getSMTPConfiguration(this.props.smtpConfigId)
                .then((response) => {
                    this.setState((prevState) => ({
                        ...prevState,
                        form: { ...response.result, isLoading: false, isError: true },
                        view: ViewType.FORM,
                        isValid: {
                            configName: true,
                            port: true,
                            host: true,
                            authUser: true,
                            authPassword: true,
                            fromEmail: true,
                        },
                    }))
                })
                .then(() => {
                    this._configName.focus()
                })
                .catch((error) => {
                    showError(error)
                })
        } else {
            this.setState((prevState) => ({
                ...prevState,
                form: { ...prevState.form, default: this.props.shouldBeDefault },
                view: ViewType.FORM,
            }))
            setTimeout(() => {
                if (this._configName) this._configName.focus()
            }, 100)
        }
    }

    handleBlur(event): void {
        const { name, value } = event.target
        this.setState((prevState) => ({
            ...prevState,
            isValid: { ...prevState.isValid, [name]: !!value.length },
        }))
    }

    handleInputChange(event: React.ChangeEvent<HTMLInputElement>): void {
        const { name, value } = event.target
        this.setState((prevState) => ({
            ...prevState,
            form: { ...prevState.form, [name]: value },
        }))
    }

    handleCheckbox(): void {
        this.setState((prevState) => ({
            ...prevState,
            form: { ...prevState.form, default: !prevState.form.default },
        }))
    }

    saveSMTPConfig(): void {
        let keys = Object.keys(this.state.isValid)
        let isFormValid = keys.reduce((isFormValid, key) => {
            isFormValid = isFormValid && this.state.isValid[key]
            return isFormValid
        }, true)
        isFormValid = isFormValid && validateEmail(this.state.form.fromEmail)
        if (!isFormValid) {
            this.setState((prevState) => ({
                ...prevState,
                form: { ...prevState.form, isLoading: false, isError: true },
            }))
            toast.error('Some required fields are missing or Invalid')
            return
        } else {
            this.setState((prevState) => ({
                ...prevState,
                form: { ...prevState.form, isLoading: true, isError: false },
            }))
        }
        saveEmailConfiguration(this.state.form, 'smtp')
            .then((response) => {
                this.setState((prevState) => ({
                    ...prevState,
                    form: { ...prevState.form, isLoading: false },
                }))
                toast.success('Saved Successfully')
                this.props.onSaveSuccess()
                if (this.props.selectSMTPFromChild) {
                    this.props.selectSMTPFromChild(response?.result[0])
                }
            })
            .catch((error) => {
                showError(error)
                this.setState((prevState) => ({
                    ...prevState,
                    form: { ...prevState.form, isLoading: false },
                }))
            })
    }

    renderWithBackdrop(body) {
        return (
            <Drawer position="right">
                <div className="h-100 modal__body modal__body--w-600 modal__body--p-0 dc__no-border-radius mt-0">
                    <div className="h-48 flex flex-align-center dc__border-bottom flex-justify bcn-0 pb-12 pt-12 pl-20 pr-20">
                        <h1 className="fs-16 fw-6 lh-1-43 m-0 title-padding">Configure SMTP</h1>
                        <button type="button" className="dc__transparent" onClick={this.props.closeSMTPConfigModal}>
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
        this.saveSMTPConfig()
    }

    render() {
        let body
        if (this.state.view === ViewType.LOADING) {
            body = (
                <div style={{ height: '554px' }}>
                    <Progressing pageLoader />
                </div>
            )
        } else
            body = (
                <>
                    <div className="m-20" style={{ height: 'calc(100vh - 160px'}}>
                        <label className="form__row">
                            <span className="form__label">Configuration Name*</span>
                            <input
                                data-testid="add-smtp-configuration-name"
                                ref={(node) => (this._configName = node)}
                                className="form__input"
                                type="text"
                                name="configName"
                                value={this.state.form.configName}
                                onChange={this.handleInputChange}
                                onBlur={this.handleBlur}
                                placeholder="Configuration name"
                                autoFocus={true}
                                tabIndex={1}
                                required
                            />
                            <span className="form__error">
                                {!this.state.isValid.configName ? (
                                    <>
                                        <Error className="form__icon form__icon--error" />
                                        This is a required field <br />
                                    </>
                                ) : null}
                            </span>
                        </label>
                        <label className="form__row">
                            <span className="form__label">SMTP Host*</span>
                            <input
                                data-testid="add-smtp-host"
                                className="form__input"
                                type="text"
                                name="host"
                                value={this.state.form.host}
                                onChange={this.handleInputChange}
                                onBlur={this.handleBlur}
                                placeholder="Eg. smtp.gmail.com"
                                tabIndex={2}
                                required
                            />
                            <span className="form__error">
                                {!this.state.isValid.host ? (
                                    <>
                                        <Error className="form__icon form__icon--error" />
                                        This is a required field <br />
                                    </>
                                ) : null}
                            </span>
                        </label>
                        <label className="form__row">
                            <span className="form__label">SMTP Port*</span>
                            <input
                                data-testid="add-smtp-port"
                                className="form__input"
                                type="text"
                                name="port"
                                value={this.state.form.port}
                                onChange={this.handleInputChange}
                                onBlur={this.handleBlur}
                                placeholder="Enter SMTP port"
                                tabIndex={3}
                                required
                            />
                            <span className="form__error">
                                {!this.state.isValid.port ? (
                                    <>
                                        <Error className="form__icon form__icon--error" />
                                        This is a required field <br />
                                    </>
                                ) : null}
                            </span>
                        </label>
                        <div className="form__row">
                            <label htmlFor="" className="form__label">
                                SMTP Username*
                            </label>
                            <input
                                data-testid="add-smtp-username"
                                className="form__input"
                                type="text"
                                name="authUser"
                                value={this.state.form.authUser}
                                onChange={this.handleInputChange}
                                onBlur={this.handleBlur}
                                placeholder="Enter SMTP username"
                                tabIndex={3}
                                required
                            />
                            <span className="form__error">
                                {!this.state.isValid.authUser ? (
                                    <>
                                        <Error className="form__icon form__icon--error" />
                                        This is a required field <br />
                                    </>
                                ) : null}
                            </span>
                        </div>
                        <div className="form__row smtp-protected-input">
                            <ProtectedInput
                                dataTestid="add-smtp-password"
                                value={this.state.form.authPassword}
                                onChange={this.handleInputChange}
                                name="authPassword"
                                error={!this.state.isValid.authPassword}
                                label="SMTP Password*"
                                labelClassName="form__label--fs-13 mb-8 fw-5 fs-13"
                                placeholder="Enter SMTP password"
                            />
                        </div>
                        <label className="form__row">
                            <span className="form__label">Send email from*</span>
                            <input
                                data-testid="add-smtp-send-email"
                                className="form__input"
                                type="email"
                                name="fromEmail"
                                value={this.state.form.fromEmail}
                                onChange={this.handleInputChange}
                                onBlur={this.handleBlur}
                                placeholder="Email"
                                tabIndex={5}
                                required
                            />
                            <span className="form__error">
                                {!this.state.isValid.fromEmail ? (
                                    <>
                                        <Error className="form__icon form__icon--error" />
                                        This is a required field
                                        <br />
                                    </>
                                ) : null}
                            </span>
                        </label>
                    </div>
                    <div className="form__button-group-bottom flexbox flex-justify">
                        <Checkbox
                            isChecked={this.state.form.default}
                            value={'CHECKED'}
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
                                onClick={this.props.closeSMTPConfigModal}
                            >
                                Cancel
                            </button>
                            <button onClick={this.onSaveClickHandler}
                            data-testid="add-smtp-save-button" type="submit" className="cta" tabIndex={7} disabled={this.state.form.isLoading}>
                                {this.state.form.isLoading ? <Progressing /> : 'Save'}
                            </button>
                        </div>
                    </div>
                </>
            )
        return this.renderWithBackdrop(body)
    }
}
