import { BASIC_FIELDS } from './constants'

export class ValidationRules {
    port = (value: number): { isValid: boolean; message: string } => {
        if (!value || value === 0) {
            return { message: 'This is required field', isValid: false }
        } else {
            return { message: null, isValid: true }
        }
    }

    envVariable = (value: Object): { message: string | null; isValid: boolean } => {
        if (!value[BASIC_FIELDS.NAME] && value[BASIC_FIELDS.VALUE]) {
            return { message: 'Name is required field', isValid: false }
        } else if (value[BASIC_FIELDS.NAME] && !value[BASIC_FIELDS.VALUE]) {
            return { message: 'Value is required field', isValid: false }
        } else {
            return { message: null, isValid: true }
        }
    }
}
