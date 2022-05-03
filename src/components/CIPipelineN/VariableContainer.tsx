import React, { useState, useContext, Fragment } from 'react'
import { ReactComponent as Dropdown } from '../../assets/icons/ic-chevron-down.svg'
import { FormErrorObjectType, FormType, PluginVariableType } from '../ciPipeline/types'
import { ciPipelineContext } from './CIPipeline'
import CustomInputVariableSelect from './CustomInputVariableSelect'
import { ReactComponent as AlertTriangle } from '../../assets/icons/ic-alert-triangle.svg'
import Tippy from '@tippyjs/react'

export function VariableContainer({ type }: { type: PluginVariableType }) {
    const [collapsedSection, setCollapsedSection] = useState<boolean>(true)
    const {
        formData,
        selectedTaskIndex,
        activeStageName,
        formDataErrorObj,
    }: {
        formData: FormType
        selectedTaskIndex: number
        activeStageName: string
        formDataErrorObj: FormErrorObjectType
    } = useContext(ciPipelineContext)
    return (
        <div>
            <div className="mb-10 flexbox justify-space">
                <span
                    className="fw-6 fs-13 cn-9 pointer"
                    onClick={(event) => {
                        setCollapsedSection(!collapsedSection)
                    }}
                >
                    {type} variables
                </span>
                {formData[activeStageName].steps[selectedTaskIndex].pluginRefStepDetail[
                    type === PluginVariableType.INPUT ? 'inputVariables' : 'outputVariables'
                ] ? (
                    <Dropdown
                        className="pointer"
                        style={{ transform: collapsedSection ? 'rotate(0)' : 'rotate(180deg)' }}
                        onClick={(event) => {
                            setCollapsedSection(!collapsedSection)
                        }}
                    />
                ) : (
                    <div className="fs-13 cn-7">No output variables</div>
                )}
            </div>
            {!collapsedSection && (
                <div className="variable-container">
                    <div className="fs-12 fw-6 text-uppercase">Variable</div>
                    <div className="fs-12 fw-6 text-uppercase">Format</div>
                    <div className="fs-12 fw-6 text-uppercase">
                        {type === PluginVariableType.INPUT ? 'Value' : 'Description'}
                    </div>
                    {formData[activeStageName].steps[selectedTaskIndex].pluginRefStepDetail[
                        type === PluginVariableType.INPUT ? 'inputVariables' : 'outputVariables'
                    ]?.map((variable, index) => {
                        {
                            console.log('hi', variable, variable.length)
                        }
                        {
                            console.log(
                                formData[activeStageName].steps[selectedTaskIndex].pluginRefStepDetail.outputVariables,
                            )
                        }
                        const errorObj =
                            formDataErrorObj[activeStageName].steps[selectedTaskIndex]?.pluginRefStepDetail
                                .inputVariables[index]
                        return (
                            <Fragment key={`variable-container-${index}`}>
                                {type === PluginVariableType.INPUT && variable.description ? (
                                    <Tippy
                                        className="default-tt"
                                        arrow={false}
                                        content={
                                            <span style={{ display: 'block', width: '185px' }}>
                                                {variable.description}
                                            </span>
                                        }
                                    >
                                        <div className="fs-13 fw-4 lh-28">
                                            <span className="text-underline-dashed">{variable.name}</span>
                                        </div>
                                    </Tippy>
                                ) : (
                                    <div className="fs-13 fw-4 lh-28">{variable.name}</div>
                                )}

                                <div className="fs-13 fw-4 lh-28">{variable.format}</div>
                                {type === PluginVariableType.INPUT ? (
                                    <div className="fs-14">
                                        <CustomInputVariableSelect selectedVariableIndex={index} />
                                        {errorObj && !errorObj.isValid && (
                                            <span className="flexbox cr-5 mt-4 fw-5 fs-11 flexbox">
                                                <AlertTriangle className="icon-dim-14 mr-5 ml-5 mt-2" />
                                                <span>{errorObj.message}</span>
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <div className="fs-13 fw-4 lh-28">{variable.description}</div>
                                )}
                            </Fragment>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
