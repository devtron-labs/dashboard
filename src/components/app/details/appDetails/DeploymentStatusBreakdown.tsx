import React from 'react'
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg'
import { ReactComponent as Check } from '../../../../assets/icons/ic-check.svg'
import { ReactComponent as Timer } from '../../../../assets/icons/ic-timer.svg'
import { ReactComponent as Question } from '../../../../assets/icons/ic-help-outline.svg'
import { ReactComponent as Error } from '../../../../assets/icons/ic-error-exclamation.svg'
import { DeploymentStatusDetailBreakdownType, DeploymentStatusDetailsBreakdownDataType } from './appDetails.type'
import moment from 'moment'
import { Moment12HourFormat } from '../../../../config'
import InfoColourBar from '../../../common/infocolourBar/InfoColourbar'
import ErrorBar from '../../../common/error/ErrorBar'
import IndexStore from '../../../v2/appDetails/index.store'

export default function DeploymentStatusDetailBreakdown({
    deploymentStatusDetailsBreakdownData,
}: DeploymentStatusDetailBreakdownType) {
    const _appDetails = IndexStore.getAppDetails()
    const renderIcon = (iconState: string): JSX.Element => {
        switch (iconState) {
            case 'success':
                return <Check className="icon-dim-20 green-tick" />
            case 'failed':
                return <Error className="icon-dim-20" />
            case 'unknown':
                return <Question className="icon-dim-20" />
            case 'inprogress':
                return <div className="pulse-highlight"></div>
            case 'unreachable':
                return <Close className="icon-dim-20" />
            default:
                return <Timer className="icon-dim-20 timer-icon" />
        }
    }
    const renderStatusDetailRow = (key: string, hideVerticalConnector?: boolean): JSX.Element => {
        return (
            <>
                <div className="deployment-status-breakdown-row pt-4 pb-4">
                    {renderIcon(deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown[key].icon)}
                    <span className="fs-13">
                        {deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown[key].displayText +
                            deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown[key].displaySubText}
                    </span>
                    <span className="dc__align-right cn-7">
                        {deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown[key].time !== ''
                            ? moment(
                                  deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown[key].time,
                                  'YYYY-MM-DDTHH:mm:ssZ',
                              ).format(Moment12HourFormat)
                            : ''}
                    </span>
                </div>
                {!hideVerticalConnector && <div className="vertical-connector"></div>}
            </>
        )
    }
    return (
        <>
            <ErrorBar appDetails={_appDetails} />

            <div className="deployment-status-breakdown-container pl-20 pr-20">
                {deploymentStatusDetailsBreakdownData.deploymentError && (
                    <InfoColourBar
                        message={deploymentStatusDetailsBreakdownData.deploymentError}
                        classname="error_bar cn-9 mb-20 lh-20"
                        Icon={Error}
                        iconClass="icon-dim-20"
                    />
                )}
                {renderStatusDetailRow('DEPLOYMENT_INITIATED')}
                {renderStatusDetailRow('GIT_COMMIT')}
                {renderStatusDetailRow('KUBECTL_APPLY')}
                {renderStatusDetailRow('APP_HEALTH', true)}
            </div>
        </>
    )
}
