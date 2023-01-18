import React from 'react'
import { AppStatusType } from './types'

export default function AppStatus({ appStatus }: AppStatusType) {
    const appStatusLowerCase = appStatus?.toLowerCase()
    const isNotDeployed = appStatusLowerCase === 'notdeployed'
    const iconClass = isNotDeployed ? 'not-deployed' : appStatusLowerCase

    return (
        <div className="flex left">
            <span className={`dc__app-summary__icon icon-dim-16 mr-6 ${iconClass} ${iconClass}--node`} />
            <p className={`dc__truncate-text  m-0`}>
                {isNotDeployed ? <span className="cn-6">Not deployed</span> : appStatus || '-'}
            </p>
        </div>
    )
}
