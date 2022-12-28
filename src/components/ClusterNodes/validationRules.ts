import { PATTERNS } from '../../config'

export class ValidationRules {
    taintKey = (key: string): { message: string | null; isValid: boolean } => {
        const keyRegex = new RegExp(PATTERNS.KUBERNETES_KEY)

        if (!key) {
            return { message: 'Key is required', isValid: false }
        } else if (!keyRegex.test(key) || key.length > 253) {
            return { message: 'Invalid key', isValid: false }
        } else {
            return { message: null, isValid: true }
        }
    }

    taintValue = (value: string) => {
        const valueRegex = new RegExp(PATTERNS.KUBERNETES_VALUE)
        if (value) {
            if (value.length > 63) {
                return { message: '63 char is allowed', isValid: false }
            } else if (!valueRegex.test(value)) {
                return { message: `Invalid value`, isValid: false }
            }
        }
        return { message: null, isValid: true }
    }
}
