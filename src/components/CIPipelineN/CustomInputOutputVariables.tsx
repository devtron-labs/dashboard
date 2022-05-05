import React, { useContext, useState } from 'react'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as Equal } from '../../assets/icons/ic-variable-equal.svg'
import {
    ConditionType,
    FormErrorObjectType,
    FormType,
    PluginVariableType,
    RefVariableType,
    StepType,
    TaskErrorObj,
    TaskFieldDescription,
    VariableFieldType,
    VariableType,
} from '../ciPipeline/types'
import CustomInputVariableSelect from './CustomInputVariableSelect'
import { ciPipelineContext } from './CIPipeline'
import { ReactComponent as AlertTriangle } from '../../assets/icons/ic-alert-triangle.svg'
import ReactSelect from 'react-select'
import { baseSelectStyles, outputFormatSelectStyle } from './ciPipeline.utils'
import Tippy from '@tippyjs/react'
import { Option } from '../v2/common/ReactSelect.utils'
import { OptionType } from '../app/types'
import { ValidationRules } from '../ciPipeline/validationRules'
import { ReactComponent as Info } from '../../assets/icons/ic-info-filled.svg'

function CustomInputOutputVariables({ type }: { type: PluginVariableType }) {
    const {
        formData,
        setFormData,
        selectedTaskIndex,
        activeStageName,
        calculateLastStepDetail,
        formDataErrorObj,
        setFormDataErrorObj,
        validateTask,
    }: {
        formData: FormType
        setFormData: React.Dispatch<React.SetStateAction<FormType>>
        selectedTaskIndex: number
        activeStageName: string
        calculateLastStepDetail: (
            isFromAddNewTask: boolean,
            _formData: FormType,
            activeStageName: string,
            startIndex?: number,
        ) => {
            index: number
            calculatedStageVariables: Map<string, VariableType>[]
        }
        formDataErrorObj: FormErrorObjectType
        setFormDataErrorObj: React.Dispatch<React.SetStateAction<FormErrorObjectType>>
        validateTask: (taskData: StepType, taskErrorobj: TaskErrorObj) => void
    } = useContext(ciPipelineContext)
    const validationRules = new ValidationRules()

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
            ).id + 1
        const newVariable = {
            id: id,
            name: '',
            value: '',
            format: formatOptions[0].label,
            description: '',
            defaultValue: '',
            refVariableUsed: false,
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
        setFormData(_formData)
    }

    const handleInputOutputValueChange = (e, index) => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[VariableFieldType[type]][index][
            e.target.name
        ] = e.target.value
        const _formErrorObject = { ...formDataErrorObj }
        validateTask(
            _formData[activeStageName].steps[selectedTaskIndex],
            _formErrorObject[activeStageName].steps[selectedTaskIndex],
        )
        setFormDataErrorObj(_formErrorObject)
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
            let conditionDetails = _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.conditionDetails
            let isDeletedSomeCondition = false
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
                    isDeletedSomeCondition = true
                }
            }
            _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.conditionDetails = conditionDetails
            if (isDeletedSomeCondition) {
                const _formDataErrorObj = { ...formDataErrorObj }
                validateTask(
                    formData[activeStageName].steps[index || selectedTaskIndex],
                    _formDataErrorObj[activeStageName].steps[index || selectedTaskIndex],
                )
                setFormDataErrorObj(_formDataErrorObj)
            }
        }
        setFormData(_formData)
    }

    const handleFormatChange = (selectedValue: OptionType, index: number): void => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[VariableFieldType[type]][index].format =
            selectedValue.label
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
                    <div className={`tp-4 fs-13 fw-6 text-capitalize mr-8 `} style={{ position: 'relative' }}>
                        <span className="text-underline-dashed lh-32">{type} variables </span>
                        {isDateFormat && (
                            <div
                                className="bcb-1 br-4 fw-4 pl-12 pr-12 pt-8 pb-8"
                                style={{ width: '180px', marginRight: '60px', position: 'absolute' }}
                            >
                                <div className="format-grid">
                                    <Info className="mr-4 icon-dim-16" />
                                    <span className="cb-5 mb-2 lh-1-33">
                                        Standardized date formats <span className="cn-9">identified by Devtron</span>{' '}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </Tippy>

                <div className="pointer cb-5 fw-6 fs-13 flexbox content-fit lh-32" onClick={addVariable}>
                    <Add className="add-icon mt-6" />
                    Add variable
                </div>
                <div style={{ lineHeight: '4px' }}></div>
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
                                                <input
                                                    className={`w-100 en-2 bw-1 pl-10 pr-10 pt-4 pb-4 h-32 no-bottom-border ${
                                                        type === PluginVariableType.INPUT
                                                            ? 'top-radius-4'
                                                            : 'top-left-radius'
                                                    }`}
                                                    type="text"
                                                    placeholder="Variable name"
                                                    value={variable.name}
                                                    autoComplete="off"
                                                    name="name"
                                                    onChange={(e) => handleInputOutputValueChange(e, index)}
                                                    onBlur={(e) => handleBlur()}
                                                />
                                            </div>

                                            {type === PluginVariableType.OUTPUT && (
                                                <div
                                                    style={{
                                                        width: '20%',
                                                        borderTopRightRadius: '4px',
                                                    }}
                                                    className="border-right"
                                                >
                                                    <ReactSelect
                                                        value={
                                                            variable.format
                                                                ? { label: variable.format, value: variable.format }
                                                                : formatOptions[0]
                                                        }
                                                        tabIndex={1}
                                                        onChange={(selectedValue) => {
                                                            handleFormatChange(selectedValue, index)
                                                        }}
                                                        options={formatOptions}
                                                        isSearchable={false}
                                                        components={{
                                                            IndicatorSeparator: null,
                                                            Option,
                                                        }}
                                                        styles={outputFormatSelectStyle}
                                                        menuPlacement="auto"
                                                    />
                                                </div>
                                            )}
                                        </div>{' '}
                                    </div>
                                    {type === PluginVariableType.INPUT && (
                                        <div className="flexbox">
                                            <div className="border-left" style={{ width: '80%' }}>
                                                <CustomInputVariableSelect selectedVariableIndex={index} />
                                            </div>
                                            <div
                                                style={{
                                                    width: '20%',
                                                }}
                                            >
                                                <ReactSelect
                                                    value={
                                                        variable.format
                                                            ? { label: variable.format, value: variable.format }
                                                            : formatOptions[0]
                                                    }
                                                    tabIndex={2}
                                                    onChange={(selectedValue) => {
                                                        handleFormatChange(selectedValue, index)
                                                    }}
                                                    options={formatOptions}
                                                    isSearchable={false}
                                                    components={{
                                                        IndicatorSeparator: null,
                                                        Option,
                                                    }}
                                                    name="format"
                                                    styles={baseSelectStyles}
                                                    isDisabled={
                                                        variable.format &&
                                                        (variable.variableType === RefVariableType.GLOBAL ||
                                                            variable.variableType ===
                                                                RefVariableType.FROM_PREVIOUS_STEP)
                                                    }
                                                    menuPlacement="auto"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <input
                                        style={{ width: '80% !important' }}
                                        className={`w-100 en-2 bw-1 pl-10 pr-10 pt-6 pb-6 bottom-radius-4 h-32 ${
                                            type === PluginVariableType.INPUT ? 'no-top-border' : ''
                                        }`}
                                        autoComplete="off"
                                        placeholder="Description"
                                        type="text"
                                        value={variable.description}
                                        name="description"
                                        onChange={(e) => handleInputOutputValueChange(e, index)}
                                        onBlur={(e) => handleBlur()}
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
