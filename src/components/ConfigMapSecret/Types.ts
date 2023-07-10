export interface KeyValueInputInterface {
    keyLabel: string
    valueLabel: string
    k: string
    v: string
    index: number
    onChange: any
    onDelete: any
    keyError?: string
    valueError?: string
    valueType?: string
}

export interface ResizableTextareaProps {
    minHeight?: number
    maxHeight?: number
    value?: string
    onChange?: (e) => void
    onBlur?: (e) => void
    onFocus?: (e) => void
    className?: string
    placeholder?: string
    lineHeight?: number
    padding?: number
    disabled?: boolean
    name?: string
    dataTestId?: string
}

export interface keyValueYaml {
    yaml: string
    handleYamlChange: any
    error: string
}
export interface KeyValue {
    k: string
    v: string
    keyError?: string
    valueError?: string
}
export interface KeyValueValidated {
    isValid: boolean
    arr: KeyValue[]
}
