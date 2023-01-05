import { PATTERNS } from '../../../config'

export class ValidationRules {
    taintKey = (key: string): { message: string | null; isValid: boolean } => {
        const keyPrefixRegex = new RegExp(PATTERNS.KUBERNETES_KEY_PREFIX)
        const keyNameRegex = new RegExp(PATTERNS.KUBERNETES_KEY_NAME)

        if (!key) {
            return { message: 'Key is required', isValid: false }
        } else {
            if (key.length > 253) {
                return { message: 'Maximum 253 chars are allowed', isValid: false }
            } else if (key.indexOf('/') !== -1) {
                const keyArr = key.split('/')
                if (keyArr.length > 2) {
                    return { message: 'Maximum one ( / ) allowed', isValid: false }
                } else if (!keyPrefixRegex.test(keyArr[0])) {
                    return { message: 'Invalid prefix in key', isValid: false }
                } else if (!keyNameRegex.test(keyArr[1])) {
                    return { message: 'Invalid name in key', isValid: false }
                }
            } else if (!keyNameRegex.test(key)) {
                return { message: 'Invalid key', isValid: false }
            }
        }
        return { message: null, isValid: true }
    }

    taintValue = (value: string) => {
        const valueRegex = new RegExp(PATTERNS.KUBERNETES_VALUE)
        if (value) {
            if (value.length > 63) {
                return { message: 'Maximum 63 chars are allowed', isValid: false }
            } else if (!valueRegex.test(value)) {
                return { message: 'Invalid value', isValid: false }
            }
        }
        return { message: null, isValid: true }
    }
}
