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

import { useEffect, useState } from 'react'
import { CustomInput, DialogForm, DialogFormSubmit, ServerErrors, showError, ToastManager, ToastVariantType } from '@devtron-labs/devtron-fe-common-lib'
import { AddWorkflowProps } from './types'
import { createWorkflow, updateWorkflow } from './service'
import { getWorkflowList } from '../../services/service'
import { REQUIRED_FIELD_MSG } from '../../config/constantMessaging'
import { useParams } from 'react-router-dom'

const AddWorkflow = ({ onClose, getWorkflows, isTemplateView }: AddWorkflowProps) => {
    const params = useParams<{ appId: string; workflowId: string }>()

    const [workflowId, setWorkflowId] = useState<number>(0)
    const [workflowName, setWorkflowName] = useState<string>('')
    const [showValidationError, setShowValidationError] = useState<boolean>(false)

    const isNameValid = !!workflowName?.length

    useEffect(() => {
        if (params.workflowId) {
            getWorkflowList(params.appId, '', isTemplateView)
                .then((response) => {
                    if (response.result) {
                        const workflows = response.result.workflows || []
                        const workflow = workflows.find((wf) => wf.id === +params.workflowId)
                        if (workflow) {
                            setWorkflowId(workflow.id)
                            setWorkflowName(workflow.name)
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
    }, [params.workflowId, params.appId, isTemplateView])

    const handleWorkflowName = (event): void => {
        setWorkflowName(event.target.value)
    }

    const saveWorkflow = (event): void => {
        event.preventDefault()
        setShowValidationError(true)
        const request = {
            appId: +params.appId,
            id: workflowId,
            name: workflowName,
        }
        if (!isNameValid) {
            return
        }
        const message = workflowId ? 'Workflow Updated Successfully' : 'Workflow Created successfully'
        const promise = params.workflowId
            ? updateWorkflow(request, isTemplateView)
            : createWorkflow(request, isTemplateView)
        promise
            .then((response) => {
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: message,
                })
                setWorkflowId(response.result.id)
                setWorkflowName(response.result.name)
                setShowValidationError(false)
                onClose()
                getWorkflows()
            })
            .catch((error: ServerErrors) => {
                showError(error)
            })
    }

    const title = params.workflowId ? 'Edit Workflow' : 'Add Workflow'

    return (
        <DialogForm
            title={title}
            className=""
            close={onClose}
            onSave={saveWorkflow}
            isLoading={false}
            closeOnESC
        >
            <label className="form__row">
                <CustomInput
                    name="workflow-name"
                    label="Workflow Name"
                    value={workflowName}
                    placeholder="e.g. production workflow"
                    autoFocus
                    onChange={handleWorkflowName}
                    required
                    error={showValidationError && !isNameValid && REQUIRED_FIELD_MSG}
                />
            </label>
            <DialogFormSubmit tabIndex={2}>Save</DialogFormSubmit>
        </DialogForm>
    )
}

export default AddWorkflow
