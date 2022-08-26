import React from 'react'
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg'
import { ReactComponent as Check } from '../../../../assets/icons/ic-check.svg'
import { ReactComponent as Timer } from '../../../../assets/icons/ic-timer.svg'
import { ReactComponent as Question } from '../../../../assets/icons/ic-help-outline.svg'
import { ReactComponent as Error } from '../../../../assets/icons/ic-error-exclamation.svg'
import { handleUTCTime } from '../../../common'
import { DeploymentStatusDetailsBreakdownDataType } from './appDetails.type'

export default function DeploymentStatusDetailBreakdown({
    deploymentStatusDetailsBreakdownData,
}: {
    deploymentStatusDetailsBreakdownData: DeploymentStatusDetailsBreakdownDataType
}) {
    const renderIcon = (iconState: string): JSX.Element => {
        if (iconState === 'success') {
            return <Check className="icon-dim-20 green-tick" />
        } else if (iconState === 'failed') {
            return <Error className="icon-dim-20" />
        } else if (iconState === 'unknown') {
            return <Question className="icon-dim-20" />
        } else if (iconState === 'inprogress') {
            return <div className="pulse-highlight"></div>
        } else if (iconState === 'unreachable') {
          return <Close className="icon-dim-20" />
        }
        return <Timer className="icon-dim-20" />
    }
    return (
        <div className="deployment-status-breakdown-container pl-20 pr-20">
            <div className="deployment-status-breakdown-row">
                {renderIcon(deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.DEPLOYMENT_INITIATED.icon)}
                <span>
                    {deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.DEPLOYMENT_INITIATED.displayText +
                        deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.DEPLOYMENT_INITIATED
                            .displaySubText}
                </span>
                <span className="align-right">
                    {handleUTCTime(
                        deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.DEPLOYMENT_INITIATED.time,
                        true,
                    )}
                </span>
            </div>
            <div className="vertical-connector"></div>
            <div className="deployment-status-breakdown-row">
                {renderIcon(deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.GIT_COMMIT.icon)}
                <span>
                    {deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.GIT_COMMIT.displayText +
                        deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.GIT_COMMIT.displaySubText}
                </span>
                <span className="align-right">
                    {handleUTCTime(
                        deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.GIT_COMMIT.time,
                        true,
                    )}
                </span>
            </div>
            <div className="vertical-connector"></div>
            <div className="deployment-status-breakdown-row">
                {renderIcon(deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.KUBECTL_APPLY.icon)}
                <span>
                    {deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.KUBECTL_APPLY.displayText +
                        deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.KUBECTL_APPLY.displaySubText}
                </span>
                <span className="align-right">
                    {handleUTCTime(
                        deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.KUBECTL_APPLY.time,
                        true,
                    )}
                </span>
            </div>
            <div className="vertical-connector"></div>
            <div className="deployment-status-breakdown-row">
                {renderIcon(deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.APP_HEALTH.icon)}
                <span>
                    {deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.APP_HEALTH.displayText +
                        deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.APP_HEALTH.displaySubText}
                </span>
                <span className="align-right">
                    {handleUTCTime(
                        deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.APP_HEALTH.time,
                        true,
                    )}
                </span>
            </div>
        </div>
    )
}
