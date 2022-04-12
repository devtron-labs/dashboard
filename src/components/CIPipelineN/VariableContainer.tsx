import React, { useState, useContext } from 'react'
import dropdown from '../../assets/icons/ic-chevron-down.svg'
import { FormType, PluginVariableType } from '../ciPipeline/types'
import { ciPipelineContext } from './CIPipeline'
import CustomInputVariableSelect from './CustomInputVariableSelect'

export function VariableContainer({ type }: { type: PluginVariableType }) {
    const [collapsedSection, setCollapsedSection] = useState<boolean>(true)
    const {
        formData,
        selectedTaskIndex,
        activeStageName,
    }: {
        formData: FormType
        selectedTaskIndex: number
        activeStageName: string
    } = useContext(ciPipelineContext)
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
                                    <CustomInputVariableSelect selectedVariableIndex={index} />
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
