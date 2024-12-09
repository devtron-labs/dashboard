import { DynamicDataTableProps, VariableTypeFormat } from '@devtron-labs/devtron-fe-common-lib'

import { PluginVariableType } from '@Components/ciPipeline/types'
import { PATTERNS } from '@Config/constants'

import { VariableDataCustomState, VariableDataKeys } from './types'
import { checkForSystemVariable, testValueForNumber } from './utils'

export const getVariableDataTableValidationSchema =
    ({
        pluginVariableType,
        keysFrequencyMap,
    }: {
        pluginVariableType: PluginVariableType
        keysFrequencyMap: Record<string, number>
    }): DynamicDataTableProps<VariableDataKeys, VariableDataCustomState>['validationSchema'] =>
    (value, key, { data, customState }) => {
        const { variableDescription, isVariableRequired, selectedValue, askValueAtRuntime } = customState

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
            const checkForVariable = isVariableRequired && !askValueAtRuntime
            if (checkForVariable && !value) {
                return { errorMessages: ['Variable value is required'], isValid: false }
            }

            if (data.format.value === VariableTypeFormat.NUMBER) {
                return {
                    isValid: checkForSystemVariable(selectedValue) || testValueForNumber(value),
                    errorMessages: ['Variable value is not a number'],
                }
            }
        }

        return { errorMessages: [], isValid: true }
    }
