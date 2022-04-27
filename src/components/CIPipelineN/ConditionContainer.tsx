import React, { useState, useEffect, useContext } from 'react'
import dropdown from '../../assets/icons/ic-chevron-down.svg'
import { ConditionContainerType, ConditionType, FormType, PluginType } from '../ciPipeline/types'
import { RadioGroup, RadioGroupItem } from '../common/formFields/RadioGroup'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import ReactSelect, { components } from 'react-select'
import { ciPipelineContext } from './CIPipeline'
import { getCustomOptionSelectionStyle } from '../v2/common/ReactSelect.utils'

export function ConditionContainer({ type }: { type: ConditionContainerType }) {
    const {
        formData,
        setFormData,
        selectedTaskIndex,
        activeStageName,
    }: {
        formData: FormType
        setFormData: React.Dispatch<React.SetStateAction<FormType>>
        selectedTaskIndex: number
        activeStageName: string
    } = useContext(ciPipelineContext)
    const operatorOptions: { label: string; value: string }[] = [
        { value: '==', description: 'equal to' },
        { value: '!=', description: 'not equal to' },
        { value: '<', description: 'less than' },
        { value: '>', description: 'greater than' },
        { value: '<=', description: 'less than or equal to' },
        { value: '>=', description: 'greater than or equal to' },
    ].map((operator) => ({ label: operator.value, value: operator.value, description: operator.description }))
    const [collapsedSection, setCollapsedSection] = useState<boolean>(true)
    const [selectedOperator, setSelectedOperator] = useState<{ label: string; value: string }>(operatorOptions[0])
    const [conditionType, setConditionType] = useState<ConditionType>(
        type === ConditionContainerType.PASS_FAILURE ? ConditionType.SUCCESS : ConditionType.TRIGGER,
    )

    const currentStepTypeVariable =
        formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.INLINE
            ? 'inlineStepDetail'
            : 'pluginRefStepDetail'

    useEffect(() => {
        setCollapsedSection(true)
    }, [activeStageName])

    const addCondition = (): void => {
        const _formData = { ...formData }
        let id = 0
        let conditionTypeToRemove
        if (type === ConditionContainerType.PASS_FAILURE) {
            conditionTypeToRemove = conditionType === ConditionType.SUCCESS ? ConditionType.FAIL : ConditionType.SUCCESS
        } else {
            conditionTypeToRemove = conditionType === ConditionType.TRIGGER ? ConditionType.SKIP : ConditionType.TRIGGER
        }
        if (!_formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].conditionDetails) {
            _formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].conditionDetails = []
        }
        for (
            var i = 0;
            i < _formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].conditionDetails.length;
            i++
        ) {
            if (
                _formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].conditionDetails[i]
                    .conditionType === conditionTypeToRemove
            ) {
                _formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].conditionDetails.splice(
                    i,
                    1,
                )
                i--
            } else {
                id =
                    id <
                    _formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].conditionDetails[i].id
                        ? _formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].conditionDetails[
                              i
                          ].id
                        : id
            }
        }
        const newCondition = {
            id: id,
            conditionOnVariable: '',
            conditionOperator: operatorOptions[0].label,
            conditionType: conditionType,
            conditionalValue: '',
        }
        _formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].conditionDetails.push(newCondition)
        setFormData(_formData)
    }

    const deleteCondition = (index: number): void => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].conditionDetails.splice(index, 1)
        setFormData(_formData)
    }

    const handleConditionalValueChange = (e: any, index: number): void => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].conditionDetails[index][
            'conditionalValue'
        ] = e.target.value
        setFormData(_formData)
    }

    const handleConditionOnVariableChange = (selectedValue: { label: string; value: number }, index: number): void => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].conditionDetails[index][
            'conditionOnVariable'
        ] = selectedValue.label
        setFormData(_formData)
    }

    const handleConditionOperatorChange = (selectedValue: { label: string; value: string }, index: number): void => {
        setSelectedOperator(selectedValue)
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].conditionDetails[index][
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
            height: '32px'
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
        valueContainer: (base, state) => ({
            ...base,
            display: 'flex',
        }),
    }

    function formatOptionLabel(option) {
        return (
            <div className="flexbox justify-space">
                <span className="cn-9">{option.label}</span>
                <span className="cn-5">{option.description}</span>
            </div>
        )
    }

    const ValueContainer = (props) => {
        let value = props.getValue()[0]?.label
        return (
            <components.ValueContainer {...props}>
                <>
                    {!props.selectProps.menuIsOpen && `${value}`}
                    {React.cloneElement(props.children[1])}
                </>
            </components.ValueContainer>
        )
    }

    function Option(_props) {
        const { selectProps, selectOption, data } = _props
        selectProps.styles.option = getCustomOptionSelectionStyle({ direction: 'none' })
        return (
            <div className="flex left">
                <components.Option {..._props}>{_props.children}</components.Option>
            </div>
        )
    }

    return (
        <div>
            <div
                className="mb-10 flexbox pointer"
                onClick={(event) => {
                    setCollapsedSection(!collapsedSection)
                }}
            >
                <span className="fw-6 fs-13 cn-9 lh-32">{type} Condition</span>
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
                        name={`${type}-Condition${activeStageName}`}
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
                            formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable]
                                ?.conditionDetails || []
                        ).map((conditionDetail, index) =>
                            conditionDetail.conditionType === conditionType ? (
                                <>
                                    <div className="tp-4 fs-13 lh-32 fw-4 text-uppercase mr-10">
                                        {conditionDetail.conditionType} If
                                    </div>
                                    <div className="tp-4 fs-13 lh-32 fw-4 text-uppercase mr-10">
                                        <ReactSelect
                                            autoFocus
                                            value={
                                                conditionDetail.conditionOnVariable
                                                    ? {
                                                          label: conditionDetail.conditionOnVariable,
                                                          value: conditionDetail.conditionOnVariable,
                                                      }
                                                    : null
                                            }
                                            tabIndex={1}
                                            placeholder="Select variable"
                                            onChange={(selectedValue) => {
                                                handleConditionOnVariableChange(selectedValue, index)
                                            }}
                                            options={formData[activeStageName].steps[selectedTaskIndex][
                                                currentStepTypeVariable
                                            ][
                                                type === ConditionContainerType.PASS_FAILURE
                                                    ? 'outputVariables'
                                                    : 'inputVariables'
                                            ]?.map((variable) => ({ label: variable.name, value: variable.id }))}
                                            isSearchable={false}
                                            styles={tempMultiSelectStyles}
                                            components={{
                                                IndicatorSeparator: null,
                                                Option,
                                                ValueContainer,
                                            }}
                                        />
                                    </div>
                                    <div className=" lh-32 fw-4 mr-10">
                                        <ReactSelect
                                            defaultValue={
                                                conditionDetail.conditionOperator
                                                    ? {
                                                          label: conditionDetail.conditionOperator,
                                                          value: conditionDetail.conditionOperator,
                                                      }
                                                    : selectedOperator
                                            }
                                            tabIndex={1}
                                            onChange={(selectedValue) => {
                                                handleConditionOperatorChange(selectedValue, index)
                                            }}
                                            options={operatorOptions}
                                            isSearchable={false}
                                            styles={{
                                                ...tempMultiSelectStyles,
                                                menu: (base, state) => ({
                                                    ...base,
                                                    width: '250px',
                                                }),
                                            }}
                                            formatOptionLabel={formatOptionLabel}
                                            components={{
                                                IndicatorSeparator: null,
                                                Option,
                                                ValueContainer,
                                            }}
                                        />
                                    </div>
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
                    <div className="pointer cb-5 fw-6 fs-13 flexbox content-fit lh-32" onClick={addCondition}>
                        <Add className="add-icon mt-6" />
                        Add condition
                    </div>
                </>
            )}
        </div>
    )
}
