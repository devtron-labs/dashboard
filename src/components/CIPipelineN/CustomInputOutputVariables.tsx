import React from 'react'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { tempMultiSelectStyles } from './ciPipeline.utils'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import ReactSelect from 'react-select'
import { PluginVariableType, FormType, RefVariableType } from '../ciPipeline/types'

function CustomInputOutputVariables({
    type,
    selectedTaskIndex,
    formData,
    setFormData,
}: {
    type: PluginVariableType
    selectedTaskIndex: number
    formData: FormType
    setFormData: React.Dispatch<React.SetStateAction<FormType>>
}) {
    const addVariable = (): void => {
        const _formData = { ...formData }
        const id =
            _formData.preBuildStage.steps[selectedTaskIndex].inlineStepDetail.inputVariables?.reduce(
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
        _formData.preBuildStage.steps[selectedTaskIndex].inlineStepDetail.inputVariables.push(newCondition)
        setFormData(_formData)
    }

    const handleInputOutputValueChange = (e, index) => {
        const _formData = { ...formData }
        _formData.preBuildStage.steps[selectedTaskIndex].inlineStepDetail.inputVariables[index]['name'] = e.target.value
        setFormData(_formData)
    }

    const deleteInputOutputValue = (index: number): void => {
        const _formData = { ...formData }
        _formData.preBuildStage.steps[selectedTaskIndex].inlineStepDetail.inputVariables.splice(index, 1)
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
            {formData.preBuildStage.steps[selectedTaskIndex].inlineStepDetail[
                type === PluginVariableType.OUTPUT ? 'outputVariables' : 'inputVariables'
            ]?.map((variable, index) => (
                <div className="pl-200">
                    <div className="custom-variable-container">
                        <div className="tp-4 fs-13 fw-4 text-uppercase">
                            <input
                                className="w-100 bcn-1 br-4 en-2 bw-1 pl-10 pr-10 pt-6 pb-6"
                                type="text"
                                placeholder="Variables name"
                                onChange={(e) => handleInputOutputValueChange(e, index)}
                            />
                        </div>
                        <div className="tp-4 en-2 bw-1 fs-13 fw-4 text-uppercase flex">=</div>
                        <ReactSelect
                            autoFocus
                            tabIndex={1}
                            placeholder="Select source or input value"
                            onChange={(selectedValue) => {
                                // handleConditionOnVariableChange(selectedValue, index)
                            }}
                            isSearchable={false}
                            styles={tempMultiSelectStyles}
                        />
                        <Close
                            className="icon-dim-24 pointer"
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
                    />
                </div>
            ))}
        </>
    )
}

export default CustomInputOutputVariables
