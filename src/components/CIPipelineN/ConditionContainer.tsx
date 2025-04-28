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

import { ConditionType, PluginType } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Dropdown } from '../../assets/icons/ic-chevron-down.svg'
import { ConditionContainerType } from '../ciPipeline/types'
import { pipelineContext } from '../workflowEditor/workflowEditor'
import { ConditionDataTable } from './ConditionDataTable/ConditionDataTable.component'
import { CONDITION_DATA_TABLE_OPERATOR_OPTIONS } from './ConditionDataTable/constants'
import { CONTAINER_CONDITION_TYPE_TO_CONDITION_TYPE_MAP } from './Constants'

export const ConditionContainer = ({ type }: { type: ConditionContainerType }) => {
    const { formData, setFormData, selectedTaskIndex, activeStageName, formDataErrorObj } = useContext(pipelineContext)

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
        const { isConditionDetailsValid, conditionDetails: conditionDetailsError } =
            formDataErrorObj[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable]

        if (!isConditionDetailsValid) {
            const { conditionDetails } = formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable]

            const invalidConditionDetailsIds = Object.keys(conditionDetailsError).reduce((acc, key) => {
                if (
                    Object.keys(conditionDetailsError[key]).some(
                        (dataKey) => !conditionDetailsError[key][dataKey].isValid,
                    )
                ) {
                    acc.push(key)
                }

                return acc
            }, [])

            const filteredConditionDetails = conditionDetails.filter(({ conditionType: _conditionType }) =>
                CONTAINER_CONDITION_TYPE_TO_CONDITION_TYPE_MAP[type].includes(_conditionType),
            )

            const derivedConditionType = filteredConditionDetails.length
                ? invalidConditionDetailsIds.reduce((acc, currId) => {
                      const currentCondition = filteredConditionDetails.find(({ id }) =>
                          typeof +currId === 'number' ? id === +currId : id === currId,
                      )?.conditionType

                      if (currentCondition) {
                          return currentCondition
                      }

                      return acc
                  }, null)
                : null

            if (derivedConditionType) {
                setConditionType(derivedConditionType)
                if (collapsedSection) {
                    setCollapsedSection(false) // expand conditions in case of error
                }
            }
        }
    }, [formDataErrorObj])

    const handleConditionCollapse = (): void => {
        setCollapsedSection(!collapsedSection)
        if (collapsedSection) {
            const _formData = { ...formData }
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
