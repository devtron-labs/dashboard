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

import React, { useState, useEffect, useContext, useRef } from 'react'
import { RefVariableType, PluginType, RefVariableStageType } from '@devtron-labs/devtron-fe-common-lib'
import { BuildStageVariable } from '../../config'
import { ExtendedOptionType } from '../app/types'
import { pipelineContext } from '../workflowEditor/workflowEditor'
import { excludeVariables } from './Constants'
import { InputPluginSelection } from './InputPluginSelect'
import { SuggestedTagOptionType } from './types'

const CustomInputVariableSelect = ({ selectedVariableIndex }: { selectedVariableIndex: number }) => {
    const refVar = useRef(null)
    const {
        formData,
        setFormData,
        selectedTaskIndex,
        activeStageName,
        inputVariablesListFromPrevStep,
        globalVariables,
        formDataErrorObj,
        setFormDataErrorObj,
        validateTask,
        isCdPipeline,
    } = useContext(pipelineContext)
    const [selectedOutputVariable, setSelectedOutputVariable] = useState<ExtendedOptionType>({
        label: '',
        value: '',
        format: '',
    })

    const [inputVariableOptions, setInputVariableOptions] = useState<SuggestedTagOptionType[]>([])

    useEffect(() => {
        const previousStepVariables = []

        if (inputVariablesListFromPrevStep[activeStageName].length > 0) {
            inputVariablesListFromPrevStep[activeStageName][selectedTaskIndex].forEach((element) => {
                previousStepVariables.push({
                    ...element,
                    label: element.name,
                    value: element.name,
                    refVariableTaskName: formData[activeStageName]?.steps[element?.refVariableStepIndex - 1].name,
                })
            })
        }
        if (activeStageName === BuildStageVariable.PostBuild) {
            const preBuildStageVariables = []
            const preBuildTaskLength = formData[BuildStageVariable.PreBuild]?.steps?.length
            if (preBuildTaskLength >= 1 && !isCdPipeline) {
                if (inputVariablesListFromPrevStep[BuildStageVariable.PreBuild].length > 0) {
                    inputVariablesListFromPrevStep[BuildStageVariable.PreBuild][preBuildTaskLength - 1].forEach(
                        (element) => {
                            preBuildStageVariables.push({
                                ...element,
                                label: element.name,
                                value: element.name,
                                refVariableTaskName:
                                    formData[BuildStageVariable.PreBuild]?.steps[element?.refVariableStepIndex - 1]
                                        .name,
                            })
                        },
                    )
                }

                const stepTypeVariable =
                    formData[BuildStageVariable.PreBuild].steps[preBuildTaskLength - 1].stepType === PluginType.INLINE
                        ? 'inlineStepDetail'
                        : 'pluginRefStepDetail'
                const preBuildStageLastTaskOutputVariables =
                    formData[BuildStageVariable.PreBuild].steps[preBuildTaskLength - 1][stepTypeVariable]
                        ?.outputVariables
                const outputVariablesLength = preBuildStageLastTaskOutputVariables?.length || 0
                for (let j = 0; j < outputVariablesLength; j++) {
                    if (preBuildStageLastTaskOutputVariables[j].name) {
                        const currentVariableDetails = preBuildStageLastTaskOutputVariables[j]
                        preBuildStageVariables.push({
                            ...currentVariableDetails,
                            label: currentVariableDetails.name,
                            value: currentVariableDetails.name,
                            refVariableStepIndex: preBuildTaskLength,
                            refVariableTaskName:
                                formData[BuildStageVariable.PreBuild].steps[preBuildTaskLength - 1].name,
                            refVariableStage: RefVariableStageType.PRE_CI,
                        })
                    }
                }
            }
            setInputVariableOptions([
                {
                    label: 'From Pre-build Stage',
                    options: preBuildStageVariables,
                },
                {
                    label: 'From Post-build Stage',
                    options: previousStepVariables,
                },
                {
                    label: 'System variables',
                    options: globalVariables,
                },
            ])
        } else {
            setInputVariableOptions([
                {
                    label: 'From Previous Steps',
                    options: previousStepVariables,
                },
                {
                    label: 'System variables',
                    options: globalVariables.filter(
                        (variable) =>
                            (isCdPipeline && variable.stageType !== 'post-cd') ||
                            !excludeVariables.includes(variable.value),
                    ),
                },
            ])
        }
        setSelectedVariableValue()
    }, [inputVariablesListFromPrevStep, selectedTaskIndex, activeStageName])

    const handleOutputVariableSelector = (selectedValue: ExtendedOptionType) => {
        setSelectedOutputVariable(selectedValue)
        const currentStepTypeVariable =
            formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.INLINE
                ? 'inlineStepDetail'
                : 'pluginRefStepDetail'
        const _formData = { ...formData }
        let _variableDetail
        if (selectedValue['refVariableStepIndex']) {
            _variableDetail = {
                value: '',
                variableType: RefVariableType.FROM_PREVIOUS_STEP,
                refVariableStepIndex: selectedValue['refVariableStepIndex'],
                refVariableName: selectedValue.label,
                format: selectedValue['format'],
                refVariableStage: selectedValue['refVariableStage'],
            }
        } else if (selectedValue['variableType'] === RefVariableType.GLOBAL) {
            _variableDetail = {
                variableType: RefVariableType.GLOBAL,
                refVariableStepIndex: 0,
                refVariableName: selectedValue.label,
                format: selectedValue['format'],
                value: '',
                refVariableStage: '',
            }
        } else {
            _variableDetail = {
                variableType: RefVariableType.NEW,
                value: selectedValue.label,
                refVariableName: '',
                refVariableStage: '',
            }
        }
        let _inputVariables =
            _formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].inputVariables[
                selectedVariableIndex
            ]
        if (formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.PLUGIN_REF) {
            _variableDetail.format = _inputVariables.format
        }
        _inputVariables = {
            ..._inputVariables,
            ..._variableDetail,
        }
        _formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].inputVariables[
            selectedVariableIndex
        ] = _inputVariables
        const _formErrorObject = { ...formDataErrorObj }
        validateTask(
            _formData[activeStageName].steps[selectedTaskIndex],
            _formErrorObject[activeStageName].steps[selectedTaskIndex],
        )
        setFormDataErrorObj(_formErrorObject)
        setFormData(_formData)
    }

    const setSelectedVariableValue = () => {
        const selectedVariable =
            formData[activeStageName].steps[selectedTaskIndex][
                formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.INLINE
                    ? 'inlineStepDetail'
                    : 'pluginRefStepDetail'
            ].inputVariables[selectedVariableIndex]
        const selectedValueLabel =
            (selectedVariable.variableType === RefVariableType.NEW
                ? selectedVariable.value
                : selectedVariable.refVariableName) || ''
        setSelectedOutputVariable({ ...selectedVariable, label: selectedValueLabel, value: selectedValueLabel })
    }

    return (
        <InputPluginSelection
            placeholder="Select source or input value"
            selectedOutputVariable={selectedOutputVariable}
            setVariableData={handleOutputVariableSelector}
            variableData={selectedOutputVariable}
            refVar={refVar}
            variableOptions={inputVariableOptions}
            selectedVariableIndex={selectedVariableIndex}
        />
    )
}

export default CustomInputVariableSelect
