import { CSSProperties } from 'react'

// Define the function to get styles for the code editor
export const getCodeEditorTextStyles = (): CSSProperties => {
    return {
        resize: 'none',
        lineHeight: 1.4,
        border: 'none',
        padding: '0 35px',
        overflow: 'hidden',
        color: '#f32e2e',
        fontSize: '14px',
        fontFamily: 'Consolas, "Courier New", monospace',
    }
}
