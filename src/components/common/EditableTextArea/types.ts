interface ValidationRule<T> {
    /**
     * Value against which the input should be validated
     */
    value: T
    /**
     * Validation message when the validation fails
     */
    message: string
}

export interface EditableTextAreaProps {
    placeholder?: string
    rows: number
    updateContent: (value: string) => Promise<void>
    initialText?: string
    validations?: {
        maxLength?: ValidationRule<number>
    }
}

export interface Error {
    isValid: boolean
    message: string
}
