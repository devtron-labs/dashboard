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
        let str = '^[a-z][a-z0-9-.]+[a-z0-9]$'
        let re = new RegExp(str)
        if (!value['name'] && !value['value'] && !value['description']) {
            return { message: 'Please complete or remove this variable', isValid: false }
        } else if (!value['name'] && !value['value']) {
            return { message: 'Variable Name and Value both are required field', isValid: false }
        } else if (!value['name']) {
            return { message: 'Variable Name is required field', isValid: false }
        } else if (!value['value']) {
            return { message: 'Variable Value is required field', isValid: false }
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
