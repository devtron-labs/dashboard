import React from 'react'
import { components } from 'react-select'

export const resourceKindOptionLabel = (option): JSX.Element => {
    return (
        <div className="flex left column">
            <span className="w-100 dc__ellipsis-right">{option.label}</span>
            {option.value !== '*' && <small className="cn-6">{option.gvk?.Group || 'k8sEmptyGroup'}</small>}
        </div>
    )
}

