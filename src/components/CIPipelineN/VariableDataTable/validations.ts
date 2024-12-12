import {
    DynamicDataTableCellErrorType,
    DynamicDataTableCellValidationState,
    VariableTypeFormat,
} from '@devtron-labs/devtron-fe-common-lib'

import { PluginVariableType } from '@Components/ciPipeline/types'
import { PATTERNS } from '@Config/constants'

import { GetValidateCellProps, ValidateVariableDataTableProps, VariableDataKeys, VariableDataRowType } from './types'
import { checkForSystemVariable, testValueForNumber } from './utils'
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

export const getVariableDataTableCellValidateState = ({
    row: { data, customState },
    key,
    value: latestValue,
    pluginVariableType,
    keysFrequencyMap = {},
}: GetValidateCellProps): DynamicDataTableCellValidationState => {
    const value = latestValue ?? data[key].value
    const { variableDescription, isVariableRequired, valColumnSelectedValue, askValueAtRuntime, defaultValue } =
        customState
    const re = new RegExp(PATTERNS.VARIABLE)

    if (key === 'variable') {
        const variableValue = !isVariableRequired || data.val.value

        if (!value && !variableValue && !variableDescription) {
            return { errorMessages: [VARIABLE_DATA_TABLE_CELL_ERROR_MSGS.EMPTY_ROW], isValid: false }
        }

        if (!value) {
            return { errorMessages: [VARIABLE_DATA_TABLE_CELL_ERROR_MSGS.VARIABLE_NAME_REQUIRED], isValid: false }
        }

        if (!re.test(value)) {
            return {
                errorMessages: [VARIABLE_DATA_TABLE_CELL_ERROR_MSGS.INVALID_VARIABLE_NAME],
                isValid: false,
            }
        }

        if ((keysFrequencyMap[value] || 0) > 1) {
            return { errorMessages: [VARIABLE_DATA_TABLE_CELL_ERROR_MSGS.UNIQUE_VARIABLE_NAME], isValid: false }
        }
    }

    if (pluginVariableType === PluginVariableType.INPUT && key === 'val') {
        const checkForVariable = isVariableRequired && !askValueAtRuntime && !defaultValue
        if (checkForVariable && !value) {
            return { errorMessages: [VARIABLE_DATA_TABLE_CELL_ERROR_MSGS.VARIABLE_VALUE_REQUIRED], isValid: false }
        }

        if (data.format.value === VariableTypeFormat.NUMBER) {
            return {
                isValid: checkForSystemVariable(valColumnSelectedValue) || testValueForNumber(value),
                errorMessages: [VARIABLE_DATA_TABLE_CELL_ERROR_MSGS.VARIABLE_VALUE_NOT_A_NUMBER],
            }
        }
    }

    return { errorMessages: [], isValid: true }
}

export const validateVariableDataTableVariableKeys = ({
    rows,
    rowId,
    value,
    cellError,
}: Pick<ValidateVariableDataTableProps, 'rows'> & {
    cellError: DynamicDataTableCellErrorType<VariableDataKeys>
    rowId?: string | number
    value?: string
}) => {
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

export const validateVariableDataTable = ({ rows, headers, pluginVariableType }: ValidateVariableDataTableProps) => {
    const keysFrequencyMap = getVariableDataTableVariableKeysFrequency(rows)

    const cellError = rows.reduce((acc, row) => {
        acc[row.id] = headers.reduce(
            (headerAcc, { key }) => ({
                ...headerAcc,
                [key]: getVariableDataTableCellValidateState({
                    keysFrequencyMap,
                    pluginVariableType,
                    key,
                    row,
                }),
            }),
            {},
        )

        return acc
    }, {})

    return cellError
}
