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

import { useContext, useState } from 'react'
import ReactGA from 'react-ga4'
import Tippy from '@tippyjs/react'

import { RefVariableType, ToastManager, ToastVariantType, VariableType } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICSave } from '@Icons/ic-save.svg'
import { pipelineContext } from '@Components/workflowEditor/workflowEditor'

import { CreatePluginModal } from '../CreatePluginModal'

const CreatePluginButton = () => {
    const { formData, formDataErrorObj, setFormDataErrorObj, activeStageName, selectedTaskIndex, validateTask } =
        useContext(pipelineContext)
    const [openCreatePluginModal, setOpenCreatePluginModal] = useState<boolean>(false)

    const handleOpenCreatePluginModal = () => {
        ReactGA.event({
            category: 'devtronapp-configuration-pipeline',
            action: 'save-as-plugin',
        })

        // Before opening the modal we will check if the given task is valid, if not would just showError
        const clonedFormErrorObj = structuredClone(formDataErrorObj)
        validateTask(
            formData[activeStageName].steps[selectedTaskIndex],
            clonedFormErrorObj[activeStageName].steps[selectedTaskIndex],
            { isSaveAsPlugin: true },
        )

        setFormDataErrorObj(clonedFormErrorObj)

        const isTaskValid = clonedFormErrorObj[activeStageName].steps[selectedTaskIndex].isValid
        if (!isTaskValid) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Please ensure the task is valid before saving it as a plugin.',
            })
            return
        }
        const inputVariables: VariableType[] =
            formData[activeStageName].steps[selectedTaskIndex]?.inlineStepDetail?.inputVariables || []

        const isAnyInputVariableFromPreviousStage = inputVariables.some(
            (variable) => variable.variableType === RefVariableType.FROM_PREVIOUS_STEP,
        )

        if (isAnyInputVariableFromPreviousStage) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Cannot save a task with input variables from previous stages as a plugin.',
            })
            return
        }

        setOpenCreatePluginModal(true)
    }

    const handleCloseCreatePluginModal = () => {
        setOpenCreatePluginModal(false)
    }

    return (
        <>
            <Tippy className="default-tt" arrow={false} content="Save as a reusable plugin">
                <button
                    type="button"
                    className="flex br-4 dc__hover-b50-imp dc__no-shrink dc__gap-4 px-6 py-4 dc__no-background dc__no-border dc__outline-none-imp dc__tab-focus"
                    onClick={handleOpenCreatePluginModal}
                    data-testid="open-create-plugin-modal-button"
                >
                    <ICSave className="dc__no-shrink icon-dim-16 scb-5" />
                    <span className="cb-5 fs-13 fw-6 lh-20">Save as plugin</span>
                </button>
            </Tippy>

            <div className="h-16 dc__border-right-n1" />

            {openCreatePluginModal && <CreatePluginModal handleClose={handleCloseCreatePluginModal} />}
        </>
    )
}

export default CreatePluginButton
