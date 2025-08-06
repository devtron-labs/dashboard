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

import {
    ConditionDataTableHeaderKeys,
    ConditionDetails,
    ConditionType,
    DynamicDataTableCellValidationState,
    DynamicDataTableRowDataType,
    IO_VARIABLES_VALUE_COLUMN_BOOL_OPTIONS,
    IO_VARIABLES_VALUE_COLUMN_DATE_OPTIONS,
    PATTERNS,
    PluginType,
    SelectPickerOptionType,
    VALUE_COLUMN_DROPDOWN_LABEL,
    VariableType,
    VariableTypeFormat,
} from '@devtron-labs/devtron-fe-common-lib'

import { PipelineContext } from '@Components/workflowEditor/types'

import { CONDITION_DATA_TABLE_OPERATOR_OPTIONS, EQUAL_NOT_EQUAL_TO_OPERATOR_OPTIONS } from './constants'
import { ConditionDataTableType } from './types'

// DYNAMIC DATA TABLE UTILS
export const getConditionDataTableHeaders = (conditionType: ConditionType): ConditionDataTableType['headers'] => [
    {
        label: `${conditionType} IF`,
        key: ConditionDataTableHeaderKeys.VARIABLE,
        width: '200px',
    },
    {
        label: 'OPERATOR',
        key: ConditionDataTableHeaderKeys.OPERATOR,
        width: '100px',
    },
    {
        label: 'VALUE',
        key: ConditionDataTableHeaderKeys.VALUE,
        width: '1fr',
    },
]

const getConditionDataTableVariableOptions = (ioVariables: VariableType[]): SelectPickerOptionType<string>[] =>
    (ioVariables || [])
        .filter((variable) => variable.name && variable.format !== VariableTypeFormat.FILE)
        .map((variable) => ({ label: variable.name, value: variable.name }))

const getIOVariableBasedOnConditionOnVariable = ({
    conditionOnVariable,
    ioVariables,
}: {
    conditionOnVariable: ConditionDetails['conditionOnVariable']
    ioVariables: VariableType[]
}) => ioVariables.find(({ name }) => name === conditionOnVariable)

export const getConditionVariableTypeFormat = ({
    conditionOnVariable,
    ioVariables,
}: {
    conditionOnVariable: ConditionDetails['conditionOnVariable']
    ioVariables: VariableType[]
}) => getIOVariableBasedOnConditionOnVariable({ conditionOnVariable, ioVariables })?.format ?? null

const getOperatorOptionsBasedOnVariableTypeFormat = (variableType: VariableTypeFormat) => {
    switch (variableType) {
        case VariableTypeFormat.STRING:
        case VariableTypeFormat.BOOL:
        case VariableTypeFormat.FILE:
            return EQUAL_NOT_EQUAL_TO_OPERATOR_OPTIONS
        case VariableTypeFormat.DATE:
        case VariableTypeFormat.NUMBER:
        default:
            return CONDITION_DATA_TABLE_OPERATOR_OPTIONS
    }
}

const getConditionDataTableValColumnProps = ({
    conditionalValue,
    conditionOnVariable,
    ioVariables,
}: {
    ioVariables: VariableType[]
} & Pick<
    ConditionDetails,
    'conditionOnVariable' | 'conditionalValue'
>): ConditionDataTableType['rows'][number]['data']['val'] => {
    const { valueConstraint, format } =
        getIOVariableBasedOnConditionOnVariable({ conditionOnVariable, ioVariables }) ?? {}

    const choices = (valueConstraint?.choices || []).map<SelectPickerOptionType<string>>((value) => ({
        label: value,
        value,
    }))

    if (format === VariableTypeFormat.NUMBER || format === VariableTypeFormat.STRING) {
        if (!choices.length) {
            return {
                type: DynamicDataTableRowDataType.TEXT,
                props: { placeholder: 'Enter value' },
                value: conditionalValue,
            }
        }

        if (valueConstraint?.blockCustomValue) {
            return {
                type: DynamicDataTableRowDataType.DROPDOWN,
                props: {
                    options: [{ label: VALUE_COLUMN_DROPDOWN_LABEL.CHOICES, options: choices }],
                    placeholder: 'Select value',
                },
                value: conditionalValue,
            }
        }
    }

    const formatConfig = {
        [VariableTypeFormat.BOOL]: {
            type: DynamicDataTableRowDataType.DROPDOWN,
            props: {
                options: [
                    { label: VALUE_COLUMN_DROPDOWN_LABEL.CHOICES, options: IO_VARIABLES_VALUE_COLUMN_BOOL_OPTIONS },
                ],
                placeholder: 'Select value',
            },
        },
        [VariableTypeFormat.DATE]: {
            type: DynamicDataTableRowDataType.SELECT_TEXT,
            props: {
                options: [
                    {
                        label: VALUE_COLUMN_DROPDOWN_LABEL.SUPPORTED_DATE_FORMATS,
                        options: IO_VARIABLES_VALUE_COLUMN_DATE_OPTIONS,
                    },
                ],
                placeholder: 'Enter value',
            },
        },
    }

    return {
        ...(formatConfig[format] || {
            type: DynamicDataTableRowDataType.SELECT_TEXT,
            props: {
                options: [{ label: VALUE_COLUMN_DROPDOWN_LABEL.CHOICES, options: choices }],
                placeholder: 'Enter value',
            },
        }),
        value: conditionalValue,
    }
}

export const getConditionDataTableRows = ({
    conditionDetails,
    ioVariables,
    conditionType: parentConditionType,
}: {
    conditionDetails: ConditionDetails[]
    ioVariables: VariableType[]
    conditionType: ConditionType
}): ConditionDataTableType['rows'] =>
    (conditionDetails || [])
        .filter(({ conditionType }) => conditionType === parentConditionType)
        .map<ConditionDataTableType['rows'][number]>(
            ({ conditionOnVariable, conditionOperator, conditionalValue, conditionType, id }) => {
                const variableType = getConditionVariableTypeFormat({ conditionOnVariable, ioVariables })
                return {
                    data: {
                        variable: {
                            type: DynamicDataTableRowDataType.DROPDOWN,
                            props: {
                                options: getConditionDataTableVariableOptions(ioVariables),
                                placeholder: 'Select variable',
                                autoFocus: true,
                            },
                            value: conditionOnVariable,
                        },
                        operator: {
                            type: DynamicDataTableRowDataType.DROPDOWN,
                            props: {
                                options: getOperatorOptionsBasedOnVariableTypeFormat(variableType),
                                isSearchable: false,
                            },
                            value: conditionOperator,
                        },
                        val: getConditionDataTableValColumnProps({
                            conditionalValue,
                            conditionOnVariable,
                            ioVariables,
                        }),
                    },
                    id,
                    customState: {
                        conditionType,
                        variableType,
                    },
                }
            },
        )

export const getConditionDataTableInitialCellError = (
    rows: ConditionDataTableType['rows'],
): ConditionDataTableType['cellError'] =>
    rows.reduce((acc, curr) => {
        if (!acc[curr.id]) {
            acc[curr.id] = Object.values(ConditionDataTableHeaderKeys).reduce(
                (headerAcc, key) => ({ ...headerAcc, [key]: { isValid: true, errorMessages: [] } }),
                {},
            )
        }

        return acc
    }, {})

export const getConditionDataTableRowEmptyValidationState = (): Record<
    ConditionDataTableHeaderKeys,
    DynamicDataTableCellValidationState
> => ({
    [ConditionDataTableHeaderKeys.VARIABLE]: {
        isValid: true,
        errorMessages: [],
    },
    [ConditionDataTableHeaderKeys.OPERATOR]: {
        isValid: true,
        errorMessages: [],
    },
    [ConditionDataTableHeaderKeys.VALUE]: {
        isValid: true,
        errorMessages: [],
    },
})

// CONVERSION TO PARENT STATE UTIL
export const convertConditionDataTableToFormData = ({
    rows,
    cellError,
    formData,
    formDataErrorObj,
    activeStageName,
    selectedTaskIndex,
    conditionType,
    validateTask,
}: Pick<ConditionDataTableType, 'rows' | 'cellError'> &
    Pick<
        PipelineContext,
        'activeStageName' | 'selectedTaskIndex' | 'formData' | 'formDataErrorObj' | 'validateTask'
    > & { conditionType: ConditionType }) => {
    const updatedFormData = formData
    const updatedFormDataErrorObj = structuredClone(formDataErrorObj)

    const currentStepTypeVariable =
        formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.INLINE
            ? 'inlineStepDetail'
            : 'pluginRefStepDetail'

    const updatedConditionDetails: ConditionDetails[] = rows.map<ConditionDetails>(({ data, id, customState }) => ({
        conditionalValue: data.val.value,
        conditionOnVariable: data.variable.value,
        conditionOperator: data.operator.value,
        conditionType: customState.conditionType,
        id: +id,
    }))

    updatedFormData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].conditionDetails = [
        // Remove existing entries of the selected conditionType, as they will be replaced by the data of rows from DynamicDataTable
        ...updatedFormData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].conditionDetails.filter(
            (item) => item.conditionType !== conditionType,
        ),
        ...updatedConditionDetails,
    ]

    const isValid = Object.values(cellError).reduce(
        (acc, curr) => acc && !Object.values(curr).some((item) => !item.isValid),
        true,
    )

    updatedFormDataErrorObj[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].isConditionDetailsValid =
        isValid

    updatedFormDataErrorObj[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].conditionDetails =
        cellError

    validateTask(
        updatedFormData[activeStageName].steps[selectedTaskIndex],
        updatedFormDataErrorObj[activeStageName].steps[selectedTaskIndex],
        { validateConditionDetails: false },
    )

    return { updatedFormData, updatedFormDataErrorObj }
}

// VALIDATIONS
export const validateConditionDataCell = ({
    key,
    condition: { conditionOnVariable, conditionOperator, conditionalValue },
    variableType,
}: {
    key: ConditionDataTableHeaderKeys
    condition: Pick<ConditionDetails, 'conditionOnVariable' | 'conditionOperator' | 'conditionalValue'>
} & Pick<
    ConditionDataTableType['rows'][number]['customState'],
    'variableType'
>): DynamicDataTableCellValidationState => {
    if (key === ConditionDataTableHeaderKeys.VARIABLE && !conditionOnVariable) {
        return { errorMessages: ['Condition on variable is required'], isValid: false }
    }

    if (key === ConditionDataTableHeaderKeys.VALUE) {
        const numberReg = new RegExp(PATTERNS.NUMBERS_WITH_SCOPE_VARIABLES)
        const boolReg = new RegExp(PATTERNS.BOOLEAN_WITH_SCOPE_VARIABLES)

        if (!conditionalValue) {
            return { errorMessages: ['Conditional value is required'], isValid: false }
        }

        if (variableType === VariableTypeFormat.NUMBER && !numberReg.test(conditionalValue)) {
            return {
                errorMessages: ['Conditional value is not a number'],
                isValid: false,
            }
        }
        if (variableType === VariableTypeFormat.BOOL && !boolReg.test(conditionalValue)) {
            return {
                errorMessages: ['Conditional value is not a boolean'],
                isValid: false,
            }
        }
    }

    if (key === ConditionDataTableHeaderKeys.OPERATOR && !conditionOperator) {
        return { errorMessages: ['Condition operator is required'], isValid: false }
    }

    return { errorMessages: [], isValid: true }
}

export const getConditionDataTableCellValidateState = ({
    row: { data, customState },
    key,
    value,
}: {
    row: ConditionDataTableType['rows'][number]
    key: ConditionDataTableHeaderKeys
    value: string
}): DynamicDataTableCellValidationState =>
    validateConditionDataCell({
        key,
        condition: {
            conditionalValue: key === ConditionDataTableHeaderKeys.VALUE ? value : data.val.value,
            conditionOnVariable: key === ConditionDataTableHeaderKeys.VARIABLE ? value : data.variable.value,
            conditionOperator: key === ConditionDataTableHeaderKeys.OPERATOR ? value : data.operator.value,
        },
        variableType: customState.variableType,
    })
