import React from 'react'
import HiddenInputProps from './types'

export default function HiddenInput({ handleFileUpload, children, id, accessibleFileExtensions }: HiddenInputProps) {
    
    return (
        <>
            <input
                type="file"
                id={id}
                accept={accessibleFileExtensions ?? "" }
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
