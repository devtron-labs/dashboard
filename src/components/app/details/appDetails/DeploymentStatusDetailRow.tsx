import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { useParams } from 'react-router-dom'
import {
    DEPLOYMENT_STATUS,
    MANIFEST_STATUS_HEADERS,
    Moment12HourFormat,
    TERMINAL_STATUS_MAP,
    TIMELINE_STATUS,
} from '../../../../config'
import { showError } from '@devtron-labs/devtron-fe-common-lib'
import { ShowMoreText } from '../../../common/ShowMoreText'
import { getManualSync } from '../../service'
import { DeploymentStatusDetailRowType } from './appDetails.type'
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg'
import { ReactComponent as Check } from '../../../../assets/icons/ic-check.svg'
import { ReactComponent as Timer } from '../../../../assets/icons/ic-timer.svg'
import { ReactComponent as Question } from '../../../../assets/icons/ic-help-outline.svg'
import { ReactComponent as Error } from '../../../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as Disconnect } from '../../../../assets/icons/ic-disconnected.svg'
import { ReactComponent as DropDownIcon } from '../../../../assets/icons/appstatus/ic-chevron-down.svg'
import { ReactComponent as TimeOut } from '../../../../assets/icons/ic-timeout-red.svg'
import AppStatusDetailsChart from '../../../v2/appDetails/sourceInfo/environmentStatus/AppStatusDetailsChart'
import { ErrorInfoStatusBar } from './ErrorInfoStatusBar'
import { statusIcon } from '../../config'

export function DeploymentStatusDetailRow({
    type,
    hideVerticalConnector,
    deploymentDetailedData,
    streamData,
}: DeploymentStatusDetailRowType) {
    const { appId, envId } = useParams<{ appId: string; envId: string }>()
    const statusBreakDownType = deploymentDetailedData.deploymentStatusBreakdown[type]
    const [collapsed, toggleCollapsed] = useState<boolean>(statusBreakDownType.isCollapsed)
    const appHealthDropDownlist = ['inprogress', 'failed', 'disconnect', 'timed_out']
    const isHelmManifestPushFailed =
        type === TIMELINE_STATUS.HELM_MANIFEST_PUSHED_TO_HELM_REPO &&
        deploymentDetailedData.deploymentStatus === statusIcon.failed

    useEffect(() => {
        toggleCollapsed(statusBreakDownType.isCollapsed)
    }, [statusBreakDownType.isCollapsed])

    async function manualSyncData() {
        try {
            const response = await getManualSync({ appId, envId })
        } catch (error) {
            showError(error)
        }
    }

    const toggleDropdown = () => {
        toggleCollapsed(!collapsed)
    }

    const renderDetailedData = () => {
        return !collapsed ? (
            <div className="bcn-0 en-2 detail-tab_border bw-1">
                {statusBreakDownType.timelineStatus && (
                    <div
                        className={`flex left pt-8 pl-12 pb-8 lh-20 ${
                            statusBreakDownType.icon !== 'inprogress' ? 'bcr-1' : 'bcy-2'
                        }`}
                    >
                        {deploymentDetailedData.deploymentStatusBreakdown[type].timelineStatus}
                        {(deploymentDetailedData.deploymentStatus === DEPLOYMENT_STATUS.TIMED_OUT ||
                            deploymentDetailedData.deploymentStatus === DEPLOYMENT_STATUS.UNABLE_TO_FETCH) && (
                            <span className="cb-5 fw-6 ml-8 cursor" onClick={manualSyncData}>
                                Try now
                            </span>
                        )}
                    </div>
                )}
                {type === TIMELINE_STATUS.KUBECTL_APPLY && (
                    <div className="pr-8 pl-8 pt-12 pb-12">
                        <div className="">
                            {deploymentDetailedData.deploymentStatusBreakdown[
                                TIMELINE_STATUS.KUBECTL_APPLY
                            ].kubeList?.map((items) => (
                                <div className="flex left lh-20 mb-8">
                                    {renderIcon(items.icon)}
                                    <span className="ml-12">{items.message}</span>
                                </div>
                            ))}
                        </div>
                        {statusBreakDownType.resourceDetails?.length ? (
                            <div className="pl-32">
                                <div className="app-status-row dc__border-bottom pt-8 pb-8">
                                    {MANIFEST_STATUS_HEADERS.map((headerKey, index) => (
                                        <div className="fs-13 fw-6 cn-7" key={`header_${index}`}>
                                            {headerKey}
                                        </div>
                                    ))}
                                </div>
                                <div className="resource-list fs-13">
                                    {statusBreakDownType.resourceDetails.map((nodeDetails) => (
                                        <div
                                            className="app-status-row pt-8 pb-8"
                                            key={`${nodeDetails.resourceKind}/${nodeDetails.resourceName}`}
                                        >
                                            <div className="dc__break-word">{nodeDetails.resourceKind}</div>
                                            <div className="dc__break-word">{nodeDetails.resourceName}</div>
                                            <div
                                                className={`app-summary__status-name f-${
                                                    nodeDetails.resourceStatus
                                                        ? nodeDetails.resourceStatus.toLowerCase() ===
                                                          TERMINAL_STATUS_MAP.RUNNING
                                                            ? TERMINAL_STATUS_MAP.PROGRESSING
                                                            : nodeDetails.resourceStatus.toLowerCase()
                                                        : ''
                                                }`}
                                            >
                                                {nodeDetails.resourceStatus}
                                            </div>
                                            <ShowMoreText text={nodeDetails.statusMessage} />
                                        </div>
                                    ))}
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
                <div className="bcn-0 en-2 detail-tab_border bw-1">
                    {statusBreakDownType.timelineStatus && (
                        <div
                            className={`flex left pt-8 pl-12 pb-8 lh-20 ${
                                statusBreakDownType.icon !== 'inprogress' ? 'bcr-1' : 'bcy-2'
                            }`}
                        >
                            {statusBreakDownType.timelineStatus}
                            {(deploymentDetailedData.deploymentStatus === DEPLOYMENT_STATUS.TIMED_OUT ||
                                deploymentDetailedData.deploymentStatus === DEPLOYMENT_STATUS.UNABLE_TO_FETCH) && (
                                <span className="cb-5 fw-6 ml-8 cursor" onClick={manualSyncData}>
                                    Try now
                                </span>
                            )}
                        </div>
                    )}
                    <div>
                        <AppStatusDetailsChart
                            appStreamData={streamData}
                            filterRemoveHealth={true}
                            showFooter={false}
                        />
                    </div>
                </div>
            )
        )
    }

    const renderIcon = (iconState: string): JSX.Element => {
        switch (iconState) {
            case 'success':
                return <Check className="icon-dim-20 green-tick" data-testid="success-green-tick" />
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
                return <div className={`dc__app-summary__icon icon-dim-20 mr-6 progressing progressing--node`}></div>
            case 'disconnect':
                return <Disconnect className="icon-dim-20" />
            case 'time_out':
                return <TimeOut className="icon-dim-20" />
            default:
                return <Timer className="icon-dim-20 timer-icon" />
        }
    }

    const renderErrorInfoBar = () => {
        return (
            <ErrorInfoStatusBar
                type={TIMELINE_STATUS.HELM_MANIFEST_PUSHED_TO_HELM_REPO}
                nonDeploymentError={deploymentDetailedData.nonDeploymentError}
                errorMessage={deploymentDetailedData.deploymentError}
                hideVericalConnector={true}
                hideErrorIcon={true}
            />
        )
    }

    return (
        <>
            <div className="bw-1 en-2">
                <div
                    className={`deployment-status-breakdown-row pt-8 pb-8 pl-8 pr-8 bcn-0  ${
                        collapsed ? (!isHelmManifestPushFailed ? 'br-4' : '') : 'border-collapse'
                    }`}
                >
                    {renderIcon(statusBreakDownType.icon)}
                    <span className="ml-12 mr-12 fs-13">
                        <span data-testid="deployment-status-step-name">{statusBreakDownType.displayText}</span>
                        {statusBreakDownType.displaySubText && (
                            <span className={`ml-12 f-${statusBreakDownType.icon || 'waiting'}`}>
                                {statusBreakDownType.displaySubText}
                            </span>
                        )}
                    </span>

                    {statusBreakDownType.time !== '' && statusBreakDownType.icon !== 'inprogress' && (
                        <span
                            data-testid="deployment-status-kubernetes-dropdown"
                            className={`pl-8 pr-8 pt-4 pb-4 br-12 ${
                                statusBreakDownType.icon === 'failed' ? 'bcr-1 cr-5' : 'bcg-1 cg-7'
                            }`}
                        >
                            {moment(statusBreakDownType.time, 'YYYY-MM-DDTHH:mm:ssZ').format(Moment12HourFormat)}
                        </span>
                    )}
                    {((type === TIMELINE_STATUS.KUBECTL_APPLY && statusBreakDownType.kubeList?.length) ||
                        (type === TIMELINE_STATUS.APP_HEALTH &&
                            appHealthDropDownlist.includes(statusBreakDownType.icon)) ||
                        (type === TIMELINE_STATUS.GIT_COMMIT && statusBreakDownType.icon === 'failed')) && (
                        <DropDownIcon
                            style={{ marginLeft: 'auto', ['--rotateBy' as any]: `${180 * Number(!collapsed)}deg` }}
                            className="icon-dim-24 rotate pointer"
                            onClick={toggleDropdown}
                            data-testid="steps-deployment-history-dropdown"
                        />
                    )}
                </div>
                {isHelmManifestPushFailed && renderErrorInfoBar()}
            </div>

            {type === TIMELINE_STATUS.GIT_COMMIT && renderDetailedData()}
            {type === TIMELINE_STATUS.KUBECTL_APPLY && renderDetailedData()}
            {type === TIMELINE_STATUS.APP_HEALTH && renderDetailChart()}
            {!hideVerticalConnector && <div className="vertical-connector"></div>}
        </>
    )
}
