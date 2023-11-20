import React, { Component } from 'react'
import { EmptyWorkflowProps, EmptyWorkflowState } from './types'
import { DialogForm, DialogFormSubmit, ServerErrors, showError } from '@devtron-labs/devtron-fe-common-lib'
import { createWorkflow, updateWorkflow } from './service'
import { toast } from 'react-toastify'
import error from '../../assets/icons/misc/errorInfo.svg'

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
        let request = {
            appId: +this.props.match.params.appId,
            name: this.state.name,
        }
        if (!this.isNameValid()) return
        let message = 'Empty Workflow Created successfully'
        let promise = createWorkflow(request)
        promise
            .then((response) => {
                toast.success(message)
                this.setState({
                    name: response.result.name,
                    showError: false,
                    loading: false,
                })
                this.props.onClose()
                this.props.getWorkflows()
            })
            .catch((error: ServerErrors) => {
                showError(error)
                this.setState({
                    loading: false,
                })
                this.props.onClose()
            })
    }

    isNameValid(): boolean {
        return !!this.state.name?.length
    }

    render() {
        let isValid = this.isNameValid()
        return (
            <DialogForm
                title={'Create job workflow'}
                className=""
                close={(event) => this.props.onClose()}
                onSave={this.saveWorkflow}
                isLoading={this.state.loading}
                closeOnESC={true}
            >
                <label className="form__row">
                    <span className="form__label dc__required-field">Workflow Name</span>
                    <input
                        autoComplete="off"
                        ref={(node) => {
                            if (node) node.focus()
                            this._inputName = node
                        }}
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
                    {this.state.showError && !isValid ? (
                        <span className="form__error">
                            <img src={error} alt="" className="form__icon" /> This is required Field
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
