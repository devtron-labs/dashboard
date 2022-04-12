import React, { useState, useEffect } from 'react'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { tempMultiSelectStyles } from './ciPipeline.utils'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import ReactSelect from 'react-select'
import { PluginVariableType, FormType, RefVariableType, VariableType } from '../ciPipeline/types'
import CustomInputVariableSelect from './CustomInputVariableSelect'

enum VariableFieldType {
    Input = 'inputVariables',
    Output = 'outputVariables',
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
    inputVariablesListFromPrevStep,
}: {
    type: PluginVariableType
    selectedTaskIndex: number
    formData: FormType
    setFormData: React.Dispatch<React.SetStateAction<FormType>>
    activeStageName: string
    inputVariablesListFromPrevStep: {
        preBuildStage: Map<string, VariableType>[]
        postBuildStage: Map<string, VariableType>[]
    }
}) {
    const addVariable = (): void => {
        const _formData = { ...formData }
        const id =
            _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[VariableFieldType[type]]?.reduce(
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
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[VariableFieldType[type]].push(newCondition)
        setFormData(_formData)
    }

    const handleInputOutputValueChange = (e, index) => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[VariableFieldType[type]][index][
            e.target.name
        ] = e.target.value
        setFormData(_formData)
    }

    const deleteInputOutputValue = (index: number): void => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[VariableFieldType[type]].splice(index, 1)
        setFormData(_formData)
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
            {formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[VariableFieldType[type]]?.map(
                (variable, index) => (
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
                                    value={variable.name}
                                    name="name"
                                    onChange={(e) => handleInputOutputValueChange(e, index)}
                                />
                            </div>
                            {type === PluginVariableType.INPUT && (
                                <>
                                    <div className="tp-4 en-2 bw-1 fs-13 fw-4 text-uppercase flex">=</div>
                                    <CustomInputVariableSelect
                                        selectedTaskIndex={selectedTaskIndex}
                                        formData={formData}
                                        setFormData={setFormData}
                                        activeStageName={activeStageName}
                                        inputVariablesListFromPrevStep={inputVariablesListFromPrevStep}
                                        selectedVariableIndex={index}
                                    />
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
                            value={variable.description}
                            name="description"
                            onChange={(e) => handleInputOutputValueChange(e, index)}
                        />
                    </div>
                ),
            )}
        </>
    )
}

export default CustomInputOutputVariables
