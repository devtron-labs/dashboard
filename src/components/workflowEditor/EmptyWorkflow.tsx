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

import { useState } from 'react'
import { CustomInput, DialogForm, DialogFormSubmit, ServerErrors, showError, ToastManager, ToastVariantType } from '@devtron-labs/devtron-fe-common-lib'
import { EmptyWorkflowProps, EmptyWorkflowState } from './types'
import { createWorkflow } from './service'
import error from '../../assets/icons/misc/errorInfo.svg'
import { FILTER_NAME_REGEX } from '../ApplicationGroup/Constants'
import { NO_WORKFLOW_NAME, INVALID_WORKFLOW_NAME, MIN_3CHARS, MAX_30CHARS, SUCCESS_CREATION } from './constants'

export default function EmptyWorkflow(props: EmptyWorkflowProps) {
    const [state, setState] = useState<EmptyWorkflowState>({
        name: '',
        showError: false,
        loading: false,
    })

    const handleWorkflowName = (event): void => {
        setState({ ...state, name: event.target.value })
    }

    const saveWorkflow = (event): void => {
        event.preventDefault()
        setState({ ...state, showError: true, loading: true })
        const request = {
            appId: +props.match.params.appId,
            name: state.name,
        }
        if (!isNameValid().isValid) {
            setState((prevState) => ({
                ...prevState,
                loading: false,
            }))
            return
        }
        const message = SUCCESS_CREATION
        const promise = createWorkflow(request, false)
        promise
            .then((response) => {
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: message,
                })
                setState((prevState) => ({ ...prevState, name: response.result.name, showError: false }))
                props.onClose()
                props.getWorkflows()
            })
            .catch((error: ServerErrors) => {
                showError(error)
                props.onClose()
            })
            .finally(() => {
                setState((prevState) => ({ ...prevState, loading: false }))
            })
    }

    const isNameValid = (): { errorMsg: string; isValid: boolean } => {
        const { name } = state
        if (!name) {
            return {
                errorMsg: NO_WORKFLOW_NAME,
                isValid: false,
            }
        }
        if (name.length < 3) {
            return {
                errorMsg: MIN_3CHARS,
                isValid: false,
            }
        }
        if (name.length > 30) {
            return {
                errorMsg: MAX_30CHARS,
                isValid: false,
            }
        }
        if (!FILTER_NAME_REGEX.test(name)) {
            return {
                errorMsg: INVALID_WORKFLOW_NAME,
                isValid: false,
            }
        }

        return {
            errorMsg: '',
            isValid: true,
        }
    }

    return (
        <DialogForm
            title="Create job workflow"
            className=""
            close={(event) => props.onClose()}
            onSave={saveWorkflow}
            isLoading={state.loading}
            closeOnESC
        >
            <label className="form__row" htmlFor="workflow-name">
                <CustomInput
                    autoComplete="off"
                    dataTestid="workflow-name"
                    name="workflow-name"
                    value={state.name}
                    placeholder="Eg. my-job-workflow"
                    onChange={handleWorkflowName}
                    isRequiredField
                    error={state.showError && !isNameValid().isValid && isNameValid().errorMsg}
                />
            </label>
            <div className="flexbox dc__gap-12">
                <button
                    type="button"
                    className="flex cta cancel h-40 dc__align-right"
                    onClick={(event) => props.onClose()}
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
