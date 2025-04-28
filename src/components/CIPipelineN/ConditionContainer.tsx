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

import { ChangeEvent, useContext, useEffect, useState } from 'react'

import { ConditionDataTableHeaderKeys, ConditionType, PluginType } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Dropdown } from '../../assets/icons/ic-chevron-down.svg'
import { ConditionContainerType } from '../ciPipeline/types'
import { pipelineContext } from '../workflowEditor/workflowEditor'
import { ConditionDataTable } from './ConditionDataTable/ConditionDataTable.component'
import { CONDITION_DATA_TABLE_OPERATOR_OPTIONS } from './ConditionDataTable/constants'

export const ConditionContainer = ({ type }: { type: ConditionContainerType }) => {
    const { formData, setFormData, selectedTaskIndex, activeStageName, formDataErrorObj, setFormDataErrorObj } =
        useContext(pipelineContext)

    const [collapsedSection, setCollapsedSection] = useState<boolean>(true)
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

    const handleConditionCollapse = (): void => {
        setCollapsedSection(!collapsedSection)
        if (collapsedSection) {
            const _formData = { ...formData }
            const updatedFormDataErrorObj = structuredClone(formDataErrorObj)
            let _conditionType: ConditionType
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
                _conditionType = ConditionType.PASS
                if (!passCondition) {
                    const failCondition = conditionDetails.some(
                        (conditionDetail) => conditionDetail.conditionType === ConditionType.FAIL,
                    )
                    if (failCondition) {
                        _conditionType = ConditionType.FAIL
                    } else {
                        addNewRow = true
                    }
                }
                setConditionType(_conditionType)
            } else {
                const triggerCondition = conditionDetails.some(
                    (conditionDetail) => conditionDetail.conditionType === ConditionType.TRIGGER,
                )
                _conditionType = ConditionType.TRIGGER
                if (!triggerCondition) {
                    const skipCondition = conditionDetails.some(
                        (conditionDetail) => conditionDetail.conditionType === ConditionType.SKIP,
                    )
                    if (skipCondition) {
                        _conditionType = ConditionType.SKIP
                    } else {
                        addNewRow = true
                    }
                }
                setConditionType(_conditionType)
            }
            if (addNewRow) {
                const newCondition = {
                    id: conditionDetails.length,
                    conditionOnVariable: '',
                    conditionOperator: CONDITION_DATA_TABLE_OPERATOR_OPTIONS[0].label,
                    conditionType: _conditionType,
                    conditionalValue: '',
                }
                conditionDetails.push(newCondition)
                _formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].conditionDetails =
                    conditionDetails
                setFormData(_formData)

                const updatedConditionDetailsCellError =
                    updatedFormDataErrorObj[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable]
                        .conditionDetails || {}

                updatedConditionDetailsCellError[newCondition.id] = {
                    [ConditionDataTableHeaderKeys.VARIABLE]: { isValid: true, errorMessages: [] },
                    [ConditionDataTableHeaderKeys.OPERATOR]: { isValid: true, errorMessages: [] },
                    [ConditionDataTableHeaderKeys.VALUE]: { isValid: true, errorMessages: [] },
                }

                updatedFormDataErrorObj[activeStageName].steps[selectedTaskIndex][
                    currentStepTypeVariable
                ].conditionDetails = updatedConditionDetailsCellError

                setFormDataErrorObj(updatedFormDataErrorObj)
            }
        }
    }

    const handleConditionTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
        setConditionType(event.target.value as ConditionType)
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
                    onClick={handleConditionCollapse}
                />
            </div>
            {!collapsedSection && (
                <ConditionDataTable
                    conditionType={conditionType}
                    type={type}
                    handleConditionTypeChange={handleConditionTypeChange}
                />
            )}
        </div>
    )
}
