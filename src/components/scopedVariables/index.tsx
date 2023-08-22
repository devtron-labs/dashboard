import React, { useState } from 'react'
import SavedVariablesView from './SavedVariables'
import UploadScopedVariables from './UploadScopedVariables'
import './styles.scss'

const ScopedVariables = () => {
    const [scopedVariables, setScopedVariables] = useState(null)

    if (scopedVariables)
        return <SavedVariablesView scopedVariables={scopedVariables} setScopedVariables={setScopedVariables} />

    return <UploadScopedVariables setScopedVariables={setScopedVariables} />
}

export default ScopedVariables
