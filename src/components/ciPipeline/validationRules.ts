import { RefVariableType } from '@devtron-labs/devtron-fe-common-lib';
import { PATTERNS } from '../../config'
import {
    CHARACTER_ERROR_MIN,
    CHARACTER_ERROR_MAX,
    REQUIRED_FIELD_MSG,
    ERROR_MESSAGE_FOR_VALIDATION,
} from '../../config/constantMessaging'

export class ValidationRules {
    name = (value: string): { message: string | null; isValid: boolean } => {
        const regExp = new RegExp(PATTERNS.APP_NAME)
        if (!(value?.length)) return { isValid: false, message: REQUIRED_FIELD_MSG }
        if (value.length < 2) return { isValid: false, message: CHARACTER_ERROR_MIN }
        if (value.length > 50) return { isValid: false, message: CHARACTER_ERROR_MAX }
        else if (!regExp.test(value))
            return {
                isValid: false,
                message: ERROR_MESSAGE_FOR_VALIDATION,
            }
        else return { isValid: true, message: '' }
    }

    requiredField = (value: string): { message: string | null; isValid: boolean } => {
        if (!value) {
            return { message: REQUIRED_FIELD_MSG, isValid: false }
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

    sourceValue = (value: string, doRegexValidation = true): { message: string | null; isValid: boolean } => {
        if (!value) {
            return { message: `This is required`, isValid: false }
        } else {
            if (doRegexValidation) {
                try {
                    new RegExp(value)
                    return { message: null, isValid: true }
                } catch (err) {
                    return { message: 'This is not a valid regular expression.', isValid: false }
                }
            } else {
                return { message: null, isValid: true }
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
