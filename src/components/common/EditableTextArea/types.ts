export interface EditableTextAreaProps {
    placeholder?: string
    rows: number
    updateContent: (value: string) => Promise<void>
    initialText?: string
}
