import React from 'react'
import Tippy from '@tippyjs/react'
import moment from 'moment'
import { ReactComponent as CD } from '../../../../assets/icons/ic-CD.svg'
import { ReactComponent as Question } from '../../../../assets/icons/ic-help-outline.svg'
import { ReactComponent as Timer } from '../../../../assets/icons/ic-timer.svg'
import { DEPLOYMENT_STATUS, DEPLOYMENT_STATUS_QUERY_PARAM } from '../../../../config'
import { useHistory } from 'react-router'
import { DeploymentStatusCardType } from './appDetails.type'
import { noop } from '@devtron-labs/devtron-fe-common-lib'

function DeploymentStatusCard({
    deploymentStatusDetailsBreakdownData,
    loadingResourceTree,
    hideDeploymentStatusLeftInfo,
    hideDetails,
    deploymentTriggerTime,
    triggeredBy,
}: DeploymentStatusCardType) {
    const history = useHistory()

    const showDeploymentDetailedStatus = (e): void => {
        e.stopPropagation()
        history.push({
            search: DEPLOYMENT_STATUS_QUERY_PARAM,
        })
    }
    const renderDeploymentStatus = () => {
        return (
            <>
                <div className="mw-48 mh-48 bcn-1 flex br-4 mr-16">
                    <CD className="icon-dim-32" />
                </div>
                <div className="flex left column pr-16 dc__border-right-n1 mr-16">
                    <div className="flexbox">
                        <span className="fs-12 mr-5 fw-4 cn-9">Deployment status</span>

                        <Tippy
                            className="default-tt"
                            arrow={false}
                            placement="top"
                            content="Status of last triggered deployment"
                        >
                            <Question className="icon-dim-16 mt-2" />
                        </Tippy>
                    </div>
                    <div className="flexbox">
                        <span
                            data-testid="deployment-status-name"
                            className={`app-summary__status-name fs-14 mr-8 fw-6 f-${deploymentStatusDetailsBreakdownData?.deploymentStatus?.toLowerCase()} ${
                                deploymentStatusDetailsBreakdownData?.deploymentStatus === DEPLOYMENT_STATUS.INPROGRESS
                                    ? 'dc__loading-dots'
                                    : ''
                            }`}
                        >
                            {deploymentStatusDetailsBreakdownData?.deploymentStatusText}
                        </span>
                        <div
                            className={`${deploymentStatusDetailsBreakdownData?.deploymentStatus} icon-dim-20 mt-2`}
                        ></div>
                    </div>
                    {!hideDetails && (
                        <div>
                            <span data-testid="deployment-status-deatils" className="cb-5 fw-6 pointer">
                                Details
                            </span>
                        </div>
                    )}
                </div>
            </>
        )
    }

    const onClickLastDeploymentStatus = (e) => {
        if (loadingResourceTree) noop()
        if (!hideDetails && !hideDeploymentStatusLeftInfo) {
            showDeploymentDetailedStatus(e)
        }
    }

    return (
        <div
            data-testid="deployment-status-card"
            onClick={onClickLastDeploymentStatus}
            className={`source-info-container flex left bcn-0 p-16 br-8 mw-382 ${
                hideDeploymentStatusLeftInfo || hideDetails ? '' : 'cursor'
            } mr-12`}
        >
            {!hideDeploymentStatusLeftInfo && renderDeploymentStatus()}
            <div className="flex left column mw-140">
                <div className="fs-12 fw-4 cn-9" data-testid="last-updated-heading">
                    {hideDeploymentStatusLeftInfo ? 'Last updated' : 'Deployment triggered'}
                </div>
                <div className="flexbox" data-testid="last-updated-time">
                    <span className="fs-13 mr-5 fw-6 cn-9">
                        {moment(
                            hideDeploymentStatusLeftInfo
                                ? deploymentTriggerTime
                                : deploymentStatusDetailsBreakdownData?.deploymentTriggerTime,
                            'YYYY-MM-DDTHH:mm:ssZ',
                        ).fromNow()}
                    </span>
                    {deploymentStatusDetailsBreakdownData?.deploymentStatus === DEPLOYMENT_STATUS.INPROGRESS && (
                        <Timer className="icon-dim-16 mt-4" />
                    )}
                </div>

                {hideDeploymentStatusLeftInfo ? (
                    triggeredBy
                ) : (
                    <div className="fw-4 fs-12 cn-9 dc__ellipsis-right dc__mxw-inherit">
                        by {deploymentStatusDetailsBreakdownData.triggeredBy || '-'}
                    </div>
                )}
            </div>
        </div>
    )
}

export default DeploymentStatusCard
