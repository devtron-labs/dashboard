import React, { useState } from 'react'
import moment from 'moment'
import { useParams } from 'react-router-dom'
import { APP_STATUS_HEADERS, Moment12HourFormat, TIMELINE_STATUS } from '../../../../config'
import { showError } from '../../../common'
import { ShowMoreText } from '../../../common/ShowMoreText'
import { AppStatusDetailsChart } from '../../../v2/appDetails/sourceInfo/environmentStatus/AppStatusDetailModal'
import { getManualSync } from '../../service'
import { AppStreamData } from '../../types'
import { DeploymentStatusDetailsBreakdownDataType } from './appDetails.type'
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg'
import { ReactComponent as Check } from '../../../../assets/icons/ic-check.svg'
import { ReactComponent as Timer } from '../../../../assets/icons/ic-timer.svg'
import { ReactComponent as Question } from '../../../../assets/icons/ic-help-outline.svg'
import { ReactComponent as Error } from '../../../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as Disconnect } from '../../../../assets/icons/ic-disconnected.svg'
import { ReactComponent as DropDownIcon } from '../../../../assets/icons/appstatus/ic-chevron-down.svg'

export function RenderStatusDetailRow({
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
    const appHealthDropDownlist = ['inprogress', 'unable_to_fetch', 'timed_out']

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
                {type === TIMELINE_STATUS.KUBECTL_APPLY && (
                    <div className="pr-8 pl-8 pt-12 pb-12">
                        <div className="">
                            {deploymentDetailedData.deploymentStatusBreakdown[TIMELINE_STATUS.KUBECTL_APPLY].kubeList?.map(
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
                {((type === TIMELINE_STATUS.KUBECTL_APPLY &&
                    deploymentDetailedData.deploymentStatusBreakdown[type].kubeList?.length) ||
                    (type === TIMELINE_STATUS.APP_HEALTH &&
                    appHealthDropDownlist.includes(
                            deploymentDetailedData.deploymentStatus,
                        )) ||
                    (type === TIMELINE_STATUS.GIT_COMMIT &&
                        deploymentDetailedData.deploymentStatusBreakdown[type].icon === 'failed')) && (
                    <DropDownIcon
                        style={{ marginLeft: 'auto', ['--rotateBy' as any]: `${180 * Number(!collapsed)}deg` }}
                        className="icon-dim-24 rotate pointer"
                        onClick={collapseToggler}
                    />
                )}
            </div>
            {type === TIMELINE_STATUS.GIT_COMMIT && renderDetailedData()}
            {type === TIMELINE_STATUS.KUBECTL_APPLY && renderDetailedData()}
            {type === TIMELINE_STATUS.APP_HEALTH && renderDetailChart()}
            {!hideVerticalConnector && <div className="vertical-connector"></div>}
        </>
    )
}