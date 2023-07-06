import React from 'react'
import { ReactComponent as Error } from '../../../../assets/icons/ic-error-exclamation.svg'
import { ErrorInfoStatusBarType } from './appDetails.type'

export function ErrorInfoStatusBar({
    nonDeploymentError,
    type,
    errorMessage,
    hideVerticalConnector,
    hideErrorIcon
}: ErrorInfoStatusBarType) {
    return nonDeploymentError === type ? (
        <>
            <div className={`bcr-1 flex left ${!hideErrorIcon ? 'er-2 br-4 bw-1' : '' } p-8`}>
              {!hideErrorIcon &&  <Error className="icon-dim-20 mr-8" />}
                {errorMessage}
            </div>
            {!hideVerticalConnector && <div className="vertical-connector" />}
        </>
    ) : null
}
