import React, { useState, useEffect, useContext } from 'react'
import { ReactComponent as Dropdown } from '../../assets/icons/ic-chevron-down.svg'
import { ConditionContainerType, ConditionType, FormType, PluginType } from '../ciPipeline/types'
import { RadioGroup, RadioGroupItem } from '../common/formFields/RadioGroup'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import ReactSelect, { components } from 'react-select'
import { ciPipelineContext } from './CIPipeline'
import { getCustomOptionSelectionStyle } from '../v2/common/ReactSelect.utils'
import { selectWithDefaultBG, tempMultiSelectStyles } from './ciPipeline.utils'
import { OptionType } from '../app/types'

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
    const operatorOptions: OptionType[] = [
        { value: '==', description: 'equal to' },
        { value: '!=', description: 'not equal to' },
        { value: '<', description: 'less than' },
        { value: '>', description: 'greater than' },
        { value: '<=', description: 'less than or equal to' },
        { value: '>=', description: 'greater than or equal to' },
    ].map((operator) => ({ label: operator.value, value: operator.value, description: operator.description }))
    const [collapsedSection, setCollapsedSection] = useState<boolean>(true)
    const [selectedOperator, setSelectedOperator] = useState<OptionType>(operatorOptions[0])
    const [conditionType, setConditionType] = useState<ConditionType>(
        type === ConditionContainerType.PASS_FAILURE ? ConditionType.PASS : ConditionType.TRIGGER,
    )

    const currentStepTypeVariable =
        formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.INLINE
            ? 'inlineStepDetail'
            : 'pluginRefStepDetail'

    useEffect(() => {
        setCollapsedSection(true) // collapse all the conditions when user go from prebuild to post build
    }, [activeStageName])

    const addCondition = (): void => {
        const _formData = { ...formData }
        let id = 0
        let conditionTypeToRemove
        if (type === ConditionContainerType.PASS_FAILURE) {
            conditionTypeToRemove = conditionType === ConditionType.PASS ? ConditionType.FAIL : ConditionType.PASS
        } else {
            conditionTypeToRemove = conditionType === ConditionType.TRIGGER ? ConditionType.SKIP : ConditionType.TRIGGER
        }
        let conditionDetails =
            _formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].conditionDetails
        if (!conditionDetails) {
            conditionDetails = []
        }
        for (let i = 0; i < conditionDetails.length; i++) {
            if (conditionDetails[i].conditionType === conditionTypeToRemove) {
                conditionDetails.splice(i, 1)
                i--
            } else {
                id = id < conditionDetails[i].id ? conditionDetails[i].id : id
            }
        }
        const newCondition = {
            id: id,
            conditionOnVariable: '',
            conditionOperator: operatorOptions[0].label,
            conditionType: conditionType,
            conditionalValue: '',
        }
        conditionDetails.push(newCondition)
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

    const handleConditionOperatorChange = (selectedValue: OptionType, index: number): void => {
        setSelectedOperator(selectedValue)
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].conditionDetails[index][
            'conditionOperator'
        ] = selectedValue.label
        setFormData(_formData)
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
        const value = props.getValue()[0]?.label
        return (
            <components.ValueContainer {...props}>
                <>
                    {!props.selectProps.menuIsOpen && (value ? value : <span className="cn-5">Select variable</span>)}
                    {React.cloneElement(props.children[1])}
                </>
            </components.ValueContainer>
        )
    }

    function Option(_props) {
        const { selectProps, selectOption, data } = _props
        selectProps.styles.option = getCustomOptionSelectionStyle({ direction: 'none', padding: '4px 10px' })
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

                <Dropdown className="mt-4" style={{ transform: collapsedSection ? 'rotate(180deg)' : 'rotate(0)' }} />
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
                                    ? ConditionType.PASS
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
                                    <div className="tp-4 fs-13 fw-4 text-uppercase mr-10">
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
                                            styles={selectWithDefaultBG}
                                            components={{
                                                IndicatorSeparator: null,
                                                Option,
                                                ValueContainer,
                                            }}
                                        />
                                    </div>
                                    <div className="fw-4 mr-10">
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
                                                ...selectWithDefaultBG,
                                                menu: (base, state) => ({
                                                    ...base,
                                                    width: '200px',
                                                    marginTop: '0',
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
                                            className="w-100 bcn-1 en-2 bw-1 pl-10 pr-10 pt-6 pb-6 br-4 h-32"
                                            type="text"
                                            value={conditionDetail.conditionalValue}
                                            onChange={(e) => {
                                                handleConditionalValueChange(e, index)
                                            }}
                                        />
                                    </div>
                                    <Close
                                        className="icon-dim-24 pointer mt-4"
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
