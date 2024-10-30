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

import { useContext } from 'react'
import { ConditionType, CustomInput, RefVariableType, SelectPicker } from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as Equal } from '../../assets/icons/ic-variable-equal.svg'
import { TaskFieldDescription, VariableFieldType, PluginVariableType } from '../ciPipeline/types'
import CustomInputVariableSelect from './CustomInputVariableSelect'
import { ReactComponent as AlertTriangle } from '../../assets/icons/ic-alert-triangle.svg'
import { OptionType } from '../app/types'
import { ReactComponent as Info } from '../../assets/icons/ic-info-filled.svg'
import { pipelineContext } from '../workflowEditor/workflowEditor'

const CustomInputOutputVariables = ({ type }: { type: PluginVariableType }) => {
    const {
        formData,
        setFormData,
        selectedTaskIndex,
        activeStageName,
        calculateLastStepDetail,
        formDataErrorObj,
        setFormDataErrorObj,
        validateTask,
    } = useContext(pipelineContext)

    const formatOptions: OptionType[] = ['STRING', 'BOOL', 'NUMBER', 'DATE'].map((format) => ({
        label: format,
        value: format,
    }))
    const addVariable = (): void => {
        const _formData = { ...formData }
        const id =
            _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[VariableFieldType[type]]?.reduce(
                (prev, current) => (prev.id > current.id ? prev : current),
                {
                    id: 0,
                },
            ).id ?? 0
        const _id = id + 1

        const newVariable = {
            id: _id,
            name: '',
            value: '',
            format: formatOptions[0].label,
            description: '',
            defaultValue: '',
            variableType: RefVariableType.NEW,
            refVariableStepIndex: 0,
            refVariableName: '',
        }
        if (!_formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[VariableFieldType[type]]) {
            _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[VariableFieldType[type]] = []
        }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[VariableFieldType[type]].unshift(
            newVariable,
        )
        const _formDataErrorObj = { ...formDataErrorObj }
        _formDataErrorObj[activeStageName].steps[selectedTaskIndex].inlineStepDetail[VariableFieldType[type]].unshift({
            isValid: true,
            message: '',
        })
        setFormDataErrorObj(_formDataErrorObj)
        setFormData(_formData)
    }

    const handleInputOutputValueChange = (e, index) => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[VariableFieldType[type]][index][
            e.target.name
        ] = e.target.value
        if (e.target.name === 'name') {
            const _formErrorObject = { ...formDataErrorObj }
            validateTask(
                _formData[activeStageName].steps[selectedTaskIndex],
                _formErrorObject[activeStageName].steps[selectedTaskIndex],
            )
            setFormDataErrorObj(_formErrorObject)
        }
        setFormData(_formData)
    }

    const handleBlur = () => {
        if (type === PluginVariableType.OUTPUT) {
            const _formData = { ...formData }
            calculateLastStepDetail(false, _formData, activeStageName, selectedTaskIndex)
            setFormData(_formData)
        }
    }

    const deleteInputOutputValue = (index: number): void => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[VariableFieldType[type]].splice(index, 1)
        if (type === PluginVariableType.OUTPUT) {
            calculateLastStepDetail(false, _formData, activeStageName, selectedTaskIndex)
        }
        if (
            _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[VariableFieldType[type]].length === 0
        ) {
            const { conditionDetails } = _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail
            for (let i = 0; i < conditionDetails?.length; i++) {
                if (
                    (type === PluginVariableType.OUTPUT &&
                        (conditionDetails[i].conditionType === ConditionType.PASS ||
                            conditionDetails[i].conditionType === ConditionType.FAIL)) ||
                    (type === PluginVariableType.INPUT &&
                        (conditionDetails[i].conditionType === ConditionType.TRIGGER ||
                            conditionDetails[i].conditionType === ConditionType.SKIP))
                ) {
                    conditionDetails.splice(i, 1)
                    i--
                }
            }
            _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.conditionDetails = conditionDetails
        }
        const _formDataErrorObj = { ...formDataErrorObj }
        validateTask(
            formData[activeStageName].steps[selectedTaskIndex],
            _formDataErrorObj[activeStageName].steps[selectedTaskIndex],
        )
        setFormDataErrorObj(_formDataErrorObj)
        setFormData(_formData)
    }

    const handleFormatChange =
        (index: number) =>
        (selectedValue: OptionType): void => {
            const _formData = { ...formData }
            _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[VariableFieldType[type]][
                index
            ].format = selectedValue.label
            if (type === PluginVariableType.OUTPUT) {
                calculateLastStepDetail(false, _formData, activeStageName, selectedTaskIndex)
            }
            setFormData(_formData)
        }

    const isDateFormat = formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[
        VariableFieldType[type]
    ]?.some((elm) => elm.format === 'DATE')

    return (
        <>
            <div className="row-container mb-4 mt-4">
                <div className={`tp-4 fs-13 fw-6 mr-8 `} style={{ position: 'relative' }}>
                    <Tippy
                        className="default-tt"
                        arrow={false}
                        content={
                            <span style={{ display: 'block', width: '220px' }}>
                                {type === PluginVariableType.INPUT
                                    ? TaskFieldDescription.INPUT
                                    : TaskFieldDescription.OUTPUT}
                            </span>
                        }
                    >
                        <span className="text-underline-dashed lh-32">{type} variables </span>
                    </Tippy>
                    {isDateFormat && (
                        <div
                            className="bcb-1 br-4 fw-4 pl-12 pr-12 pt-8 pb-8"
                            style={{ width: '180px', marginRight: '60px', position: 'absolute' }}
                        >
                            <div className="format-grid">
                                <Info className="mr-4 icon-dim-16" />
                                <span className="cb-5 mb-2 lh-1-33">
                                    <a
                                        className="dc__no-decor"
                                        href="https://github.com/Knetic/govaluate/blob/0580e9b47a69125afa0e4ebd1cf93c49eb5a43ec/parsing.go#L258"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Standardized date formats&nbsp;
                                    </a>
                                    <span className="cn-9">identified by Devtron</span>
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div
                    className="pointer cb-5 fw-6 fs-13 flexbox content-fit lh-32"
                    onClick={addVariable}
                    data-testid={`custom-script-${type.toLowerCase()}-variable-add-variable-button`}
                >
                    <Add className="add-icon mt-6" />
                    Add variable
                </div>
                <div style={{ lineHeight: '4px' }} />
            </div>
            {formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[VariableFieldType[type]]?.map(
                (variable, index) => {
                    const errorObj =
                        formDataErrorObj[activeStageName].steps[selectedTaskIndex]?.inlineStepDetail[
                            VariableFieldType[type]
                        ][index]
                    return (
                        <div key={`custom-input-variable${index}-${variable.id}`} className="pl-220 mb-8">
                            <div className="flexbox justify-space">
                                <div className="custom-variable-container w-100">
                                    <Equal className="icon-dim-40 variable-equal-icon" />

                                    <div className="tp-4 fs-12 fw-4">
                                        <div className="flexbox">
                                            <div
                                                style={{
                                                    width: type === PluginVariableType.OUTPUT ? '80%' : '100%',
                                                }}
                                            >
                                                <CustomInput
                                                    data-testid={`custom-script-${type.toLowerCase()}-variable-add-variable-variable-name-textbox`}
                                                    rootClassName={`w-100 en-2 bw-1 pl-10 pr-10 pt-4 pb-4 h-32 dc__no-bottom-border ${
                                                        type === PluginVariableType.INPUT
                                                            ? 'dc__top-radius-4'
                                                            : 'dc__top-left-radius'
                                                    }`}
                                                    type="text"
                                                    placeholder="Variable name"
                                                    value={variable.name}
                                                    name="name"
                                                    onChange={(e) => handleInputOutputValueChange(e, index)}
                                                    onBlur={handleBlur}
                                                />
                                            </div>

                                            {type === PluginVariableType.OUTPUT && (
                                                <div className="dc__border-right w-20 dc__top-right-radius-4">
                                                    <SelectPicker
                                                        inputId="output-variable-format-select"
                                                        name="output-variable-format-select"
                                                        classNamePrefix="output-variable-format-select"
                                                        value={
                                                            variable.format
                                                                ? { label: variable.format, value: variable.format }
                                                                : formatOptions[0]
                                                        }
                                                        onChange={handleFormatChange(index)}
                                                        options={formatOptions}
                                                        isSearchable={false}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {type === PluginVariableType.INPUT && (
                                        <div className="flexbox">
                                            <div className="dc__border-left w-80">
                                                <CustomInputVariableSelect selectedVariableIndex={index} />
                                            </div>
                                            <div className="w-20-per">
                                                <SelectPicker
                                                    value={
                                                        variable.format
                                                            ? { label: variable.format, value: variable.format }
                                                            : formatOptions[0]
                                                    }
                                                    classNamePrefix="input-variable-format-select"
                                                    inputId="input-variable"
                                                    onChange={handleFormatChange(index)}
                                                    options={formatOptions}
                                                    isSearchable={false}
                                                    name="format"
                                                    isDisabled={
                                                        variable.format &&
                                                        (variable.variableType === RefVariableType.GLOBAL ||
                                                            variable.variableType ===
                                                                RefVariableType.FROM_PREVIOUS_STEP)
                                                    }
                                                    shouldMenuAlignRight
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <CustomInput
                                        data-testid={`custom-script-${type.toLowerCase()}-variable-add-description-textbox`}
                                        rootClassName={`w-100 en-2 bw-1 pl-10 pr-10 pt-6 pb-6 dc__bottom-radius-4 h-32 ${
                                            type === PluginVariableType.INPUT ? 'dc__no-top-border' : ''
                                        }`}
                                        placeholder="Description"
                                        value={variable.description}
                                        name="description"
                                        onChange={(e) => handleInputOutputValueChange(e, index)}
                                        onBlur={handleBlur}
                                    />
                                </div>

                                <Close
                                    className="icon-dim-24 pointer mt-6 ml-6"
                                    onClick={() => {
                                        deleteInputOutputValue(index)
                                    }}
                                />
                            </div>
                            {errorObj && !errorObj.isValid && (
                                <span className="flexbox cr-5 mt-4 fw-5 fs-11 flexbox">
                                    <AlertTriangle className="icon-dim-14 mr-5 ml-5 mt-2" />
                                    <span>{errorObj.message}</span>
                                </span>
                            )}
                        </div>
                    )
                },
            )}
        </>
    )
}

export default CustomInputOutputVariables
