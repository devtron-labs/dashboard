import { PATTERNS } from '../../config'
import { RefVariableType } from './types'

export class ValidationRules {
    name = (value: string): { message: string | null; isValid: boolean } => {
        const re = new RegExp('^[a-z][a-z0-9-.]+[a-z0-9]$')
        if (value && value.length < 1) {
            return { message: 'This is required', isValid: false }
        } else if (!re.test(value)) {
            return { message: `Min of 3 characters; Start with lowercase; Use (a-z), (0-9), (-), (.)`, isValid: false }
        } else {
            return { message: null, isValid: true }
        }
    }

    requiredField = (value: string): { message: string | null; isValid: boolean } => {
        if (!value) {
            return { message: 'This is required', isValid: false }
        } else {
            return { message: null, isValid: true }
        }
    }

    inputVariable = (
        value: object,
        availableInputVariables: Map<string, boolean>,
    ): { message: string | null; isValid: boolean } => {
        const re = new RegExp(PATTERNS.VARIABLE)
        const variableValue =
            value['allowEmptyValue'] ||
            (!value['allowEmptyValue'] && value['defaultValue'] && value['defaultValue'] !== '') ||
            (value['variableType'] === RefVariableType.NEW && value['value']) ||
            (value['refVariableName'] &&
                (value['variableType'] === RefVariableType.GLOBAL ||
                    (value['variableType'] === RefVariableType.FROM_PREVIOUS_STEP &&
                        value['refVariableStepIndex'] &&
                        value['refVariableStage'])))
        if (!value['name'] && !variableValue && !value['description']) {
            return { message: 'Please complete or remove this variable', isValid: false }
        } else if (!value['name'] && !variableValue) {
            return { message: 'Variable name and Value both are required', isValid: false }
        } else if (!value['name']) {
            return { message: 'Variable name is required', isValid: false }
        } else if (availableInputVariables.get(value['name'])) {
            return { message: 'Variable name should be unique', isValid: false }
        } else if (!re.test(value['name'])) {
            return { message: `Invalid name. Only alphanumeric chars and (_) is allowed`, isValid: false }
        } else if (!variableValue) {
            return { message: 'Variable value is required', isValid: false }
        } else {
            return { message: null, isValid: true }
        }
    }

    outputVariable = (
        value: object,
        availableInputVariables: Map<string, boolean>,
    ): { message: string | null; isValid: boolean } => {
        const re = new RegExp(PATTERNS.VARIABLE)
        if (!value['name']) {
            return { message: 'Variable name is required', isValid: false }
        } else if (availableInputVariables.get(value['name'])) {
            return { message: 'Variable name should be unique', isValid: false }
        } else if (!re.test(value['name'])) {
            return { message: `Invalid name. Only alphanumeric chars and (_) is allowed`, isValid: false }
        } else {
            return { message: null, isValid: true }
        }
    }

    conditionDetail = (value: object): { message: string | null; isValid: boolean } => {
        if (!value['conditionOnVariable'] && !value['conditionalValue']) {
            return { message: 'Please complete or remove this condition', isValid: false }
        } else if (!value['conditionOnVariable']) {
            return { message: 'Condition on variable is required', isValid: false }
        } else if (!value['conditionOperator']) {
            return { message: 'Condition operator is required', isValid: false }
        } else if (!value['conditionalValue']) {
            return { message: 'Conditional value is required', isValid: false }
        } else {
            return { message: null, isValid: true }
        }
    }

    sourceValue = (value: string): { message: string | null; isValid: boolean } => {
        if (!value) {
            return { message: `This is required`, isValid: false }
        } else {
            try {
                new RegExp(value)
                return { message: null, isValid: true }
            } catch (err) {
                return { message: 'This is not a valid regular expression.', isValid: false }
            }
        }
    }

    mountPathMap = (value: object): { message: string | null; isValid: boolean } => {
        if (!value['filePathOnDisk'] && !value['filePathOnContainer']) {
            return { message: 'File path on disk and File path on container, both are required', isValid: false }
        } else if (!value['filePathOnDisk']) {
            return { message: 'File path on disk is required', isValid: false }
        } else if (!value['filePathOnContainer']) {
            return { message: `File path on container is required`, isValid: false }
        } else {
            return { message: null, isValid: true }
        }
    }
}
