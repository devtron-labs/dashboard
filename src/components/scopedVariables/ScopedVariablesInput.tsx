import React from 'react'
import { ScopedVariablesInputProps } from './types'

export default function ScopedVariablesInput({ handleFileUpload, children }: ScopedVariablesInputProps) {
    return (
        <>
            <input
                type="file"
                id="scoped-variables-input"
                accept=".yaml, .yml, .json"
                style={{
                    display: 'none',
                }}
                onChange={handleFileUpload}
            />

            <label htmlFor="scoped-variables-input" className="flex column center cursor m-0 h-100 w-100">
                {children}
            </label>
        </>
    )
}
