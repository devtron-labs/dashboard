import { DynamicDataTableProps } from '@devtron-labs/devtron-fe-common-lib'

import { PATTERNS } from '@Config/constants'

import { VariableDataCustomState, VariableDataKeys } from './types'

export const variableDataTableValidationSchema: DynamicDataTableProps<
    VariableDataKeys,
    VariableDataCustomState
>['validationSchema'] = (value, key, { data, customState }) => {
    const { variableDescription, isVariableRequired } = customState

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
            return { errorMessages: [`Invalid name. Only alphanumeric chars and (_) is allowed`], isValid: false }
        }

        // TODO: need to confirm this validation from product
        // if (availableInputVariables.get(name)) {
        //     return { errorMessages: ['Variable name should be unique'], isValid: false }
        // }
    }

    if (key === 'val') {
        if (isVariableRequired && !value) {
            return { errorMessages: ['Variable value is required'], isValid: false }
        }
    }

    return { errorMessages: [], isValid: true }
}
