import React from 'react'
import { ReactComponent as Error } from '../../../../assets/icons/ic-error-exclamation.svg'
import { DeploymentStatusDetailBreakdownType } from './appDetails.type'
import { TIMELINE_STATUS, URLS } from '../../../../config'
import '../../../../components/v2/appDetails/sourceInfo/environmentStatus/environmentStatus.scss'
import { useRouteMatch } from 'react-router-dom'
import ErrorBar from '../../../common/error/ErrorBar'
import IndexStore from '../../../v2/appDetails/index.store'
import { DeploymentStatusDetailRow } from './DeploymentStatusDetailRow'

export default function DeploymentStatusDetailBreakdown({
    deploymentStatusDetailsBreakdownData,
    streamData,
}: DeploymentStatusDetailBreakdownType) {
    const _appDetails = IndexStore.getAppDetails()
    const { url } = useRouteMatch()

    return (
        <>
            {!url.includes(`/${URLS.APP_CD_DETAILS}`) && <ErrorBar appDetails={_appDetails} />}
            <div className="deployment-status-breakdown-container pl-20 pr-20 pt-20 pb-20">
                <DeploymentStatusDetailRow
                    type={TIMELINE_STATUS.DEPLOYMENT_INITIATED}
                    deploymentDetailedData={deploymentStatusDetailsBreakdownData}
                />
                <ErrorInfoStatusBar
                    type={TIMELINE_STATUS.GIT_COMMIT}
                    nonDeploymentError={deploymentStatusDetailsBreakdownData.nonDeploymentError}
                    errorMessage={deploymentStatusDetailsBreakdownData.deploymentError}
                />
                <DeploymentStatusDetailRow
                    type={TIMELINE_STATUS.GIT_COMMIT}
                    deploymentDetailedData={deploymentStatusDetailsBreakdownData}
                />
                <ErrorInfoStatusBar
                    type={TIMELINE_STATUS.KUBECTL_APPLY}
                    nonDeploymentError={deploymentStatusDetailsBreakdownData.nonDeploymentError}
                    errorMessage={deploymentStatusDetailsBreakdownData.deploymentError}
                />
                <DeploymentStatusDetailRow
                    type={TIMELINE_STATUS.KUBECTL_APPLY}
                    deploymentDetailedData={deploymentStatusDetailsBreakdownData}
                />
                <DeploymentStatusDetailRow
                    type={TIMELINE_STATUS.APP_HEALTH}
                    hideVerticalConnector={true}
                    deploymentDetailedData={deploymentStatusDetailsBreakdownData}
                    streamData={streamData}
                />
            </div>
        </>
    )
}

function ErrorInfoStatusBar({ nonDeploymentError, type, errorMessage }) {
    return (
        nonDeploymentError === type && (
            <>
                <div className="bcr-1 flex left er-2 br-4 p-8">
                    <Error className="icon-dim-20 mr-8" />
                    {errorMessage}
                </div>
                <div className="vertical-connector"></div>
            </>
        )
    )
}
