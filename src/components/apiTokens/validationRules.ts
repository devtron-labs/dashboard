import { PATTERNS } from '../../config'

export class ValidationRules {
    name = (value: string): { isValid: boolean; message: string } => {
        let re = PATTERNS.API_TOKEN
        let regExp = new RegExp(re)
        let test = regExp.test(value)
        if (value.length === 0) return { isValid: false, message: 'This is a required field' }
        if (value.length < 3) return { isValid: false, message: 'Atleast 3 characters required' }
        if (!test || value.length > 50) {
            return {
                isValid: false,
                message: `Max 50 characters allowed; Start and end with lowercase; Use (a-z), (0-9), (-), (_)`,
            }
        } else {
            return { message: null, isValid: true }
        }
    }

    description = (value: string): { isValid: boolean; message: string } => {
        if (value.length > 350) return { isValid: false, message: `Max 350 characters allowed` }
        else {
            return { message: null, isValid: true }
        }
    }

    expireAtInMs = (value: number): { isValid: boolean; message: string } => {
        if (!value) {
            return { message: 'This is required field', isValid: false }
        } else {
            return { message: null, isValid: true }
        }
    }

    requiredField = (value: string): { message: string | null; isValid: boolean } => {
        if (!value) {
            return { message: 'This is required field', isValid: false }
        } else {
            return { message: null, isValid: true }
        }
    }
}
