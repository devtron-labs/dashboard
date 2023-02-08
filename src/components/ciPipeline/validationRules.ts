import { PATTERNS } from '../../config';
import { RefVariableType } from './types'

export class ValidationRules {
    name = (value: string): { message: string | null; isValid: boolean } => {
        let regExp = new RegExp(PATTERNS.APP_NAME)
        if (value.length === 0) return { isValid: false, message: 'This is required' }
        if (value.length < 2) return { isValid: false, message: 'At least 2 characters required' }
        if (value.length > 50) return { isValid: false, message: 'Max 50 characters allowed' }
        else if (!regExp.test(value))
            return {
                isValid: false,
                message:
                    "Min 2 chars; Start with alphabet; End with alphanumeric; Use only lowercase; Allowed:(-), (.); Do not use 'spaces'",
            }
        else return { isValid: true, message: '' }
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
