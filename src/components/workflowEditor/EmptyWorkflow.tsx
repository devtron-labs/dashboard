import React, { useEffect, useRef, useState } from 'react'
import { CustomInput, DialogForm, DialogFormSubmit, ServerErrors, showError } from '@devtron-labs/devtron-fe-common-lib'
import { toast } from 'react-toastify'
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
        const promise = createWorkflow(request)
        promise
            .then((response) => {
                toast.success(message)
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
