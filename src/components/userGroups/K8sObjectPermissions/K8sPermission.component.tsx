import React from 'react'
import { K8S_EMPTY_GROUP } from '../../ResourceBrowser/Constants'

export const resourceKindOptionLabel = (option): JSX.Element => {
    return (
        <div className="flex left column">
            <span className="w-100 dc__ellipsis-right">{option.label}</span>
            {option.value !== '*' && <small className="cn-6">{option.gvk?.Group || K8S_EMPTY_GROUP}</small>}
        </div>
    )
}

