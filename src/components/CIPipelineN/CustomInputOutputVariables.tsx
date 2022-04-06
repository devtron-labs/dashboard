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
            _formData.preBuildStage.steps[selectedTaskIndex].pluginRefStepDetail.inputVariables?.reduce(
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
        // _formData.preBuildStage.steps[selectedTaskIndex].pluginRefStepDetail.inputVariables.push(newCondition)
        setFormData(_formData)
    }

    const deleteCondition = (index: number): void => {
        const _formData = { ...formData }
        _formData.preBuildStage.steps[selectedTaskIndex].pluginRefStepDetail.conditionDetails.splice(index, 1)
        setFormData(_formData)
    }
    return (
        <>
            <div className="custom-variable-container">
                <label className="tp-4 fs-13 fw-6 text-uppercase mr-10">{type} variables</label>
                <label className="tp-4 fs-13 fw-4 text-uppercase">
                    <input
                        className="w-100"
                        type="text"
                        onChange={(e) => {
                            // handleConditionalValueChange(e, index)
                        }}
                    />
                </label>
                <label className="tp-4 en-2 bw-1 fs-13 fw-4 text-uppercase flex">
                   =
                </label>
                <div className="fs-13">
                    <ReactSelect
                        autoFocus
                        tabIndex={1}
                        placeholder="Select variable"
                        onChange={(selectedValue) => {
                            // handleConditionOnVariableChange(selectedValue, index)
                        }}
                        isSearchable={false}
                        styles={tempMultiSelectStyles}
                    />
                </div>
                <Close
                    className="icon-dim-24 pointer"
                    onClick={() => {
                        // deleteCondition(index)
                    }}
                />

                {/* </>
                    ))} */}
            </div>
            <div className="pointer cb-5 fw-6 fs-13 flexbox content-fit" onClick={addVariable}>
                <Add className="add-icon" />
                Add condition
            </div>
        </>
    )
}

export default CustomInputOutputVariables
