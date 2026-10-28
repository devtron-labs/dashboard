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

import {
    PipelineFormType,
    RefVariableType,
    StepType,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'

import { validateTask } from '@Components/cdPipeline/cdpipeline.util'
import { PipelineFormDataErrorType } from '@Components/workflowEditor/types'

import { DEFAULT_PLUGIN_FORM_DATA_ERROR_OBJ, getDefaultPluginStep, PLUGIN_TASK_STAGE_NAME } from '../constants'
import { getPluginTaskFormData } from '../utils'

/**
 * Holds the custom task (script, variables & conditions) of the plugin in the pipeline form shape,
 * so that the pipeline task editor components can be reused as is.
 */
const usePluginTaskForm = () => {
    const [formData, setFormData] = useState<PipelineFormType>(() => getPluginTaskFormData(getDefaultPluginStep()))
    const [formDataErrorObj, setFormDataErrorObj] = useState<PipelineFormDataErrorType>(() =>
        structuredClone(DEFAULT_PLUGIN_FORM_DATA_ERROR_OBJ),
    )

    const getStep = (): StepType => formData[PLUGIN_TASK_STAGE_NAME].steps[0]

    const resetStep = (step: StepType) => {
        setFormData(getPluginTaskFormData(step))
        setFormDataErrorObj(structuredClone(DEFAULT_PLUGIN_FORM_DATA_ERROR_OBJ))
    }

    /**
     * Validates the task for saving as plugin and returns the task with the given name, null in case of errors
     */
    const getValidatedStep = (taskName: string): StepType | null => {
        const step: StepType = { ...structuredClone(getStep()), name: taskName }
        const clonedFormDataErrorObj = structuredClone(formDataErrorObj)
        const taskErrorObj = clonedFormDataErrorObj[PLUGIN_TASK_STAGE_NAME].steps[0]

        validateTask(step, taskErrorObj, { isSaveAsPlugin: true })
        setFormDataErrorObj(clonedFormDataErrorObj)

        if (!taskErrorObj.isValid) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Please fix the errors in script, variables or conditions before saving the plugin.',
            })
            return null
        }

        const isAnyInputVariableFromPreviousStep = (step.inlineStepDetail?.inputVariables ?? []).some(
            (variable) => variable.variableType === RefVariableType.FROM_PREVIOUS_STEP,
        )

        if (isAnyInputVariableFromPreviousStep) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Cannot save a plugin with input variables from previous steps.',
            })
            return null
        }

        return step
    }

    return { formData, setFormData, formDataErrorObj, setFormDataErrorObj, getStep, resetStep, getValidatedStep }
}

export default usePluginTaskForm
