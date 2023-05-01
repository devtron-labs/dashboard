import React from 'react'
import Tippy from '@tippyjs/react'
import moment from 'moment'
import { ReactComponent as CD } from '../../../../assets/icons/ic-CD.svg'
import { ReactComponent as Question } from '../../../../assets/icons/ic-help-outline.svg'
import { ReactComponent as Timer } from '../../../../assets/icons/ic-timer.svg'
import { DEPLOYMENT_STATUS, DEPLOYMENT_STATUS_QUERY_PARAM, URLS } from '../../../../config'
import { DeploymentStatusCardType } from './appDetails.type'
import { useHistory } from 'react-router'
import { noop } from '../../../common'
import { Link } from 'react-router-dom'

function DeploymentStatusCard({ deploymentStatusDetailsBreakdownData, loadingResourceTree }: DeploymentStatusCardType) {
    const history = useHistory()

    const showDeploymentDetailedStatus = (e): void => {
        e.stopPropagation()
        history.push({
            search: DEPLOYMENT_STATUS_QUERY_PARAM,
        })
    }
    return (
        <div>
            <div
                data-testid="deployment-status-card"
                onClick={loadingResourceTree ? noop : showDeploymentDetailedStatus}
                className="flex left bcn-0 p-16 br-4 mw-382 en-2 bw-1 cursor mr-12"
            >
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
                            className={`app-summary__status-name fs-14 mr-8 fw-6 f-${
                                deploymentStatusDetailsBreakdownData.deploymentStatus
                            } ${
                                deploymentStatusDetailsBreakdownData.deploymentStatus === DEPLOYMENT_STATUS.INPROGRESS
                                    ? 'dc__loading-dots'
                                    : ''
                            }`}
                        >
                            {deploymentStatusDetailsBreakdownData.deploymentStatusText}
                        </span>
                        <div
                            className={`${deploymentStatusDetailsBreakdownData.deploymentStatus} icon-dim-20 mt-2`}
                        ></div>
                    </div>
                    <div>
                        <span className="cb-5 fw-6 pointer">Details</span>
                    </div>
                </div>
                <div className="flex left column mw-140">
                    <div className="fs-12 fw-4 cn-9">Deployment triggered</div>
                    <div className="flexbox" data-testid="last-updated-time">
                        <span className="fs-13 mr-5 fw-6 cn-9">
                            {deploymentStatusDetailsBreakdownData.deploymentTriggerTime
                                ? moment(
                                      deploymentStatusDetailsBreakdownData.deploymentTriggerTime,
                                      'YYYY-MM-DDTHH:mm:ssZ',
                                  ).fromNow()
                                : '-'}
                        </span>
                        {deploymentStatusDetailsBreakdownData.deploymentStatus === DEPLOYMENT_STATUS.INPROGRESS && (
                            <Timer className="icon-dim-16 mt-4" />
                        )}
                    </div>
                    <div className="fw-4 fs-12 cn-9 dc__ellipsis-right" style={{ maxWidth: 'inherit' }}>
                        by {deploymentStatusDetailsBreakdownData.triggeredBy || '-'}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DeploymentStatusCard
