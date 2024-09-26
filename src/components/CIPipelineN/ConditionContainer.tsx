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

import { useState, useEffect, useContext, Fragment } from 'react'
import {
    RadioGroup,
    RadioGroupItem,
    ConditionType,
    PluginType,
    CustomInput,
    PipelineFormType,
    SelectPicker,
    SelectPickerVariantType,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Dropdown } from '../../assets/icons/ic-chevron-down.svg'
import { ConditionContainerType } from '../ciPipeline/types'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { OptionType } from '../app/types'
import { ReactComponent as AlertTriangle } from '../../assets/icons/ic-alert-triangle.svg'
import { pipelineContext } from '../workflowEditor/workflowEditor'

export const ConditionContainer = ({ type }: { type: ConditionContainerType }) => {
    const {
        formData,
        setFormData,
        selectedTaskIndex,
        activeStageName,
        formDataErrorObj,
        setFormDataErrorObj,
        validateTask,
    } = useContext(pipelineContext)

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

    useEffect(() => {
        const { conditionDetails } = formDataErrorObj[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable]
        if (conditionDetails?.length) {
            const errorConditionIndexArr = []
            for (let i = 0; i < conditionDetails.length; i++) {
                if (!conditionDetails[i].isValid) {
                    errorConditionIndexArr.push(i)
                }
            }
            if (errorConditionIndexArr?.length) {
                let derivedConditionType
                for (let index = 0; index < errorConditionIndexArr.length; index++) {
                    const currentCondition =
                        formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].conditionDetails[
                            index
                        ]
                    if (
                        (type === ConditionContainerType.PASS_FAILURE &&
                            (currentCondition.conditionType === ConditionType.PASS ||
                                currentCondition.conditionType === ConditionType.FAIL)) ||
                        (type === ConditionContainerType.TRIGGER_SKIP &&
                            (currentCondition.conditionType === ConditionType.TRIGGER ||
                                currentCondition.conditionType === ConditionType.SKIP))
                    ) {
                        derivedConditionType = currentCondition.conditionType
                        break
                    }
                }
                if (derivedConditionType) {
                    setConditionType(derivedConditionType)
                    if (collapsedSection) {
                        setCollapsedSection(false) // expand conditions in case of error
                    }
                }
            }
        }
    }, [formDataErrorObj])

    const validateCurrentTask = (_formData: PipelineFormType): void => {
        const _formDataErrorObj = { ...formDataErrorObj }
        validateTask(
            _formData[activeStageName].steps[selectedTaskIndex],
            _formDataErrorObj[activeStageName].steps[selectedTaskIndex],
        )
        setFormDataErrorObj(_formDataErrorObj)
    }

    const addCondition = (): void => {
        const _formData = { ...formData }
        let id = 0
        let conditionTypeToRemove
        if (type === ConditionContainerType.PASS_FAILURE) {
            conditionTypeToRemove = conditionType === ConditionType.PASS ? ConditionType.FAIL : ConditionType.PASS
        } else {
            conditionTypeToRemove = conditionType === ConditionType.TRIGGER ? ConditionType.SKIP : ConditionType.TRIGGER
        }
        let { conditionDetails } = _formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable]
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
            id,
            conditionOnVariable: '',
            conditionOperator: operatorOptions[0].label,
            conditionType,
            conditionalValue: '',
        }
        conditionDetails.push(newCondition)
        _formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].conditionDetails = conditionDetails
        setFormData(_formData)
    }

    const deleteCondition = (index: number): void => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].conditionDetails.splice(index, 1)
        validateCurrentTask(_formData)
        setFormData(_formData)
    }

    const handleConditionalValueChange = (e: any, index: number): void => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].conditionDetails[index][
            'conditionalValue'
        ] = e.target.value
        validateCurrentTask(_formData)
        setFormData(_formData)
    }

    const handleConditionOnVariableChange = (index: number) => (selectedValue: OptionType) => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].conditionDetails[index][
            'conditionOnVariable'
        ] = selectedValue.label
        validateCurrentTask(_formData)
        setFormData(_formData)
    }

    const handleConditionOperatorChange = (index: number) => (selectedValue: OptionType): void => {
        setSelectedOperator(selectedValue)
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].conditionDetails[index][
            'conditionOperator'
        ] = selectedValue.label
        setFormData(_formData)
    }

    const handleConditionCollapse = (): void => {
        setCollapsedSection(!collapsedSection)
        if (collapsedSection) {
            const _formData = { ...formData }
            let conditionType
            let { conditionDetails } = _formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable]
            let addNewRow = false
            if (!conditionDetails) {
                conditionDetails = []
                addNewRow = true
            }
            if (type === ConditionContainerType.PASS_FAILURE) {
                const passCondition = conditionDetails.some(
                    (conditionDetail) => conditionDetail.conditionType === ConditionType.PASS,
                )
                conditionType = ConditionType.PASS
                if (!passCondition) {
                    const failCondition = conditionDetails.some(
                        (conditionDetail) => conditionDetail.conditionType === ConditionType.FAIL,
                    )
                    if (failCondition) {
                        conditionType = ConditionType.FAIL
                    } else {
                        addNewRow = true
                    }
                }
                setConditionType(conditionType)
            } else {
                const triggerCondition = conditionDetails.some(
                    (conditionDetail) => conditionDetail.conditionType === ConditionType.TRIGGER,
                )
                conditionType = ConditionType.TRIGGER
                if (!triggerCondition) {
                    const skipCondition = conditionDetails.some(
                        (conditionDetail) => conditionDetail.conditionType === ConditionType.SKIP,
                    )
                    if (skipCondition) {
                        conditionType = ConditionType.SKIP
                    } else {
                        addNewRow = true
                    }
                }
                setConditionType(conditionType)
            }
            if (addNewRow) {
                const newCondition = {
                    id: conditionDetails.length,
                    conditionOnVariable: '',
                    conditionOperator: operatorOptions[0].label,
                    conditionType,
                    conditionalValue: '',
                }
                conditionDetails.push(newCondition)
                _formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].conditionDetails =
                    conditionDetails
                setFormData(_formData)
            }
        }
    }

    return (
        <div>
            <div className="mb-10 flexbox justify-space">
                <div className="fw-6 fs-13 cn-9" onClick={handleConditionCollapse}>
                    {type} Condition
                </div>

                <Dropdown
                    className="pointer"
                    style={{ transform: collapsedSection ? 'rotate(0)' : 'rotate(180deg)' }}
                    onClick={(event) => {
                        handleConditionCollapse()
                    }}
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
                    {(
                        formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable]?.conditionDetails ||
                        []
                    ).map((conditionDetail, index) => {
                        const errorObj =
                            formDataErrorObj[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable]
                                ?.conditionDetails?.[index]
                        return conditionDetail.conditionType === conditionType ? (
                            <Fragment key={`condition__${index}`}>
                                <div className="condition-container dc__gap-8">
                                    <div className="tp-4 fs-13 lh-32 fw-4 dc__uppercase">
                                        {conditionDetail.conditionType} If
                                    </div>
                                    <div className="flex left">
                                        <SelectPicker
                                            inputId="condition-on-variable"
                                            classNamePrefix="condition-on-variable"
                                            autoFocus
                                            value={
                                                conditionDetail.conditionOnVariable
                                                    ? {
                                                          label: conditionDetail.conditionOnVariable,
                                                          value: conditionDetail.conditionOnVariable,
                                                      }
                                                    : null
                                            }
                                            placeholder="Select variable"
                                            onChange={handleConditionOnVariableChange(index)}
                                            options={formData[activeStageName].steps[selectedTaskIndex][
                                                currentStepTypeVariable
                                            ][
                                                type === ConditionContainerType.PASS_FAILURE
                                                    ? 'outputVariables'
                                                    : 'inputVariables'
                                            ]
                                                ?.filter((variable) => variable.name)
                                                .map((variable) => ({ label: variable.name, value: variable.id }))}
                                            isSearchable={false}
                                            variant={SelectPickerVariantType.BORDER_LESS}
                                        />
                                    </div>
                                    <SelectPicker
                                        inputId="condition-operator"
                                        classNamePrefix="condition-operator"
                                        value={
                                            conditionDetail.conditionOperator
                                                ? {
                                                      label: conditionDetail.conditionOperator,
                                                      value: conditionDetail.conditionOperator,
                                                  }
                                                : selectedOperator
                                        }
                                        onChange={handleConditionOperatorChange(index)}
                                        options={operatorOptions}
                                        isSearchable={false}
                                    />
                                    <div className="fs-13">
                                        <CustomInput
                                            name="conditionalValue"
                                            rootClassName="w-100 en-2 bw-1 pl-10 pr-10 pt-6 pb-6 br-4 h-32"
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
                                </div>
                                <div className="flexbox cr-5 mb-8 fw-5 fs-11 flexbox">
                                    {errorObj && !errorObj.isValid && (
                                        <>
                                            <AlertTriangle className="icon-dim-14 mr-5 ml-5 mt-2" />
                                            <span>{errorObj.message}</span>
                                        </>
                                    )}
                                </div>
                            </Fragment>
                        ) : null
                    })}
                    <div className="pointer cb-5 fw-6 fs-13 flexbox content-fit lh-32" onClick={addCondition}>
                        <Add className="add-icon mt-6" />
                        Add condition
                    </div>
                </>
            )}
        </div>
    )
}
