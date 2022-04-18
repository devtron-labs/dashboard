import React, { useContext, useState } from 'react'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as Equal } from '../../assets/icons/ic-variable-equal.svg'
import { FormType, PluginVariableType, RefVariableType, VariableFieldType } from '../ciPipeline/types'
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
    const [selectedFormat, setSelectedFormat] = useState<{ label: string; value: string }>(formatOptions[0])
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
            format: '',
            description: '',
            defaultValue: '',
            refVariableUsed: false,
            refVariableType: RefVariableType.NEW,
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
        setSelectedFormat(selectedValue)
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[VariableFieldType[type]][index].format =
            selectedValue.label
        setFormData(_formData)
    }

    return (
        <>
            <div className="row-container mb-8">
                <Tippy className="default-tt" arrow={false} content={type === PluginVariableType.INPUT ? 'These variables are available as environment variables and can be used in the script to inject values from previous tasks or other sources. ' : 'These variables should be set in the environment variables and can be used as input variables in other scripts.'}>
                    <label className="tp-4 fs-13 fw-6 text-capitalize mr-8">{type} variables </label>
                </Tippy>

                <div className="pointer cb-5 fw-6 fs-13 flexbox content-fit" onClick={addVariable}>
                    <Add className="add-icon" />
                    Add variables
                </div>
            </div>
            {formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[VariableFieldType[type]]?.map(
                (variable, index) => (
                    <>
                        <div className="pl-200 mb-20 flexbox justify-space">
                            <div className="custom-variable-container w-100">
                                <Equal className="icon-dim-40 variable-equal-icon" />

                                <div className="tp-4 fs-13 fw-4 text-uppercase">
                                    <div className="flexbox">
                                        <div style={{ width: type === PluginVariableType.OUTPUT ? '80%' : '100%' }}>
                                            <input
                                                className="w-100 bcn-1 en-2 bw-1 pl-10 pr-10 pt-6 pb-6 top-radius"
                                                type="text"
                                                placeholder="Variables name"
                                                value={variable.name}
                                                name="name"
                                                onChange={(e) => handleInputOutputValueChange(e, index)}
                                                onBlur={(e) => handleBlur()}
                                            />
                                        </div>

                                        {type === PluginVariableType.OUTPUT && (
                                            <div style={{ width: '20%' }}>
                                                <ReactSelect
                                                    defaultValue={selectedFormat}
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
                                        <div style={{ width: '20%' }}>
                                            {variable.refVariableUsed ? (
                                                <label className="fs-13 fw-4 p-5 bcn-1 w-100">{variable.format}</label>
                                            ) : (
                                                <ReactSelect
                                                    defaultValue={selectedFormat}
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
                    </>
                ),
            )}
        </>
    )
}

export default CustomInputOutputVariables
