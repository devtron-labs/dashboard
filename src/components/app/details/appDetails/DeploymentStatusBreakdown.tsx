import React from 'react'
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg'
import { ReactComponent as Check } from '../../../../assets/icons/ic-check.svg'
import { ReactComponent as Timer } from '../../../../assets/icons/ic-timer.svg'
import { ReactComponent as Question } from '../../../../assets/icons/ic-help-outline.svg'
import { ReactComponent as Error } from '../../../../assets/icons/ic-error-exclamation.svg'
import { DeploymentStatusDetailsBreakdownDataType } from './appDetails.type'
import moment from 'moment'
import { Moment12HourFormat } from '../../../../config'

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
        return <Timer className="icon-dim-20 timer-icon" />
    }
    return (
        <div className="deployment-status-breakdown-container pl-20 pr-20">
            <div className="deployment-status-breakdown-row pt-4 pb-4">
                {renderIcon(deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.DEPLOYMENT_INITIATED.icon)}
                <span className="fs-13">
                    {deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.DEPLOYMENT_INITIATED.displayText +
                        deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.DEPLOYMENT_INITIATED
                            .displaySubText}
                </span>
                <span className="align-right cn-7">
                    {deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.DEPLOYMENT_INITIATED.time !== ''
                        ? moment(
                              deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.DEPLOYMENT_INITIATED.time,
                              'YYYY-MM-DDTHH:mm:ssZ',
                          ).format(Moment12HourFormat)
                        : ''}
                </span>
            </div>
            <div className="vertical-connector"></div>
            <div className="deployment-status-breakdown-row pt-4 pb-4">
                {renderIcon(deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.GIT_COMMIT.icon)}
                <span className="fs-13">
                    {deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.GIT_COMMIT.displayText +
                        deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.GIT_COMMIT.displaySubText}
                </span>
                <span className="align-right cn-7">
                    {deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.GIT_COMMIT.time !== ''
                        ? moment(
                              deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.GIT_COMMIT.time,
                              'YYYY-MM-DDTHH:mm:ssZ',
                          ).format(Moment12HourFormat)
                        : ''}
                </span>
            </div>
            <div className="vertical-connector"></div>
            <div className="deployment-status-breakdown-row pt-4 pb-4">
                {renderIcon(deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.KUBECTL_APPLY.icon)}
                <span className="fs-13">
                    {deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.KUBECTL_APPLY.displayText +
                        deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.KUBECTL_APPLY.displaySubText}
                </span>
                <span className="align-right cn-7">
                    {deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.KUBECTL_APPLY.time !== '' &&
                    deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.KUBECTL_APPLY.icon !== 'inprogress'
                        ? moment(
                              deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.KUBECTL_APPLY.time,
                              'YYYY-MM-DDTHH:mm:ssZ',
                          ).format(Moment12HourFormat)
                        : ''}
                </span>
            </div>
            <div className="vertical-connector"></div>
            <div className="deployment-status-breakdown-row pt-4 pb-4">
                {renderIcon(deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.APP_HEALTH.icon)}
                <span className="fs-13">
                    {deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.APP_HEALTH.displayText +
                        deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.APP_HEALTH.displaySubText}
                </span>
                <span className="align-right cn-7">
                    {deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.APP_HEALTH.time !== ''
                        ? moment(
                              deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.APP_HEALTH.time,
                              'YYYY-MM-DDTHH:mm:ssZ',
                          ).format(Moment12HourFormat)
                        : ''}
                </span>
            </div>
        </div>
    )
}
