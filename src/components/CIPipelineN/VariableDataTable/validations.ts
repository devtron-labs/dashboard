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
    DynamicDataTableCellValidationState,
    InputOutputVariablesHeaderKeys,
    PATTERNS as FE_COMMON_LIB_PATTERNS,
    RefVariableType,
    VariableTypeFormat,
} from '@devtron-labs/devtron-fe-common-lib'

import { PluginVariableType } from '@Components/ciPipeline/types'
import { PATTERNS } from '@Config/constants'

import { VARIABLE_DATA_TABLE_CELL_ERROR_MSGS } from './constants'
import {
    GetValidateCellProps,
    ValidateInputOutputVariableCellProps,
    ValidateVariableDataTableKeysProps,
    VariableDataRowType,
} from './types'

const getVariableDataTableVariableKeysFrequency = (
    rows: VariableDataRowType[],
    rowId?: string | number,
    value?: string,
) => {
    const keysFrequencyMap: Record<string, number> = rows.reduce((acc, curr) => {
        const currentKey = curr.id === rowId ? value : curr.data.variable.value
        if (currentKey) {
            acc[currentKey] = (acc[currentKey] ?? 0) + 1
        }
        return acc
    }, {})

    return keysFrequencyMap
}

export const getVariableDataTableRowEmptyValidationState = (): Record<
    InputOutputVariablesHeaderKeys,
    DynamicDataTableCellValidationState
> => ({
    [InputOutputVariablesHeaderKeys.VARIABLE]: {
        isValid: true,
        errorMessages: [],
    },
    [InputOutputVariablesHeaderKeys.FORMAT]: {
        isValid: true,
        errorMessages: [],
    },
    [InputOutputVariablesHeaderKeys.VALUE]: {
        isValid: true,
        errorMessages: [],
    },
})

export const validateInputOutputVariableCell = ({
    variable,
    key,
    type,
    keysFrequencyMap = {},
}: ValidateInputOutputVariableCellProps): DynamicDataTableCellValidationState => {
    const {
        allowEmptyValue,
        isRuntimeArg,
        defaultValue,
        value,
        variableType,
        refVariableName,
        refVariableStepIndex,
        refVariableStage,
        description,
        format,
        name,
    } = variable

    const variableNameReg = new RegExp(PATTERNS.VARIABLE)
    const numberReg = new RegExp(FE_COMMON_LIB_PATTERNS.NUMBERS_WITH_SCOPE_VARIABLES)
    const boolReg = new RegExp(FE_COMMON_LIB_PATTERNS.BOOLEAN_WITH_SCOPE_VARIABLES)

    const isInputVariable = type === PluginVariableType.INPUT

    const variableValue =
        allowEmptyValue ||
        (!allowEmptyValue && isRuntimeArg) ||
        (!allowEmptyValue && defaultValue && defaultValue !== '') ||
        (variableType === RefVariableType.NEW && value) ||
        (refVariableName &&
            (variableType === RefVariableType.GLOBAL ||
                (variableType === RefVariableType.FROM_PREVIOUS_STEP && refVariableStepIndex && refVariableStage)))

    if (key === 'variable') {
        if (isInputVariable && !name && !variableValue && !description) {
            return { errorMessages: [VARIABLE_DATA_TABLE_CELL_ERROR_MSGS.EMPTY_ROW], isValid: false }
        }
        if (!name) {
            return {
                errorMessages: [VARIABLE_DATA_TABLE_CELL_ERROR_MSGS.VARIABLE_NAME_REQUIRED],
                isValid: false,
            }
        }
        if ((keysFrequencyMap[name] ?? 0) > 1) {
            return {
                errorMessages: [VARIABLE_DATA_TABLE_CELL_ERROR_MSGS.UNIQUE_VARIABLE_NAME],
                isValid: false,
            }
        }
        if (!variableNameReg.test(name)) {
            return {
                errorMessages: [VARIABLE_DATA_TABLE_CELL_ERROR_MSGS.INVALID_VARIABLE_NAME],
                isValid: false,
            }
        }
    }

    if (isInputVariable && key === 'val') {
        if (!variableValue) {
            return {
                errorMessages: [VARIABLE_DATA_TABLE_CELL_ERROR_MSGS.VARIABLE_VALUE_REQUIRED],
                isValid: false,
            }
        }
        // test for numbers and scope variables when format is "NUMBER".
        if (format === VariableTypeFormat.NUMBER && variableValue && !!value && !numberReg.test(value)) {
            return {
                errorMessages: [VARIABLE_DATA_TABLE_CELL_ERROR_MSGS.VARIABLE_VALUE_NOT_A_NUMBER],
                isValid: false,
            }
        }
        // test for boolean and scope variables when format is "BOOL".
        if (format === VariableTypeFormat.BOOL && variableValue && !!value && !boolReg.test(value)) {
            return {
                errorMessages: [VARIABLE_DATA_TABLE_CELL_ERROR_MSGS.VARIABLE_VALUE_NOT_A_BOOLEAN],
                isValid: false,
            }
        }
    }

    return { errorMessages: [], isValid: true }
}

export const getVariableDataTableCellValidateState = ({
    row: { data, customState },
    key,
    value: latestValue,
    pluginVariableType,
}: GetValidateCellProps): DynamicDataTableCellValidationState => {
    const value = latestValue ?? data[key].value
    const { variableDescription, isVariableRequired, valColumnSelectedValue, askValueAtRuntime, defaultValue } =
        customState

    return validateInputOutputVariableCell({
        key,
        type: pluginVariableType,
        variable: {
            allowEmptyValue: !isVariableRequired,
            isRuntimeArg: askValueAtRuntime,
            defaultValue,
            name: key === 'variable' ? value : data.variable.value,
            value: key === 'val' ? value : data.val.value,
            variableType: valColumnSelectedValue?.variableType ?? RefVariableType.NEW,
            description: variableDescription,
            format: data.format.value as VariableTypeFormat,
            refVariableName: valColumnSelectedValue?.refVariableName,
            refVariableStepIndex: valColumnSelectedValue?.refVariableStepIndex,
            refVariableStage: valColumnSelectedValue?.refVariableStage,
        },
    })
}

export const validateVariableDataTableVariableKeys = ({
    rows,
    rowId,
    value,
    cellError,
}: ValidateVariableDataTableKeysProps) => {
    const updatedCellError = cellError
    const keysFrequencyMap = getVariableDataTableVariableKeysFrequency(rows, rowId, value)

    rows.forEach(({ data, id }) => {
        const cellValue = rowId === id ? value : data.variable.value
        const variableErrorState = updatedCellError[id].variable
        if (variableErrorState.isValid && keysFrequencyMap[cellValue] > 1) {
            updatedCellError[id].variable = {
                isValid: false,
                errorMessages: [VARIABLE_DATA_TABLE_CELL_ERROR_MSGS.UNIQUE_VARIABLE_NAME],
            }
        } else if (
            keysFrequencyMap[cellValue] < 2 &&
            variableErrorState.errorMessages[0] === VARIABLE_DATA_TABLE_CELL_ERROR_MSGS.UNIQUE_VARIABLE_NAME
        ) {
            updatedCellError[id].variable = {
                isValid: true,
                errorMessages: [],
            }
        }
    })
}
