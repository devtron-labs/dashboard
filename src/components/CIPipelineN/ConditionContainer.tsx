import React, { useState, useEffect } from 'react'
import dropdown from '../../assets/icons/ic-chevron-down.svg'
import { ConditionContainerType, ConditionType, FormType } from '../ciPipeline/types'
import { RadioGroup, RadioGroupItem } from '../common/formFields/RadioGroup'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import ReactSelect from 'react-select'

export function ConditionContainer({
    type,
    selectedTaskIndex,
    formData,
    setFormData,
}: {
    type: ConditionContainerType
    selectedTaskIndex: number
    formData: FormType
    setFormData: React.Dispatch<React.SetStateAction<FormType>>
}) {
    const operatorOptions: { label: string; value: string }[] = ['=', '<=', '>=', '!=', '<', '>', '!'].map(
        (operator) => ({ label: operator, value: operator }),
    )
    const [collapsedSection, setCollapsedSection] = useState<boolean>(true)
    const [selectedOperator, setSelectedOperator] = useState<{ label: string; value: string }>(operatorOptions[0])
    const [selectedVariable, setSelectedVariable] = useState<{ label: string; value: number }>()
    const [conditionType, setConditionType] = useState<ConditionType>(
        type === ConditionContainerType.PASS_FAILURE ? ConditionType.SUCCESS : ConditionType.TRIGGER,
    )

    const addCondition = (): void => {
        const _formData = { ...formData }
        const id =
            _formData.preBuildStage.steps[selectedTaskIndex].pluginRefStepDetail.conditionDetails?.reduce(
                (prev, current) => (prev.id > current.id ? prev : current),
                {
                    id: 0,
                },
            ).id + 1
        const newCondition = {
            id: id,
            conditionOnVariable: '',
            conditionOperator: '',
            conditionType: conditionType,
            conditionalValue: '',
        }
        _formData.preBuildStage.steps[selectedTaskIndex].pluginRefStepDetail.conditionDetails.push(newCondition)
        setFormData(_formData)
    }

    const deleteCondition = (index: number): void => {
        const _formData = { ...formData }
        _formData.preBuildStage.steps[selectedTaskIndex].pluginRefStepDetail.conditionDetails.splice(index, 1)
        setFormData(_formData)
    }

    const handleConditionalValueChange = (e: any, index: number): void => {
        const _formData = { ...formData }
        _formData.preBuildStage.steps[selectedTaskIndex].pluginRefStepDetail.conditionDetails[index][
            'conditionalValue'
        ] = e.target.value
        setFormData(_formData)
    }

    const handleConditionOnVariableChange = (selectedValue: { label: string; value: number }, index: number): void => {
        setSelectedVariable(selectedValue)
        const _formData = { ...formData }
        _formData.preBuildStage.steps[selectedTaskIndex].pluginRefStepDetail.conditionDetails[index][
            'conditionOnVariable'
        ] = selectedValue.label
        setFormData(_formData)
    }

    const handleConditionOperatorChange = (selectedValue: { label: string; value: string }, index: number): void => {
        setSelectedOperator(selectedValue)
        const _formData = { ...formData }
        _formData.preBuildStage.steps[selectedTaskIndex].pluginRefStepDetail.conditionDetails[index][
            'conditionOperator'
        ] = selectedValue.label
        setFormData(_formData)
    }

    const tempMultiSelectStyles = {
        control: (base, state) => ({
            ...base,
            boxShadow: 'none',
            minHeight: 'auto',
            border: 'none',
            width: 'max-content',
        }),
        singleValue: (base, state) => ({
            ...base,
            fontWeight: '500',
        }),
        placeholder: (base, state) => ({
            ...base,
            fontWeight: '500',
        }),
        option: (base, state) => {
            return {
                ...base,
                fontWeight: '500',
                color: 'var(--N900)',
                fontSize: '12px',
                padding: '5px 10px',
            }
        },
        dropdownIndicator: (styles) => ({ ...styles, padding: 0 }),
    }

    return (
        <div>
            <div
                className="mb-10 flexbox pointer"
                onClick={(event) => {
                    setCollapsedSection(!collapsedSection)
                }}
            >
                <span className="fw-6 fs-13 cn-9">{type} Condition</span>
                <img
                    className="icon-dim-32 ml-auto"
                    src={dropdown}
                    alt="dropDown"
                    style={{ transform: collapsedSection ? 'rotate(0)' : 'rotate(180deg)' }}
                />
            </div>
            {!collapsedSection && (
                <>
                    <RadioGroup
                        className="no-border mb-10"
                        value={conditionType}
                        name={`${type}-Condition`}
                        onChange={(event) => {
                            setConditionType(event.target.value)
                        }}
                    >
                        <RadioGroupItem
                            value={
                                type === ConditionContainerType.PASS_FAILURE
                                    ? ConditionType.SUCCESS
                                    : ConditionType.TRIGGER
                            }
                        >
                            Set {type === ConditionContainerType.PASS_FAILURE ? 'pass' : 'trigger'} conditions
                        </RadioGroupItem>
                        <RadioGroupItem
                            value={
                                type === ConditionContainerType.PASS_FAILURE ? ConditionType.FAIL : ConditionType.SKIP
                            }
                        >
                            Set {type === ConditionContainerType.PASS_FAILURE ? 'failure' : 'skip'} conditions
                        </RadioGroupItem>
                    </RadioGroup>
                    <div className="condition-container">
                        {(
                            formData.preBuildStage.steps[selectedTaskIndex].pluginRefStepDetail?.conditionDetails || []
                        ).map((conditionDetail, index) =>
                            conditionDetail.conditionType === conditionType ? (
                                <>
                                    <label className="tp-4 fs-13 fw-4 text-uppercase mr-10">
                                        {conditionDetail.conditionType} If
                                    </label>
                                    <label className="tp-4 fs-13 fw-4 text-uppercase mr-10">
                                        <ReactSelect
                                            autoFocus
                                            defaultValue={selectedVariable}
                                            tabIndex={1}
                                            placeholder="Select variable"
                                            onChange={(selectedValue) => {
                                                handleConditionOnVariableChange(selectedValue, index)
                                            }}
                                            options={formData.preBuildStage.steps[
                                                selectedTaskIndex
                                            ].pluginRefStepDetail[
                                                type === ConditionContainerType.PASS_FAILURE
                                                    ? 'outputVariables'
                                                    : 'inputVariables'
                                            ]?.map((variable) => ({ label: variable.name, value: variable.id }))}
                                            isSearchable={false}
                                            styles={tempMultiSelectStyles}
                                            components={{
                                                IndicatorSeparator: null,
                                            }}
                                        />
                                    </label>
                                    <label className="tp-4 fs-13 fw-4 text-uppercase mr-10">
                                        <ReactSelect
                                            defaultValue={selectedOperator}
                                            tabIndex={1}
                                            onChange={(selectedValue) => {
                                                handleConditionOperatorChange(selectedValue, index)
                                            }}
                                            options={operatorOptions}
                                            isSearchable={false}
                                            styles={tempMultiSelectStyles}
                                            components={{
                                                IndicatorSeparator: null,
                                            }}
                                        />
                                    </label>
                                    <div className="fs-13 mr-10">
                                        <input
                                            className="w-100"
                                            type="text"
                                            value={conditionDetail.conditionalValue}
                                            onChange={(e) => {
                                                handleConditionalValueChange(e, index)
                                            }}
                                        />
                                    </div>
                                    <Close
                                        className="icon-dim-24 pointer"
                                        onClick={() => {
                                            deleteCondition(index)
                                        }}
                                    />
                                </>
                            ) : null,
                        )}
                    </div>
                    <div className="pointer cb-5 fw-6 fs-13 flexbox content-fit" onClick={addCondition}>
                        <Add className="add-icon" />
                        Add condition
                    </div>
                </>
            )}
        </div>
    )
}
