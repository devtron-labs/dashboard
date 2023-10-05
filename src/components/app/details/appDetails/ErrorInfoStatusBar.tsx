import React from 'react'
import { ReactComponent as Error } from '../../../../assets/icons/ic-error-exclamation.svg'
import { ErrorInfoStatusBarType } from './appDetails.type'
import { TIMELINE_STATUS } from '../../../../config'

export function ErrorInfoStatusBar({
    nonDeploymentError,
    type,
    errorMessage,
    hideVerticalConnector,
    hideErrorIcon
}: ErrorInfoStatusBarType) {
    return nonDeploymentError === type ? (
        <>
            <div
                className={`bcr-1 ${
                    type === TIMELINE_STATUS.HELM_MANIFEST_PUSHED_TO_HELM_REPO ? 'fs-13' : 'flex left'
                } ${!hideErrorIcon ? 'er-2 br-4 bw-1' : ''} p-8`}
            >
                {!hideErrorIcon && <Error className="icon-dim-20 mr-8" />}
                {errorMessage}
                {type === TIMELINE_STATUS.HELM_MANIFEST_PUSHED_TO_HELM_REPO && (
                    <ol className="m-0 pl-20">
                        <li>Ensure provided repository path is valid</li>
                        <li>Check if credentials provided for OCI registry are valid and have PUSH permission</li>
                    </ol>
                )}
            </div>
            {!hideVerticalConnector && <div className="vertical-connector" />}
        </>
    ) : null
}
