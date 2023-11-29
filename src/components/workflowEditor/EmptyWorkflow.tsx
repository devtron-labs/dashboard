import React, { Component } from 'react'
import { EmptyWorkflowProps, EmptyWorkflowState } from './types'
import { DialogForm, DialogFormSubmit, ServerErrors, showError } from '@devtron-labs/devtron-fe-common-lib'
import { createWorkflow } from './service'
import { toast } from 'react-toastify'
import error from '../../assets/icons/misc/errorInfo.svg'
import { FILTER_NAME_REGEX } from '../ApplicationGroup/Constants'
import {
    emptyWorkflowMessage,
    invalidWorkflowNameError,
    max30CharError,
    min3CharError,
    noWorkflowNameError,
} from './constants'

export default class EmptyWorkflow extends Component<EmptyWorkflowProps, EmptyWorkflowState> {
    _inputName: HTMLInputElement

    constructor(props) {
        super(props)
        this.state = {
            name: '',
            showError: false,
            loading: false,
        }
    }

    componentDidMount() {
        if (this._inputName) {
            this._inputName.focus()
        }
    }

    handleWorkflowName = (event): void => {
        this.setState({ name: event.target.value })
    }

    saveWorkflow = (event): void => {
        event.preventDefault()
        this.setState({ showError: true, loading: true })
        const request = {
            appId: +this.props.match.params.appId,
            name: this.state.name,
        }
        if (!this.isNameValid().isValid) {
            this.setState({ loading: false })
            return
        }
        const message = emptyWorkflowMessage
        const promise = createWorkflow(request)
        promise
            .then((response) => {
                toast.success(message)
                this.setState({
                    name: response.result.name,
                    showError: false,
                })
                this.props.onClose()
                this.props.getWorkflows()
            })
            .catch((error: ServerErrors) => {
                showError(error)
                this.props.onClose()
            })
            .finally(() => {
                this.setState({ loading: false })
            })
    }

    isNameValid(): {errorMsg:string, isValid:boolean} {
        const name = this.state.name;
        if (!name) {
            return {
                errorMsg: noWorkflowNameError,
                isValid: false
            }
        }
        if(name.length < 3) {
            return {
                errorMsg: min3CharError,
                isValid: false
            }
        }
        if(name.length > 30) {
            return {
                errorMsg: max30CharError,
                isValid: false
            }
        }
        if (!FILTER_NAME_REGEX.test(name)) {
            return {
                errorMsg:invalidWorkflowNameError ,
                isValid: false
            }
        } 

        return {
            errorMsg: '',
            isValid: true
        }
       
    }

    render() {
        const validationStatus = this.isNameValid()
        return (
            <DialogForm
                title={'Create job workflow'}
                className=""
                close={(event) => this.props.onClose()}
                onSave={this.saveWorkflow}
                isLoading={this.state.loading}
                closeOnESC={true}
            >
                <label className="form__row" htmlFor="workflow-name">
                    <span className="form__label dc__required-field">Workflow Name</span>
                    <input
                        autoComplete="off"
                        ref={(node) => {
                            if (node) node.focus()
                            this._inputName = node
                        }}
                        id="workflow-name"
                        className="form__input"
                        type="text"
                        name="workflow-name"
                        value={this.state.name}
                        placeholder="Eg. my-job-workflow"
                        autoFocus={true}
                        tabIndex={1}
                        onChange={this.handleWorkflowName}
                        required
                    />
                    {this.state.showError && !validationStatus.isValid ? (
                        <span className="form__error">
                            <img src={error} alt="" className="form__icon" /> {validationStatus.errorMsg}
                        </span>
                    ) : null}
                </label>
                <div className="flexbox dc__gap-12">
                    <button
                        type="button"
                        className="flex cta cancel h-40 dc__align-right"
                        onClick={(event) => this.props.onClose()}
                        data-testid="close-export-csv-button"
                    >
                        Cancel
                    </button>
                    <div className="flex ml-0">
                        <DialogFormSubmit tabIndex={2}>Create Workflow</DialogFormSubmit>
                    </div>
                </div>
            </DialogForm>
        )
    }
}
