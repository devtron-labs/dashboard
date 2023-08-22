import React from 'react'
import { ScopedVariablesInputI } from './types'

const ScopedVariablesInput = ({ handleFileUpload, children }: ScopedVariablesInputI) => {
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

            <label
                htmlFor="scoped-variables-input"
                className="flex column center"
                style={{ cursor: 'pointer', width: '100%', height: '100%', margin: '0px' }}
            >
                {children}
            </label>
        </>
    )
}

export default ScopedVariablesInput
