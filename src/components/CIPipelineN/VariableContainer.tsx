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

import React, { useState, useContext, Fragment, useEffect } from 'react'
import Tippy from '@tippyjs/react'
import { ReactComponent as Dropdown } from '../../assets/icons/ic-chevron-down.svg'
import { PluginVariableType } from '../ciPipeline/types'
import CustomInputVariableSelect from './CustomInputVariableSelect'
import { ReactComponent as AlertTriangle } from '../../assets/icons/ic-alert-triangle.svg'
import { pipelineContext } from '../workflowEditor/workflowEditor'

export const VariableContainer = ({ type }: { type: PluginVariableType }) => {
    const [collapsedSection, setCollapsedSection] = useState<boolean>(type !== PluginVariableType.INPUT)
    const { formData, selectedTaskIndex, activeStageName, formDataErrorObj } = useContext(pipelineContext)
    const variableLength =
        formData[activeStageName].steps[selectedTaskIndex].pluginRefStepDetail[
            type === PluginVariableType.INPUT ? 'inputVariables' : 'outputVariables'
        ]?.length || 0
    useEffect(() => {
        if (collapsedSection) {
            const invalidInputVariables = formDataErrorObj[activeStageName].steps[
                selectedTaskIndex
            ].pluginRefStepDetail.inputVariables?.some((inputVariable) => !inputVariable.isValid)
            if (invalidInputVariables) {
                setCollapsedSection(false) // expand input variables in case of error
            }
        }
    }, [formDataErrorObj])

    return (
        <div>
            <div className="mb-10 flexbox justify-space">
                <span
                    className="fw-6 fs-13 cn-9 pointer"
                    onClick={() => {
                        variableLength > 0 && setCollapsedSection(!collapsedSection)
                    }}
                >
                    {type} variables
                </span>
                {variableLength > 0 ? (
                    <Dropdown
                        data-testid="input-variable-value-dropdown"
                        className="pointer"
                        style={{ transform: collapsedSection ? 'rotate(0)' : 'rotate(180deg)' }}
                        onClick={(event) => {
                            setCollapsedSection(!collapsedSection)
                        }}
                    />
                ) : (
                    <div className="fs-13 cn-7">No {type} variables</div>
                )}
            </div>
            {!collapsedSection && (
                <div className="variable-container">
                    <div className="fs-12 fw-6 dc__uppercase">Variable</div>
                    <div className="fs-12 fw-6 dc__uppercase">Format</div>
                    <div className="fs-12 fw-6 dc__uppercase">
                        {type === PluginVariableType.INPUT ? 'Value' : 'Description'}
                    </div>
                    {formData[activeStageName].steps[selectedTaskIndex].pluginRefStepDetail[
                        type === PluginVariableType.INPUT ? 'inputVariables' : 'outputVariables'
                    ]?.map((variable, index) => {
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
                                                <span style={{ fontWeight: 'bold', wordBreak: 'break-all' }}>
                                                    {variable.name}
                                                </span>
                                                <br />
                                                <span>{variable.description}</span>
                                            </span>
                                        }
                                    >
                                        <div
                                            data-testid={`${variable.name}-dropdown`}
                                            className="fs-13 fw-4 lh-28 dc__ellipsis-right"
                                        >
                                            <span className="text-underline-dashed">{variable.name}</span>
                                        </div>
                                    </Tippy>
                                ) : (
                                    <div className="fs-13 fw-4 lh-28">{variable.name}</div>
                                )}

                                <div className="fs-13 fw-4 lh-28">{variable.format}</div>
                                {type === PluginVariableType.INPUT ? (
                                    <div className="fs-14 dc__position-rel">
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
