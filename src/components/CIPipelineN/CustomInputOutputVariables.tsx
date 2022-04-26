import React, { useContext, useState } from 'react'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as Equal } from '../../assets/icons/ic-variable-equal.svg'
import {
    FormType,
    PluginVariableType,
    RefVariableType,
    TaskFieldDescription,
    VariableFieldType,
} from '../ciPipeline/types'
import CustomInputVariableSelect from './CustomInputVariableSelect'
import { ciPipelineContext } from './CIPipeline'
import { ReactComponent as AlertTriangle } from '../../assets/icons/ic-alert-triangle.svg'
import ReactSelect from 'react-select'
import { tempMultiSelectStyles } from './ciPipeline.utils'
import Tippy from '@tippyjs/react'

function CustomInputOutputVariables({ type }: { type: PluginVariableType }) {
    const {
        formData,
        setFormData,
        selectedTaskIndex,
        activeStageName,
        calculateLastStepDetail,
        formDataErrorObj,
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
        }
        formDataErrorObj: object
    } = useContext(ciPipelineContext)
    const formatOptions: { label: string; value: string }[] = ['string', 'boolean', 'number', 'date'].map((format) => ({
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
        const newCondition = {
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
        setFormData(_formData)
    }

    const handleFormatChange = (selectedValue: { label: string; value: string }, index: number): void => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[VariableFieldType[type]][index].format =
            selectedValue.label
        setFormData(_formData)
    }

    return (
        <>
            <div className="row-container mb-8">
                <Tippy
                    className="default-tt"
                    arrow={false}
                    content={
                       <span style={{display: 'block', width: '220px'}}>{type === PluginVariableType.INPUT ? TaskFieldDescription.INPUT : TaskFieldDescription.OUTPUT}</span> 
                    }
                >
                    <label
                        className={`tp-4 fs-13 fw-6 text-capitalize mr-8 ${
                            type === PluginVariableType.INPUT ? 'text-underline-dashed' : ''
                        }`}
                    >
                        {type} variables{' '}
                    </label>
                </Tippy>

                <div className="pointer cb-5 fw-6 fs-13 flexbox content-fit" onClick={addVariable}>
                    <Add className="add-icon" />
                    Add variable
                </div>
            </div>
            {formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[VariableFieldType[type]]?.map(
                (variable, index) => (
                    <div key={`custom-input-variable${index}`}>
                        <div className="pl-200 mb-20 flexbox justify-space">
                            <div className="custom-variable-container w-100">
                                <Equal className="icon-dim-40 variable-equal-icon" />

                                <div className="tp-4 fs-13 fw-4">
                                    <div className="flexbox">
                                        <div style={{ width: type === PluginVariableType.OUTPUT ? '80%' : '100%' }}>
                                            <input
                                                className="w-100 bcn-1 en-2 bw-1 pl-10 pr-10 pt-4 pb-4 top-radius"
                                                type="text"
                                                placeholder="Variables name"
                                                value={variable.name}
                                                autoComplete="off"
                                                name="name"
                                                onChange={(e) => handleInputOutputValueChange(e, index)}
                                                onBlur={(e) => handleBlur()}
                                            />
                                        </div>

                                        {type === PluginVariableType.OUTPUT && (
                                            <div style={{ width: '20%' }}>
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
                                                    }}
                                                    styles={tempMultiSelectStyles}
                                                />
                                            </div>
                                        )}
                                    </div>{' '}
                                </div>
                                {type === PluginVariableType.INPUT && (
                                    <div className="flexbox">
                                        <div style={{ width: '80%' }}>
                                            <CustomInputVariableSelect selectedVariableIndex={index} />
                                        </div>
                                        <div className="bcn-1 " style={{ width: '20%' }}>
                                            {variable.format && variable.variableType === RefVariableType.GLOBAL ? (
                                                <span className="fs-13 fw-4 p-5 flex left">{variable.format}</span>
                                            ) : (
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
                                                    }}
                                                    name="format"
                                                    styles={tempMultiSelectStyles}
                                                />
                                            )}
                                        </div>
                                    </div>
                                )}
                                <input
                                    style={{ width: '80% !important' }}
                                    className="w-100 bcn-1 en-2 bw-1 pl-10 pr-10 pt-6 pb-6 bottom-radius"
                                    autoComplete="off"
                                    placeholder="Description"
                                    type="text"
                                    value={variable.description}
                                    name="description"
                                    onChange={(e) => handleInputOutputValueChange(e, index)}
                                />
                            </div>

                            <Close
                                className="icon-dim-24 pointer mt-6 ml-6"
                                onClick={() => {
                                    deleteInputOutputValue(index)
                                }}
                            />
                        </div>
                        <div className="pl-200 mb-20">
                            {formDataErrorObj[activeStageName].steps[selectedTaskIndex]?.inlineStepDetail[
                                VariableFieldType[type]
                            ][index] &&
                                !formDataErrorObj[activeStageName].steps[selectedTaskIndex]?.inlineStepDetail[
                                    VariableFieldType[type]
                                ][index].isValid && (
                                    <span className="flexbox cr-5 mb-4 mt-4 fw-5 fs-11 flexbox">
                                        <AlertTriangle className="icon-dim-14 mr-5 ml-5 mt-2" />
                                        <span>
                                            {
                                                formDataErrorObj[activeStageName].steps[selectedTaskIndex]
                                                    ?.inlineStepDetail[VariableFieldType[type]][index].message
                                            }
                                        </span>
                                    </span>
                                )}
                        </div>
                    </div>
                ),
            )}
        </>
    )
}

export default CustomInputOutputVariables
