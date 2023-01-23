import React from 'react'
import { statusIcon } from './config'
import { StatusConstants } from './list-new/Constants'
import { AppStatusType } from './types'

export default function AppStatus({ appStatus }: AppStatusType) {
    const appStatusLowerCase = appStatus?.toLowerCase()
    const isNotDeployed = appStatusLowerCase === StatusConstants.NOT_DEPLOYED.noSpaceLower
    const iconClass = isNotDeployed ? StatusConstants.NOT_DEPLOYED.lowerCase : appStatusLowerCase

    return (
        <div className="flex left">
            {iconClass && <span className={`dc__app-summary__icon icon-dim-16 mr-6 ${iconClass} ${iconClass}--node`} />}
            <p className={`dc__truncate-text dc__first-letter-capitalize  m-0`}>
                {isNotDeployed ? (
                    <span className="cn-6">{StatusConstants.NOT_DEPLOYED.normalCase}</span>
                ) : (
                    appStatus || '-'
                )}
            </p>
        </div>
    )
}
