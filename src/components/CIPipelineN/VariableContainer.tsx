import React, { useState } from 'react'
import dropdown from '../../assets/icons/ic-chevron-down.svg'
import { FormType, PluginVariableType } from '../ciPipeline/types'
import CustomInputOutputVariables from './CustomInputOutputVariables'

export function VariableContainer({
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
    const [collapsedSection, setCollapsedSection] = useState<boolean>(true)

    const handleInputValueChange = (e: any, index: number): void => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].pluginRefStepDetail.inputVariables[index]['value'] =
            e.target.value
        setFormData(_formData)
    }
    return (
        <div>
            <div
                className="mb-10 flexbox pointer"
                onClick={(event) => {
                    setCollapsedSection(!collapsedSection)
                }}
            >
                <span className="fw-6 fs-13 cn-9">{type} variables</span>
                <img
                    className="icon-dim-32 ml-auto"
                    src={dropdown}
                    alt="dropDown"
                    style={{ transform: collapsedSection ? 'rotate(0)' : 'rotate(180deg)' }}
                />
            </div>
            {!collapsedSection && (
                <div className="variable-container">
                    <label className="p-4 fs-12 fw-6 text-uppercase">Variable</label>
                    <label className="p-4 fs-12 fw-6 text-uppercase">Format</label>
                    <label className="p-4 fs-12 fw-6 text-uppercase">
                        {type === PluginVariableType.INPUT ? 'Value' : 'Description'}
                    </label>
                    {formData[activeStageName].steps[selectedTaskIndex].pluginRefStepDetail[
                        type === PluginVariableType.OUTPUT ? 'outputVariables' : 'inputVariables'
                    ]?.map((variable, index) => (
                        <>
                            <label className="p-4 fs-13 fw-4">{variable.name}</label>
                            <label className="p-4 fs-13 fw-4">{variable.format}</label>
                            {type === PluginVariableType.INPUT ? (
                                <div className="p-4 fs-14">
                                    <input
                                        className="w-100"
                                        type="text"
                                        value={variable.value || variable.defaultValue}
                                        onChange={(e) => handleInputValueChange(e, index)}
                                    />
                                </div>
                            ) : (
                                <label className="p-4 fs-13 fw-4">{variable.description}</label>
                            )}
                        </>
                    ))}
                </div>
            )}
        </div>
    )
}
