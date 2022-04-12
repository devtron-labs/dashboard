import React, { useState, useEffect } from 'react'
import { tempMultiSelectStyles } from './ciPipeline.utils'
import ReactSelect from 'react-select'
import { PluginVariableType, FormType, RefVariableType, VariableType, PluginType } from '../ciPipeline/types'

export const globalVariable = [
    { value: 'docker-image-tag', label: 'docker-image-tag' },
    { value: 'date', label: 'date' },
    { value: 'time', label: 'time' },
]

function CustomInputVariableSelect({
    selectedTaskIndex,
    formData,
    setFormData,
    activeStageName,
    inputVariablesListFromPrevStep,
    selectedVariableIndex,
}: {
    selectedTaskIndex: number
    formData: FormType
    setFormData: React.Dispatch<React.SetStateAction<FormType>>
    activeStageName: string
    inputVariablesListFromPrevStep: {
        preBuildStage: Map<string, VariableType>[]
        postBuildStage: Map<string, VariableType>[]
    }
    selectedVariableIndex: number
}) {
    const [selectedOutputVariable, setSelectedOutputVariable] = useState<{
        label: string
        value: string
        refVariableStepIndex: number
    }>({
        label: '',
        value: '',
        refVariableStepIndex: 0,
    })

    const [inputVariableOptions, setInputVariableOptions] = useState<
        {
            label: string
            options: any[]
        }[]
    >([])

    useEffect(() => {
        const previousStepVariables = []
        inputVariablesListFromPrevStep[activeStageName][selectedTaskIndex].forEach((element) => {
            previousStepVariables.push({ ...element, label: element.name, value: element.name })
        })
        setInputVariableOptions([
            {
                label: 'From Previous Steps',
                options: previousStepVariables,
            },
            {
                label: 'Global variables',
                options: globalVariable,
            },
        ])
    }, [inputVariablesListFromPrevStep])

    const handleOutputVariableSelector = (selectedValue: {
        label: string
        value: string
        refVariableStepIndex: number
    }) => {
        setSelectedOutputVariable(selectedValue)
        const _formData = { ...formData }
        if (selectedValue.refVariableStepIndex) {
            const currentStepTypeVariable =
                formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.INLINE
                    ? 'inlineStepDetail'
                    : 'pluginRefStepDetail'
            if (!_formData[activeStageName].steps[selectedTaskIndex].usedRefVariable) {
                _formData[activeStageName].steps[selectedTaskIndex].usedRefVariable = {}
            }
            _formData[activeStageName].steps[selectedTaskIndex].usedRefVariable[
                selectedValue.refVariableStepIndex + '.' + selectedValue.label
            ] = selectedVariableIndex
            _formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].inputVariables[
                selectedVariableIndex
            ] = {
                ..._formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].inputVariables[
                    selectedVariableIndex
                ],
                RefVariableUsed: true,
                RefVariableType: RefVariableType.FROM_PREVIOUS_STEP,
                RefVariableStepIndex: selectedValue.refVariableStepIndex,
                RefVariableName: selectedValue.label,
            }
            setFormData(_formData)
        }
    }

    return (
        <ReactSelect
            autoFocus
            tabIndex={1}
            value={selectedOutputVariable}
            options={inputVariableOptions}
            placeholder="Select source or input value"
            onChange={handleOutputVariableSelector}
            isSearchable={false}
            styles={tempMultiSelectStyles}
        />
    )
}

export default CustomInputVariableSelect
