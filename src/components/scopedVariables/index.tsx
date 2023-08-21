import React, { useState } from 'react'
import UploadScopedVariables from './UploadScopedVariables'
import './styles.scss'

const ScopedVariables = () => {
    const [ScopedVariables, setScopedVariables] = useState(null)
    if(ScopedVariables) return (
        <></>
    )
    return <UploadScopedVariables setScopedVariables={setScopedVariables} />
}

export default ScopedVariables
