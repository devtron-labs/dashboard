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

import { Component } from 'react'
import { CustomInput, DialogForm, DialogFormSubmit, ServerErrors, showError, ToastManager, ToastVariantType } from '@devtron-labs/devtron-fe-common-lib'
import { AddWorkflowProps, AddWorkflowState } from './types'
import { createWorkflow, updateWorkflow } from './service'
import { getWorkflowList } from '../../services/service'
import { REQUIRED_FIELD_MSG } from '../../config/constantMessaging'

export default class AddWorkflow extends Component<AddWorkflowProps, AddWorkflowState> {
    constructor(props) {
        super(props)
        this.state = {
            id: 0,
            name: '',
            showError: false,
        }
    }

    componentDidMount() {
        if (this.props.match.params.workflowId) {
            this.getWorkflow()
        }
    }

    getWorkflow(): void {
        getWorkflowList(this.props.match.params.appId, '', this.props.isTemplateView)
            .then((response) => {
                if (response.result) {
                    const workflows = response.result.workflows || []
                    const workflow = workflows.find((wf) => wf.id == +this.props.match.params.workflowId)
                    if (workflow) {
                        this.setState({ id: workflow.id, name: workflow.name })
                    } else {
                        ToastManager.showToast({
                            variant: ToastVariantType.error,
                            description: 'Workflow Not Found',
                        })
                    }
                }
            })
            .catch((error: ServerErrors) => {
                showError(error)
            })
    }

    handleWorkflowName = (event): void => {
        this.setState({ name: event.target.value })
    }

    saveWorkflow = (event): void => {
        event.preventDefault()
        this.setState({ showError: true })
        const request = {
            appId: +this.props.match.params.appId,
            id: this.state.id,
            name: this.state.name,
        }
        if (!this.isNameValid()) {
            return
        }
        const message = this.state.id ? 'Workflow Updated Successfully' : 'Workflow Created successfully'
        const promise = this.props.match.params.workflowId
            ? updateWorkflow(request, this.props.isTemplateView)
            : createWorkflow(request, this.props.isTemplateView)
        promise
            .then((response) => {
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: message,
                })
                this.setState({
                    id: response.result.id,
                    name: response.result.name,
                    showError: false,
                })
                this.props.onClose()
                this.props.getWorkflows()
            })
            .catch((error: ServerErrors) => {
                showError(error)
            })
    }

    isNameValid(): boolean {
        return !!this.state.name?.length
    }

    render() {
        const isValid = this.isNameValid()
        const title = this.props.match.params.workflowId ? 'Edit Workflow' : 'Add Workflow'
        return (
            <DialogForm
                title={title}
                className=""
                close={(event) => this.props.onClose()}
                onSave={this.saveWorkflow}
                isLoading={false}
                closeOnESC
            >
                <label className="form__row">
                    <CustomInput
                        name="workflow-name"
                        label="Workflow Name"
                        value={this.state.name}
                        placeholder="e.g. production workflow"
                        autoFocus
                        onChange={this.handleWorkflowName}
                        required
                        error={this.state.showError && !isValid && REQUIRED_FIELD_MSG}
                    />
                </label>
                <DialogFormSubmit tabIndex={2}>Save</DialogFormSubmit>
            </DialogForm>
        )
    }
}
