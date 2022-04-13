import { RefVariableType } from './types'

export class ValidationRules {
    name = (value: string): { message: string | null; isValid: boolean } => {
        let str = '^[a-z][a-z0-9-.]+[a-z0-9]$'
        let re = new RegExp(str)

        if (value && value.length < 1) {
            return { message: 'This is a required field', isValid: false }
        } else if (!re.test(value)) {
            return { message: `Min of 3 characters; Start with lowercase; Use (a-z), (0-9), (-), (.)`, isValid: false }
        } else {
            return { message: null, isValid: true }
        }
    }

    taskName = (value: string): { message: string | null; isValid: boolean } => {
        if (!value || value.length < 1) {
            return { message: 'This is a required field', isValid: false }
        } else {
            return { message: null, isValid: true }
        }
    }

    inputVariable = (value: object): { message: string | null; isValid: boolean } => {
        let str = `^[a-z0-9-_]+$`
        let re = new RegExp(str)
        const variableValue =
            (value['refVariableType'] === RefVariableType.NEW && value['value']) ||
            (value['refVariableUsed'] &&
                value['refVariableName'] &&
                (value['refVariableType'] === RefVariableType.GLOBAL ||
                    (value['refVariableType'] === RefVariableType.FROM_PREVIOUS_STEP &&
                        value['refVariableStepIndex'] &&
                        value['refVariableStage'])))
        if (!value['name'] && !variableValue && !value['description']) {
            return { message: 'Please complete or remove this variable', isValid: false }
        } else if (!value['name'] && !variableValue) {
            return { message: 'Variable Name and Value both are required field', isValid: false }
        } else if (!value['name']) {
            return { message: 'Variable Name is required field', isValid: false }
        } else if (!re.test(value['name'])) {
            return { message: `Invalid name. Only alphanumeric chars and (_) is allowed`, isValid: false }
        } else if (!variableValue) {
            return { message: 'Variable Value is required field', isValid: false }
        } else {
            return { message: null, isValid: true }
        }
    }

    outputVariable = (value: object): { message: string | null; isValid: boolean } => {
        let str = `^[a-z0-9-_]+$`
        let re = new RegExp(str)
        if (!value['name']) {
            return { message: 'Variable Name is required field', isValid: false }
        } else if (!re.test(value['name'])) {
            return { message: `Invalid name. Only alphanumeric chars and (_) is allowed`, isValid: false }
        } else {
            return { message: null, isValid: true }
        }
    }

    sourceValue = (value: string): { message: string | null; isValid: boolean } => {
        if (!value) return { message: `This is a required field`, isValid: false }
        else if (value && value.length < 1) {
            return { message: `This is a required field`, isValid: false }
        } else {
            return { message: null, isValid: true }
        }
    }
}
