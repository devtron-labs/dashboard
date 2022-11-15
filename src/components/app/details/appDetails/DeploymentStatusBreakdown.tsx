import React, { useEffect, useRef, useState } from 'react'
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg'
import { ReactComponent as Check } from '../../../../assets/icons/ic-check.svg'
import { ReactComponent as Timer } from '../../../../assets/icons/ic-timer.svg'
import { ReactComponent as Question } from '../../../../assets/icons/ic-help-outline.svg'
import { ReactComponent as Error } from '../../../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as Disconnect } from '../../../../assets/icons/ic-disconnected.svg'
import { DeploymentStatusDetailBreakdownType, DeploymentStatusDetailsBreakdownDataType } from './appDetails.type'
import moment from 'moment'
import { APP_STATUS_HEADERS, Moment12HourFormat, URLS } from '../../../../config'
import InfoColourBar from '../../../common/infocolourBar/InfoColourbar'
import { ReactComponent as DropDownIcon } from '../../../../assets/icons/appstatus/ic-chevron-down.svg'
import '../../../../components/v2/appDetails/sourceInfo/environmentStatus/environmentStatus.scss'
import { AppStatusDetailsChart } from '../../../v2/appDetails/sourceInfo/environmentStatus/AppStatusDetailModal'
import { AppStreamData } from '../../types'
import { getManualSync } from '../../service'
import { showError } from '../../../common'
import { useParams, useRouteMatch } from 'react-router-dom'
import { ShowMoreText } from '../../../common/ShowMoreText'
import ErrorBar from '../../../common/error/ErrorBar'
import IndexStore from '../../../v2/appDetails/index.store'

export default function DeploymentStatusDetailBreakdown({
    deploymentStatusDetailsBreakdownData,
    streamData,
}: DeploymentStatusDetailBreakdownType) {
    const _appDetails = IndexStore.getAppDetails()
    const { url } = useRouteMatch()
    
    return (<>
        {!url.includes(`/${URLS.APP_CD_DETAILS}`) && <ErrorBar appDetails={_appDetails} />}
        <div className="deployment-status-breakdown-container pl-20 pr-20 pt-20 pb-20">
            <RenderStatusDetailRow
                type="DEPLOYMENT_INITIATED"
                deploymentDetailedData={deploymentStatusDetailsBreakdownData}
            />
            <ErrorInfoStatusBar
                type="GIT_COMMIT"
                nonDeploymentError={deploymentStatusDetailsBreakdownData.nonDeploymentError}
                errorMessage={deploymentStatusDetailsBreakdownData.deploymentError}
            />
            <RenderStatusDetailRow type="GIT_COMMIT" deploymentDetailedData={deploymentStatusDetailsBreakdownData} />
            <ErrorInfoStatusBar
                type="KUBECTL_APPLY"
                nonDeploymentError={deploymentStatusDetailsBreakdownData.nonDeploymentError}
                errorMessage={deploymentStatusDetailsBreakdownData.deploymentError}
            />
            <RenderStatusDetailRow type="KUBECTL_APPLY" deploymentDetailedData={deploymentStatusDetailsBreakdownData} />
            <RenderStatusDetailRow
                type="APP_HEALTH"
                hideVerticalConnector={true}
                deploymentDetailedData={deploymentStatusDetailsBreakdownData}
                streamData={streamData}
            />
        </div></>
    )
}

function RenderStatusDetailRow({
    type,
    hideVerticalConnector,
    deploymentDetailedData,
    streamData,
}: {
    type: string
    hideVerticalConnector?: boolean
    deploymentDetailedData: DeploymentStatusDetailsBreakdownDataType
    streamData?: AppStreamData
}) {
    const { appId, envId } = useParams<{ appId: string; envId: string }>()
    const [collapsed, toggleCollapsed] = useState<boolean>(
        deploymentDetailedData.deploymentStatusBreakdown[type].isCollapsed,
    )

    async function manualSyncData() {
        try {
            const response = await getManualSync({ appId, envId })
        } catch (error) {
            showError(error)
        }
    }

    const collapseToggler = () => {
        toggleCollapsed(!collapsed)
    }

    const renderDetailedData = () => {
        return !collapsed ? (
            <div className="bcn-0 en-2 detail-tab_border">
                {deploymentDetailedData.deploymentStatusBreakdown[type].timelineStatus && (
                    <div
                        className={`flex left pt-8 pl-12 pb-8 lh-20 ${
                            deploymentDetailedData.deploymentStatusBreakdown[type].icon !== 'inprogress'
                                ? 'bcr-1'
                                : 'bcy-2'
                        }`}
                    >
                        {deploymentDetailedData.deploymentStatusBreakdown[type].timelineStatus}
                        {(deploymentDetailedData.deploymentStatus === 'timed_out' ||
                            deploymentDetailedData.deploymentStatus === 'unable_to_fetch') && (
                            <span className="cb-5 fw-6 ml-8 cursor" onClick={manualSyncData}>
                                Try now
                            </span>
                        )}
                    </div>
                )}
                {type === 'KUBECTL_APPLY' && (
                    <div className="pr-8 pl-8 pt-12 pb-12">
                        <div className="">
                            {deploymentDetailedData.deploymentStatusBreakdown['KUBECTL_APPLY'].kubeList?.map(
                                (items) => (
                                    <div className="flex left lh-20 mb-8">
                                        {renderIcon(items.icon)}
                                        <span className="ml-12">{items.message}</span>
                                    </div>
                                ),
                            )}
                        </div>
                        {deploymentDetailedData.deploymentStatusBreakdown[type].resourceDetails?.length ? (
                            <div className="pl-32">
                                <div className="app-status-row dc__border-bottom pt-8 pb-8">
                                    {APP_STATUS_HEADERS.map((headerKey, index) => (
                                        <div className="fs-13 fw-6 cn-7" key={`header_${index}`}>
                                            {headerKey}
                                        </div>
                                    ))}
                                </div>
                                <div className="resource-list fs-13">
                                    {deploymentDetailedData.deploymentStatusBreakdown[type].resourceDetails.map(
                                        (nodeDetails) => (
                                            <div
                                                className="app-status-row pt-8 pb-8"
                                                key={`${nodeDetails.resourceKind}/${nodeDetails.resourceName}`}
                                            >
                                                <div>{nodeDetails.resourceKind}</div>
                                                <div>{nodeDetails.resourceName}</div>
                                                <div
                                                    className={`app-summary__status-name f-${
                                                        nodeDetails.resourceStatus
                                                            ? nodeDetails.resourceStatus.toLowerCase()
                                                            : ''
                                                    }`}
                                                >
                                                    {nodeDetails.resourceStatus}
                                                </div>
                                                <ShowMoreText text={nodeDetails.statusMessage} />
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}
            </div>
        ) : null
    }

    const renderDetailChart = () => {
        return (
            !collapsed && (
                <div className="bcn-0 en-2 detail-tab_border">
                    {deploymentDetailedData.deploymentStatusBreakdown[type].timelineStatus && (
                        <div
                            className={`flex left pt-8 pl-12 pb-8 lh-20 ${
                                deploymentDetailedData.deploymentStatusBreakdown[type].icon !== 'inprogress'
                                    ? 'bcr-1'
                                    : 'bcy-2'
                            }`}
                        >
                            {deploymentDetailedData.deploymentStatusBreakdown[type].timelineStatus}
                            {(deploymentDetailedData.deploymentStatus === 'timed_out' ||
                                deploymentDetailedData.deploymentStatus === 'unable_to_fetch') && (
                                <span className="cb-5 fw-6 ml-8 cursor" onClick={manualSyncData}>
                                    Try now
                                </span>
                            )}
                        </div>
                    )}
                    <div className="pb-12">
                        <AppStatusDetailsChart appStreamData={streamData} filterRemoveHealth={true} />
                    </div>
                </div>
            )
        )
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
                return (
                    <div className="icon-dim-20">
                        <div className="pulse-highlight"></div>
                    </div>
                )
            case 'unreachable':
                return <Close className="icon-dim-20" />
            case 'loading':
                return <div className={`dc__app-summary__icon icon-dim-16 mr-6 progressing progressing--node`}></div>
            case 'disconnect':
                return <Disconnect className="icon-dim-20" />
            default:
                return <Timer className="icon-dim-20 timer-icon" />
        }
    }
    return (
        <>
            <div
                className={`deployment-status-breakdown-row pt-8 pb-8 pl-8 pr-8 bcn-0 ${
                    collapsed ? 'br-4' : 'border-collapse'
                } en-2`}
            >
                {renderIcon(deploymentDetailedData.deploymentStatusBreakdown[type].icon)}
                <span className="ml-12 mr-12 fs-13">
                    {deploymentDetailedData.deploymentStatusBreakdown[type].displayText +
                        deploymentDetailedData.deploymentStatusBreakdown[type].displaySubText}
                </span>

                {deploymentDetailedData.deploymentStatusBreakdown[type].time !== '' &&
                    deploymentDetailedData.deploymentStatusBreakdown[type].icon !== 'inprogress' && (
                        <span
                            className={`pl-8 pr-8 pt-4 pb-4 br-12 ${
                                deploymentDetailedData.deploymentStatusBreakdown[type].icon === 'failed'
                                    ? 'bcr-1 cr-5'
                                    : 'bcg-1 cg-7'
                            }`}
                        >
                            {moment(
                                deploymentDetailedData.deploymentStatusBreakdown[type].time,
                                'YYYY-MM-DDTHH:mm:ssZ',
                            ).format(Moment12HourFormat)}
                        </span>
                    )}
                {((type === 'KUBECTL_APPLY' &&
                    deploymentDetailedData.deploymentStatusBreakdown[type].kubeList?.length) ||
                    (type === 'APP_HEALTH' &&
                        ['inprogress', 'unable_to_fetch', 'timed_out'].includes(
                            deploymentDetailedData.deploymentStatus,
                        )) ||
                    (type === 'GIT_COMMIT' &&
                        deploymentDetailedData.deploymentStatusBreakdown[type].icon === 'failed')) && (
                    <DropDownIcon
                        style={{ marginLeft: 'auto', ['--rotateBy' as any]: `${180 * Number(!collapsed)}deg` }}
                        className="icon-dim-24 rotate pointer"
                        onClick={collapseToggler}
                    />
                )}
            </div>
            {type === 'GIT_COMMIT' && renderDetailedData()}
            {type === 'KUBECTL_APPLY' && renderDetailedData()}
            {type === 'APP_HEALTH' && renderDetailChart()}
            {!hideVerticalConnector && <div className="vertical-connector"></div>}
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
