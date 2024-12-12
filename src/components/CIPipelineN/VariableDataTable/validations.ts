import { DynamicDataTableCellValidationState, VariableTypeFormat } from '@devtron-labs/devtron-fe-common-lib'

import { PluginVariableType } from '@Components/ciPipeline/types'
import { PATTERNS } from '@Config/constants'

import { GetValidateCellProps, ValidateVariableDataTableProps } from './types'
import { checkForSystemVariable, testValueForNumber } from './utils'

export const getVariableDataTableCellValidateState = ({
    pluginVariableType,
    keysFrequencyMap,
    row: { data, customState },
    key,
    value: latestValue,
}: GetValidateCellProps): DynamicDataTableCellValidationState => {
    const value = latestValue ?? data[key].value
    const { variableDescription, isVariableRequired, valColumnSelectedValue, askValueAtRuntime, defaultValue } =
        customState
    const re = new RegExp(PATTERNS.VARIABLE)

    if (key === 'variable') {
        const variableValue = !isVariableRequired || data.val.value

        if (!value && !variableValue && !variableDescription) {
            return { errorMessages: ['Please complete or remove this variable'], isValid: false }
        }

        if (!value) {
            return { errorMessages: ['Variable name is required'], isValid: false }
        }

        if (!re.test(value)) {
            return {
                errorMessages: [`Invalid name. Only alphanumeric chars and (_) is allowed`],
                isValid: false,
            }
        }

        if ((keysFrequencyMap[value] || 0) > 1) {
            return { errorMessages: ['Variable name should be unique'], isValid: false }
        }
    }

    if (pluginVariableType === PluginVariableType.INPUT && key === 'val') {
        const checkForVariable = isVariableRequired && !askValueAtRuntime && !defaultValue
        if (checkForVariable && !value) {
            return { errorMessages: ['Variable value is required'], isValid: false }
        }

        if (data.format.value === VariableTypeFormat.NUMBER) {
            return {
                isValid: checkForSystemVariable(valColumnSelectedValue) || testValueForNumber(value),
                errorMessages: ['Variable value is not a number'],
            }
        }
    }

    return { errorMessages: [], isValid: true }
}

export const validateVariableDataTable = ({
    rows,
    headers,
    keysFrequencyMap,
    pluginVariableType,
}: ValidateVariableDataTableProps) => {
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
