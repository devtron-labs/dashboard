import React, { Component } from 'react'
import { VisibleModal, showError, Progressing, Checkbox, validateEmail } from '../common'
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
            <VisibleModal className="">
                <div className="modal__body modal__body--w-600 modal__body--p-0 no-top-radius mt-0">
                    <div className="modal__header m-24">
                        <h1 className="modal__title">Configure SMTP</h1>
                        <button type="button" className="transparent" onClick={this.props.closeSMTPConfigModal}>
                            <Close className="icon-dim-24" />
                        </button>
                    </div>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault()
                            this.saveSMTPConfig()
                        }}
                    >
                        {body}
                    </form>
                </div>
            </VisibleModal>
        )
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
                    <div className="m-24 mb-32">
                        <label className="form__row">
                            <span className="form__label">Configuration Name*</span>
                            <input
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
                            <button type="submit" className="cta" tabIndex={7} disabled={this.state.form.isLoading}>
                                {this.state.form.isLoading ? <Progressing /> : 'Save'}
                            </button>
                        </div>
                    </div>
                </>
            )
        return this.renderWithBackdrop(body)
    }
}
