import {
    DynamicDataTableCellValidationState,
    RefVariableType,
    VariableTypeFormat,
} from '@devtron-labs/devtron-fe-common-lib'

import { PluginVariableType } from '@Components/ciPipeline/types'
import { PATTERNS } from '@Config/constants'

import {
    GetValidateCellProps,
    ValidateInputOutputVariableCellProps,
    ValidateVariableDataTableKeysProps,
    VariableDataRowType,
} from './types'
import { VARIABLE_DATA_TABLE_CELL_ERROR_MSGS } from './constants'

export const getVariableDataTableVariableKeysFrequency = (
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
    const numberReg = new RegExp(PATTERNS.NUMBERS_WITH_SCOPE_VARIABLES)

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
