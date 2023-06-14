import React, { useState, useEffect, useContext } from 'react'
import { pluginSelectStyle, baseSelectStyles } from './ciPipeline.utils'
import {
    RefVariableType,
    PluginType,
    FormType,
    VariableType,
    RefVariableStageType,
    StepType,
    FormErrorObjectType,
    TaskErrorObj,
} from '@devtron-labs/devtron-fe-common-lib'
import { ciPipelineContext } from './CIPipeline'
import CreatableSelect from 'react-select/creatable'
import { components } from 'react-select'
import { BuildStageVariable } from '../../config'
import { getCustomOptionSelectionStyle } from '../v2/common/ReactSelect.utils'
import Tippy from '@tippyjs/react'
import { OptionType } from '../app/types'

function CustomInputVariableSelect({ selectedVariableIndex }: { selectedVariableIndex: number }) {
    const {
        formData,
        setFormData,
        selectedTaskIndex,
        activeStageName,
        inputVariablesListFromPrevStep,
        globalVariables,
        formDataErrorObj,
        setFormDataErrorObj,
        validateTask,
    }: {
        formData: FormType
        setFormData: React.Dispatch<React.SetStateAction<FormType>>
        selectedTaskIndex: number
        activeStageName: string
        inputVariablesListFromPrevStep: {
            preBuildStage: Map<string, VariableType>[]
            postBuildStage: Map<string, VariableType>[]
        }
        globalVariables: { label: string; value: string; format: string }[]
        formDataErrorObj: FormErrorObjectType
        setFormDataErrorObj: React.Dispatch<React.SetStateAction<FormErrorObjectType>>
        validateTask: (taskData: StepType, taskErrorobj: TaskErrorObj) => void
    } = useContext(ciPipelineContext)
    const [selectedOutputVariable, setSelectedOutputVariable] = useState<OptionType>({
        label: '',
        value: '',
    })

    const [inputVariableOptions, setInputVariableOptions] = useState<
        {
            label: string
            options: any[]
        }[]
    >([])

    useEffect(() => {
        const previousStepVariables = []
        if (inputVariablesListFromPrevStep[activeStageName].length > 0) {
            inputVariablesListFromPrevStep[activeStageName][selectedTaskIndex].forEach((element) => {
                previousStepVariables.push({ ...element, label: element.name, value: element.name })
            })
        }
        if (activeStageName === BuildStageVariable.PostBuild) {
            const preBuildStageVariables = []
            const preBuildTaskLength = formData[BuildStageVariable.PreBuild]?.steps?.length
            if (preBuildTaskLength >= 1) {
                if (inputVariablesListFromPrevStep[BuildStageVariable.PreBuild].length > 0) {
                    inputVariablesListFromPrevStep[BuildStageVariable.PreBuild][preBuildTaskLength - 1].forEach(
                        (element) => {
                            preBuildStageVariables.push({ ...element, label: element.name, value: element.name })
                        },
                    )
                }

                const stepTypeVariable =
                    formData[BuildStageVariable.PreBuild].steps[preBuildTaskLength - 1].stepType === PluginType.INLINE
                        ? 'inlineStepDetail'
                        : 'pluginRefStepDetail'
                const preBuildStageLastTaskOutputVariables =
                    formData[BuildStageVariable.PreBuild].steps[preBuildTaskLength - 1][stepTypeVariable]
                        ?.outputVariables
                const outputVariablesLength = preBuildStageLastTaskOutputVariables?.length || 0
                for (let j = 0; j < outputVariablesLength; j++) {
                    if (preBuildStageLastTaskOutputVariables[j].name) {
                        const currentVariableDetails = preBuildStageLastTaskOutputVariables[j]
                        preBuildStageVariables.push({
                            ...currentVariableDetails,
                            label: currentVariableDetails.name,
                            value: currentVariableDetails.name,
                            refVariableStepIndex: preBuildTaskLength,
                            refVariableStage: RefVariableStageType.PRE_CI,
                        })
                    }
                }
            }
            setInputVariableOptions([
                {
                    label: 'From Pre-build Stage',
                    options: preBuildStageVariables,
                },
                {
                    label: 'From Post-build Stage',
                    options: previousStepVariables,
                },
                {
                    label: 'System variables',
                    options: globalVariables,
                },
            ])
        } else {
            setInputVariableOptions([
                {
                    label: 'From Previous Steps',
                    options: previousStepVariables,
                },
                {
                    label: 'System variables',
                    options: globalVariables,
                },
            ])
        }
        setSelectedVariableValue()
    }, [inputVariablesListFromPrevStep, selectedTaskIndex, activeStageName])

    const handleOutputVariableSelector = (selectedValue: OptionType) => {
        setSelectedOutputVariable(selectedValue)
        const currentStepTypeVariable =
            formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.INLINE
                ? 'inlineStepDetail'
                : 'pluginRefStepDetail'
        const _formData = { ...formData }
        let _variableDetail
        if (selectedValue['refVariableStepIndex']) {
            _variableDetail = {
                value: '',
                variableType: RefVariableType.FROM_PREVIOUS_STEP,
                refVariableStepIndex: selectedValue['refVariableStepIndex'],
                refVariableName: selectedValue.label,
                format: selectedValue['format'],
                refVariableStage: selectedValue['refVariableStage'],
            }
        } else if (selectedValue['variableType'] === RefVariableType.GLOBAL) {
            _variableDetail = {
                variableType: RefVariableType.GLOBAL,
                refVariableStepIndex: 0,
                refVariableName: selectedValue.label,
                format: selectedValue['format'],
                value: '',
                refVariableStage: '',
            }
        } else {
            _variableDetail = {
                variableType: RefVariableType.NEW,
                value: selectedValue.label,
                refVariableName: '',
                refVariableStage: '',
            }
        }
        let _inputVariables =
            _formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].inputVariables[
                selectedVariableIndex
            ]
        if (formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.PLUGIN_REF) {
            _variableDetail.format = _inputVariables.format
        }
        _inputVariables = {
            ..._inputVariables,
            ..._variableDetail,
        }
        _formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].inputVariables[
            selectedVariableIndex
        ] = _inputVariables
        const _formErrorObject = { ...formDataErrorObj }
        validateTask(
            _formData[activeStageName].steps[selectedTaskIndex],
            _formErrorObject[activeStageName].steps[selectedTaskIndex],
        )
        setFormDataErrorObj(_formErrorObject)
        setFormData(_formData)
    }

    const setSelectedVariableValue = () => {
        const selectedVariable =
            formData[activeStageName].steps[selectedTaskIndex][
                formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.INLINE
                    ? 'inlineStepDetail'
                    : 'pluginRefStepDetail'
            ].inputVariables[selectedVariableIndex]
        const selectedValueLabel =
            (selectedVariable.variableType === RefVariableType.NEW
                ? selectedVariable.value
                : selectedVariable.refVariableName) || ''
        setSelectedOutputVariable({ ...selectedVariable, label: selectedValueLabel, value: selectedValueLabel })
    }

    function formatOptionLabel(option) {
        if (option.refVariableStepIndex) {
            return (
                <div className="flexbox justify-space">
                    <span className="cn-9 fw-4">{option.label}</span>
                    <span className="cn-5 fw-4">
                        {option.refVariableStage === 'PRE_CI'
                            ? formData[BuildStageVariable.PreBuild].steps[option.refVariableStepIndex - 1]?.name
                            : formData[activeStageName].steps[option.refVariableStepIndex - 1]?.name}
                    </span>
                </div>
            )
        } else {
            return (
                <div className="">
                    <span className="cn-9 fw-4">{option.label}</span>
                </div>
            )
        }
    }

    const ValueContainer = (props) => {
        let value = props.getValue()[0]?.label
        return (
            <components.ValueContainer {...props}>
                <>
                    {!props.selectProps.menuIsOpen &&
                        (value ? `${value}` : <span className="cn-5">Select source or input value</span>)}
                    {React.cloneElement(props.children[1])}
                </>
            </components.ValueContainer>
        )
    }

    function Option(_props) {
        const { selectProps, data } = _props
        selectProps.styles.option = getCustomOptionSelectionStyle({ padding: '4px 10px' })
        if (data.description) {
            return (
                <Tippy
                    className="default-tt"
                    arrow={false}
                    placement="left"
                    content={<span style={{ display: 'block', width: '180px' }}>{data.description}</span>}
                >
                    <div className="flex left">
                        <components.Option {..._props}>{_props.children}</components.Option>
                    </div>
                </Tippy>
            )
        } else {
            return (
                <div className="flex left">
                    <components.Option {..._props}>{_props.children}</components.Option>
                </div>
            )
        }
    }

    function handleCreatableBlur(e) {
        if (e.target.value) {
            handleOutputVariableSelector({
                label: e.target.value,
                value: e.target.value,
            })
        }
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === 'Tab') {
            event.target.blur()
        }
    }

    return (
        <CreatableSelect
            tabIndex={1}
            value={selectedOutputVariable}
            options={inputVariableOptions}
            placeholder="Select source or input value"
            onChange={handleOutputVariableSelector}
            styles={
                formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.INLINE
                    ? baseSelectStyles
                    : pluginSelectStyle
            }
            formatOptionLabel={formatOptionLabel}
            classNamePrefix="select"
            components={{
                MenuList: (props) => {
                    return (
                        <components.MenuList {...props}>
                            <div className="cn-5 pl-12 pt-4 pb-4 dc__italic-font-style">
                                Type to enter a custom value. Press Enter to accept.
                            </div>
                            {props.children}
                        </components.MenuList>
                    )
                },
                Option,
                ValueContainer,
                IndicatorSeparator: null,
            }}
            noOptionsMessage={(): string => {
                return 'No matching options'
            }}
            onBlur={handleCreatableBlur}
            isValidNewOption={() => false}
            onKeyDown={handleKeyDown}
            menuPlacement="auto"
        />
    )
}

export default CustomInputVariableSelect
