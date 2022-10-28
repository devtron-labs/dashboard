export class ValidationRules {

    port = (value: number): { isValid: boolean; message: string } => {
        if (!value || value === 0) {
            return { message: 'This is required field', isValid: false }
        } else {
            return { message: null, isValid: true }
        }
    }

    envVariable = (value: Object): { message: string | null; isValid: boolean } => {
        if (!value['key'] && value['value']) {
            return { message: 'Key is required field', isValid: false }
        } else if (value['key'] && !value['value']) {
          return { message: 'Value is required field', isValid: false }
      } else {
            return { message: null, isValid: true }
        }
    }
}
