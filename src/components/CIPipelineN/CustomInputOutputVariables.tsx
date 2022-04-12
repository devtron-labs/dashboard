import React, { useState } from 'react'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { tempMultiSelectStyles } from './ciPipeline.utils'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import ReactSelect, { OptionProps, Options } from 'react-select'
import { PluginVariableType, FormType, RefVariableType } from '../ciPipeline/types'
import { element } from 'prop-types'

enum VariableType {
    INPUT = 'inputVariables',
    OUTPUT = 'outputVariables',
}

export const globalVariable = [
    { value: 'docker-image-tag', label: 'docker-image-tag' },
    { value: 'date', label: 'date' },
    { value: 'time', label: 'time' },
]

function CustomInputOutputVariables({
    type,
    selectedTaskIndex,
    formData,
    setFormData,
    activeStageName,
}: {
    type: PluginVariableType
    selectedTaskIndex: number
    formData: FormType
    setFormData: React.Dispatch<React.SetStateAction<FormType>>
    activeStageName: string
}) {
    const [selectedOutputVariable, setSelectedOutputVariable] = useState<{ label: string; value: string }>({
        label: '',
        value: '',
    })

    let pluginType: string = ''
    if (type === PluginVariableType.INPUT) {
        pluginType = VariableType.INPUT
    } else if (type === PluginVariableType.OUTPUT) {
        pluginType = VariableType.OUTPUT
    }

    const addVariable = (): void => {
        const _formData = { ...formData }
        const id =
            _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[pluginType]?.reduce(
                (prev, current) => (prev.id > current.id ? prev : current),
                {
                    id: 0,
                },
            ).id + 1
        const newCondition = {
            id: id,
            name: '',
            value: 0,
            format: '',
            description: '',
            defaultValue: '',
            RefVariableUsed: true,
            RefVariableType: RefVariableType.GLOBAL,
            RefVariableStepIndex: 0,
            RefVariableName: '',
        }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[pluginType].push(newCondition)
        setFormData(_formData)
    }

    const getOutputVariableOptions = () => {
        const previousStepVariables = []
        //Need to check this
        formData[activeStageName].steps[selectedTaskIndex]?.outputVariablesFromPrevSteps?.forEach((element) => {
            previousStepVariables.push({ ...element, label: element.name, value: element.name })
        })
        return [
            {
                label: 'From Previous Steps',
                options: previousStepVariables,
            },
            {
                label: 'Global variables',
                options: globalVariable,
            },
        ]
    }

    const handleInputOutputValueChange = (e, index, variable: 'inputVariables' | 'outputVariables', key: 'name' | 'description') => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[variable][index][key] = e.target.value
        setFormData(_formData)
    }

    const deleteInputOutputValue = (index: number): void => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[pluginType].splice(index, 1)
        setFormData(_formData)
    }

    const handleOutputVariableSelector = (selectedValue: { label: string; value: string }, index: number) => {
        setSelectedOutputVariable(selectedValue)
    }

    return (
        <>
            <div className="row-container mb-8">
                <label className="tp-4 fs-13 fw-6 text-capitalize mr-8">{type} variables</label>
                <div className="pointer cb-5 fw-6 fs-13 flexbox content-fit" onClick={addVariable}>
                    <Add className="add-icon" />
                    Add variables
                </div>
            </div>
            {formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[
                type === PluginVariableType.OUTPUT ? VariableType.OUTPUT : VariableType.INPUT
            ]?.map((variable, index) => (
                <div className="pl-200">
                    <div
                        className={
                            type === PluginVariableType.INPUT
                                ? 'custom-input-variable-container'
                                : 'custom-output-variable-container'
                        }
                    >
                        <div className="tp-4 fs-13 fw-4 text-uppercase">
                            <input
                                className="w-100 bcn-1 br-4 en-2 bw-1 pl-10 pr-10 pt-6 pb-6"
                                type="text"
                                placeholder="Variables name"
                                onChange={(e) =>
                                    handleInputOutputValueChange(
                                        e,
                                        index,
                                        `${type === PluginVariableType.INPUT ? 'inputVariables' : 'outputVariables'}`,
                                        'name'
                                    )
                                }
                                value={
                                    formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[
                                        type === PluginVariableType.OUTPUT ? VariableType.OUTPUT : VariableType.INPUT
                                    ][index]['name']
                                }
                            />
                        </div>
                        {type === PluginVariableType.INPUT && (
                            <>
                                <div className="tp-4 en-2 bw-1 fs-13 fw-4 text-uppercase flex">=</div>
                                <ReactSelect
                                    autoFocus
                                    tabIndex={1}
                                    value={selectedOutputVariable}
                                    options={getOutputVariableOptions()}
                                    placeholder="Select source or input value"
                                    onChange={(selectedValue) => {
                                        handleOutputVariableSelector(selectedValue, index)
                                    }}
                                    isSearchable={false}
                                    styles={tempMultiSelectStyles}
                                />{' '}
                            </>
                        )}
                        <Close
                            className="icon-dim-24 pointer mt-6 ml-6"
                            onClick={() => {
                                deleteInputOutputValue(index)
                            }}
                        />
                    </div>

                    <input
                        style={{ width: '80% !important' }}
                        className="w-100 bcn-1 br-4 en-2 bw-1 pl-10 pr-10 pt-6 pb-6 mb-20"
                        autoComplete="off"
                        placeholder="Description"
                        type="text"
                        value={
                            formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[
                                type === PluginVariableType.OUTPUT ? VariableType.OUTPUT : VariableType.INPUT
                            ][index]['description']
                        }
                        onChange={(e) => handleInputOutputValueChange(
                            e,
                            index,
                            `${type === PluginVariableType.INPUT ? 'inputVariables' : 'outputVariables'}`,
                            'description'
                        )}
                    />
                </div>
            ))}
        </>
    )
}

export default CustomInputOutputVariables
