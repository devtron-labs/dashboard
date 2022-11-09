import React, { useEffect, useState } from 'react'
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg'
import { ReactComponent as Check } from '../../../../assets/icons/ic-check.svg'
import { ReactComponent as Timer } from '../../../../assets/icons/ic-timer.svg'
import { ReactComponent as Question } from '../../../../assets/icons/ic-help-outline.svg'
import { ReactComponent as Error } from '../../../../assets/icons/ic-error-exclamation.svg'
import { DeploymentStatusDetailBreakdownType, DeploymentStatusDetailsBreakdownDataType } from './appDetails.type'
import moment from 'moment'
import { APP_STATUS_HEADERS, Moment12HourFormat } from '../../../../config'
import InfoColourBar from '../../../common/infocolourBar/InfoColourbar'
import { ReactComponent as DropDownIcon } from '../../../../assets/icons/appstatus/ic-chevron-down.svg'
import '../../../../components/v2/appDetails/sourceInfo/environmentStatus/environmentStatus.scss'
import { AppStatusDetailsChart } from '../../../v2/appDetails/sourceInfo/environmentStatus/AppStatusDetailModal'
import { AppStreamData } from '../../types'

export default function DeploymentStatusDetailBreakdown({
    deploymentStatusDetailsBreakdownData,streamData
}: DeploymentStatusDetailBreakdownType) {
   
    return (
        <div className="deployment-status-breakdown-container pl-20 pr-20 pt-20">
            {deploymentStatusDetailsBreakdownData.deploymentError && (
                <InfoColourBar
                    message={deploymentStatusDetailsBreakdownData.deploymentError}
                    classname="error_bar cn-9 mb-20 lh-20"
                    Icon={Error}
                    iconClass="icon-dim-20"
                />
            )}
            <RenderStatusDetailRow type = 'DEPLOYMENT_INITIATED' deploymentDetailedData={deploymentStatusDetailsBreakdownData} />
            <RenderStatusDetailRow type = 'GIT_COMMIT' deploymentDetailedData={deploymentStatusDetailsBreakdownData} />
            <RenderStatusDetailRow type = 'KUBECTL_APPLY' deploymentDetailedData={deploymentStatusDetailsBreakdownData} />
            <RenderStatusDetailRow type = 'APP_HEALTH' hideVerticalConnector={true} deploymentDetailedData={deploymentStatusDetailsBreakdownData} streamData={streamData} />
        </div>
    )
}

function RenderStatusDetailRow ({type, hideVerticalConnector, deploymentDetailedData, streamData}:{type: string, hideVerticalConnector?: boolean, deploymentDetailedData: DeploymentStatusDetailsBreakdownDataType, streamData?: AppStreamData}) {
    const [collapsed, toggleCollapsed] = useState<boolean>(deploymentDetailedData.deploymentStatusBreakdown[type].isCollapsed);

    const collapseToggler = () => {
        toggleCollapsed(!collapsed)
    }
    

    const renderDetailedData = () => {
        return !collapsed ? (
            <div className='bcn-0 en-2 detail-tab_border pr-8 pl-8 pt-12 pb-12'>
                <div className=''>{deploymentDetailedData.deploymentStatusBreakdown['KUBECTL_APPLY'].kubeList?.map((items) => 
                    <div className='flex left lh-20 mb-8'>{renderIcon(items.icon)}<span className='ml-12'>{items.message}</span></div>
                )}
                </div>
                {deploymentDetailedData.deploymentStatusBreakdown[type].resourceDetails?.length ? <div className='pl-32 pr-32'>
                    <div className="app-status-row dc__border-bottom pt-8 pb-8">
                        {APP_STATUS_HEADERS.map((headerKey, index) => (
                            <div className="fs-13 fw-6 cn-7" key={`header_${index}`}>
                                {headerKey}
                            </div>
                        ))}
                    </div>
                    <div className="resource-list fs-13">
                        {deploymentDetailedData.deploymentStatusBreakdown[type].resourceDetails.map((nodeDetails) => (
                            <div
                                className="app-status-row pt-8 pb-8"
                                key={`${nodeDetails.resourceKind}/${nodeDetails.resourceName}`}
                            >
                                <div>{nodeDetails.resourceKind}</div>
                                <div>{nodeDetails.resourceName}</div>
                                <div
                                    className={`app-summary__status-name f-${
                                        nodeDetails.resourceStatus ? nodeDetails.resourceStatus.toLowerCase() : ''
                                    }`}
                                >
                                    {nodeDetails.resourceStatus}
                                </div>
                                <div>{nodeDetails.statusMessage}</div>
                            </div>
                        ))}
                    </div>
                </div> : null}
            </div>
        ) : null
    }

    const renderDetailChart = () => {
        return !collapsed && <div className='bcn-0 en-2 detail-tab_border pb-12'>
            <AppStatusDetailsChart appStreamData={streamData} filterRemoveHealth={true} />
        </div>
    }

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
            case 'loading':
                return  <div
                className={`dc__app-summary__icon icon-dim-16 mr-6 progressing progressing--node`}
            ></div>
            default:
                return <Timer className="icon-dim-20 timer-icon" />
        }
    }
    return (
        <>
            <div className={`deployment-status-breakdown-row pt-8 pb-8 pl-8 pr-8 bcn-0 ${collapsed ? 'br-4' : 'border-collapse'} en-2`}>
                {renderIcon(deploymentDetailedData.deploymentStatusBreakdown[type].icon)}
                <span className="ml-12 mr-12 fs-13">
                    {deploymentDetailedData.deploymentStatusBreakdown[type].displayText +
                        deploymentDetailedData.deploymentStatusBreakdown[type].displaySubText}
                </span>

                {deploymentDetailedData.deploymentStatusBreakdown[type].time !== '' && (
                    <span className="cg-7 pl-8 pr-8 pt-4 pb-4 br-12 bcg-1">
                        {moment(
                            deploymentDetailedData.deploymentStatusBreakdown[type].time,
                            'YYYY-MM-DDTHH:mm:ssZ',
                        ).format(Moment12HourFormat)}
                    </span>
                )}
                {((type === 'KUBECTL_APPLY' || type === 'APP_HEALTH') && deploymentDetailedData.deploymentStatusBreakdown[type].icon !== 'success') && <DropDownIcon
                style={{ marginLeft: 'auto', ['--rotateBy' as any]: `${180 * Number(!collapsed)}deg` }}
                className="icon-dim-24 rotate pointer"
                onClick={collapseToggler}
            />}
            </div>
            {deploymentDetailedData.deploymentError && <div className='flex pt-8 pl-12 pb-8 lh-20 bcr-1'>{deploymentDetailedData.deploymentError}</div>}
            {type === 'KUBECTL_APPLY' && renderDetailedData()}
            {type === 'APP_HEALTH' && renderDetailChart()}
            {!hideVerticalConnector && <div className="vertical-connector"></div>}
        </>
    )
}