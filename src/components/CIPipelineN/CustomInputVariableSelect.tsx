import React, { useState, useEffect, useContext } from 'react'
import { tempMultiSelectStyles } from './ciPipeline.utils'
import { RefVariableType, PluginType, FormType, VariableType, RefVariableStageType } from '../ciPipeline/types'
import { ciPipelineContext } from './CIPipeline'
import CreatableSelect from 'react-select/creatable'
import { components } from 'react-select'
import { BuildStageVariable } from '../../config'

export const globalVariable = [
    { value: 'docker-image-tag', label: 'docker-image-tag' },
    { value: 'date', label: 'date' },
    { value: 'time', label: 'time' },
]

function CustomInputVariableSelect({ selectedVariableIndex }: { selectedVariableIndex: number }) {
    const {
        formData,
        setFormData,
        selectedTaskIndex,
        activeStageName,
        inputVariablesListFromPrevStep,
    }: {
        formData: FormType
        setFormData: React.Dispatch<React.SetStateAction<FormType>>
        selectedTaskIndex: number
        activeStageName: string
        inputVariablesListFromPrevStep: {
            preBuildStage: Map<string, VariableType>[]
            postBuildStage: Map<string, VariableType>[]
        }
    } = useContext(ciPipelineContext)
    const [selectedOutputVariable, setSelectedOutputVariable] = useState<{
        label: string
        value: string
        refVariableStepIndex: number
        refVariableStage: RefVariableStageType
    }>({
        label: '',
        value: '',
        refVariableStepIndex: 0,
        refVariableStage: RefVariableStageType.NO_REF,
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
        if (activeStageName === BuildStageVariable.PostBuild) {
            const preBuildTaskLength = formData[BuildStageVariable.PreBuild].steps.length
            if (preBuildTaskLength > 1) {
                const preBuildStageVariables = []
                inputVariablesListFromPrevStep[BuildStageVariable.PreBuild][preBuildTaskLength - 1].forEach(
                    (element) => {
                        preBuildStageVariables.push({ ...element, label: element.name, value: element.name })
                    },
                )
                const stepTypeVariable =
                    formData[BuildStageVariable.PreBuild].steps[preBuildTaskLength - 1].stepType === PluginType.INLINE
                        ? 'inlineStepDetail'
                        : 'pluginRefStepDetail'
                const outputVariablesLength =
                    formData[BuildStageVariable.PreBuild].steps[preBuildTaskLength - 1][stepTypeVariable]
                        .outputVariables.length
                for (let j = 0; j < outputVariablesLength; j++) {
                    const currentVariableDetails =
                        formData[BuildStageVariable.PreBuild].steps[preBuildTaskLength - 1][stepTypeVariable]
                            .outputVariables[j]
                    preBuildStageVariables.push({
                        ...currentVariableDetails,
                        label: currentVariableDetails.name,
                        value: currentVariableDetails.name,
                        refVariableStepIndex: preBuildTaskLength - 1,
                    })
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
                        label: 'Global variables',
                        options: globalVariable,
                    },
                ])
            }
        } else {
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
        }
    }, [inputVariablesListFromPrevStep])

    const handleOutputVariableSelector = (selectedValue: {
        label: string
        value: string
        refVariableStepIndex: number
        refVariableStage: RefVariableStageType
    }) => {
        setSelectedOutputVariable(selectedValue)
        const _formData = { ...formData }
        if (selectedValue.refVariableStepIndex) {
            const currentStepTypeVariable =
                formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.INLINE
                    ? 'inlineStepDetail'
                    : 'pluginRefStepDetail'
            _formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].inputVariables[
                selectedVariableIndex
            ] = {
                ..._formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].inputVariables[
                    selectedVariableIndex
                ],
                refVariableUsed: true,
                refVariableType: RefVariableType.FROM_PREVIOUS_STEP,
                refVariableStepIndex: selectedValue.refVariableStepIndex,
                refVariableName: selectedValue.label,
                refVariableStage: selectedValue.refVariableStage,
            }
            setFormData(_formData)
        }
    }

    return (
        <CreatableSelect
            autoFocus
            tabIndex={1}
            value={selectedOutputVariable}
            options={inputVariableOptions}
            placeholder="Select source or input value"
            onChange={handleOutputVariableSelector}
            styles={tempMultiSelectStyles}
            components={{
                MenuList: (props) => {
                    return (
                        <components.MenuList {...props}>
                            <div className="cn-5 pl-12 pt-4 pb-4" style={{ fontStyle: 'italic' }}>
                                Type to enter a custom value
                            </div>
                            {props.children}
                        </components.MenuList>
                    )
                },
            }}
        />
    )
}

export default CustomInputVariableSelect
