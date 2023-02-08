import React from 'react'
import { StatusConstants } from './list-new/Constants'
import { AppStatusType } from './types'
import { ReactComponent as InfoIcon } from '../../assets/icons/ic-info-outlined.svg'
import Tippy from '@tippyjs/react'

export default function AppStatus({ appStatus }: AppStatusType) {
    const appStatusLowerCase = appStatus?.toLowerCase()
    const isNotDeployed = appStatusLowerCase === StatusConstants.NOT_DEPLOYED.noSpaceLower
    const iconClass = isNotDeployed ? StatusConstants.NOT_DEPLOYED.lowerCase : appStatusLowerCase

    return (
        <div className="flex left">
            {iconClass ? (
                <span className={`dc__app-summary__icon icon-dim-16 mr-6 ${iconClass} ${iconClass}--node`} />
            ) : (
                <Tippy
                    className="default-tt w-200"
                    arrow={false}
                    placement="top"
                    content="To fetch app status for GitOps based deployments open the app detail page"
                >
                    <InfoIcon className="icon-dim-16 mr-6 fcn-6" />
                </Tippy>
            )}
            <p className="dc__truncate-text dc__first-letter-capitalize  m-0">
                {isNotDeployed ? (
                    <span className="cn-6">{StatusConstants.NOT_DEPLOYED.normalCase}</span>
                ) : (
                    appStatus || '-'
                )}
            </p>
        </div>
    )
}
