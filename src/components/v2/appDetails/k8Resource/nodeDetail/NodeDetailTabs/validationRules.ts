export class ValidationRules {
    name = (value: string): { isValid: boolean; message: string } => {
        if (value.length === 0) return { isValid: false, message: 'This is a required field' }
        else {
            return { message: null, isValid: true }
        }
    }
    image = (value: string): { isValid: boolean; message: string } => {
      if (value.length === 0) return { isValid: false, message: 'This is a required field' }
      else {
          return { message: null, isValid: true }
      }
  }
  targetContainer = (value: string): { isValid: boolean; message: string } => {
    if (value.length === 0) return { isValid: false, message: 'This is a required field' }
    else {
        return { message: null, isValid: true }
    }
}
}
