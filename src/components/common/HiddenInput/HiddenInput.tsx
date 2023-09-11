import React from 'react'
import HiddenInputProps from './types'

export default function ScopedVariablesInput({ handleFileUpload, children, id }: HiddenInputProps) {
    return (
        <>
            <input
                type="file"
                id={id}
                accept=".yaml, .yml, .json"
                style={{
                    display: 'none',
                }}
                onChange={handleFileUpload}
            />

            <label htmlFor={id} className="flex column center cursor m-0 h-100 w-100">
                {children}
            </label>
        </>
    )
}
