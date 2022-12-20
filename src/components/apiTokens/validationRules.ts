import { PATTERNS, VALIDATION_MESSAGING } from '../../config'

export class ValidationRules {
    name = (value: string): { isValid: boolean; message: string } => {
        let re = PATTERNS.API_TOKEN
        let regExp = new RegExp(re)
        let test = regExp.test(value)
        if (value.length === 0) return { isValid: false, message: VALIDATION_MESSAGING.REQUIRED_FIELD_TEXT }
        if (value.length < 3) return { isValid: false, message: VALIDATION_MESSAGING.CHARACTER_REQUIRED }
        if (!test || value.length > 50) {
            return {
                isValid: false,
                message: VALIDATION_MESSAGING.CHARACTER_VALIDATION_MESSAGE,
            }
        } else {
            return { message: null, isValid: true }
        }
    }

    description = (value: string): { isValid: boolean; message: string } => {
        if (value.length > 350) return { isValid: false, message: VALIDATION_MESSAGING.MAX_350_CHAR_ALLOWED }
        else {
            return { message: null, isValid: true }
        }
    }

    expireAtInMs = (value: number): { isValid: boolean; message: string } => {
        if (!value) {
            return { message: VALIDATION_MESSAGING.REQUIRED_FIELD_TEXT, isValid: false }
        } else {
            return { message: null, isValid: true }
        }
    }

    requiredField = (value: string): { message: string | null; isValid: boolean } => {
        if (!value) {
            return { message: VALIDATION_MESSAGING.REQUIRED_FIELD_TEXT, isValid: false }
        } else {
            return { message: null, isValid: true }
        }
    }
}
