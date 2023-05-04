import React, { useEffect, useState } from 'react'
import { useHistory, useParams, useRouteMatch } from 'react-router'
import { Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { DeploymentAppType } from '../../../v2/appDetails/appDetails.type'
import { getDeploymentStatusDetail } from '../appDetails/appDetails.service'
import { DeploymentStatusDetailsBreakdownDataType } from '../appDetails/appDetails.type'
import DeploymentStatusDetailBreakdown from '../appDetails/DeploymentStatusBreakdown'
import { processDeploymentStatusDetailsData } from '../appDetails/utils'
import { DeploymentDetailStepsType } from './cd.type'
import CDEmptyState from './CDEmptyState'
import mechanicalOperation from '../../../../assets/img/ic-mechanical-operation.svg'
import { ReactComponent as Arrow } from '../../../../assets/icons/ic-arrow-forward.svg'
import { ReactComponent as Check } from '../../../../assets/icons/ic-check.svg'
import { ReactComponent as ChevronDown } from '../../../../assets/icons/appstatus/ic-chevron-down.svg'
import { DEPLOYMENT_STATUS, DEPLOYMENT_STATUS_QUERY_PARAM, TIMELINE_STATUS, URLS } from '../../../../config'
import { getAlphabetIcon } from '../../../common'

export default function DeploymentDetailSteps({
    deploymentStatus,
    deploymentAppType,
    userApprovalMetadata,
}: DeploymentDetailStepsType) {
    const history = useHistory()
    const { url } = useRouteMatch()
    const { appId, envId, triggerId } = useParams<{ appId: string; envId?: string; triggerId?: string }>()
    const [deploymentListLoader, setDeploymentListLoader] = useState<boolean>(
        deploymentStatus.toUpperCase() !== TIMELINE_STATUS.ABORTED,
    )
    const [deploymentStatusDetailsBreakdownData, setDeploymentStatusDetailsBreakdownData] =
        useState<DeploymentStatusDetailsBreakdownDataType>(processDeploymentStatusDetailsData())
    const [approverDetailsExpanded, setApproverDetailsExpanded] = useState<boolean>(false)

    let initTimer = null
    const getDeploymentDetailStepsData = (): void => {
        getDeploymentStatusDetail(appId, envId, triggerId)
            .then((deploymentStatusDetailRes) => {
                const processedDeploymentStatusDetailsData = processDeploymentStatusDetailsData(
                    deploymentStatusDetailRes.result,
                )
                if (processedDeploymentStatusDetailsData.deploymentStatus === DEPLOYMENT_STATUS.INPROGRESS) {
                    initTimer = setTimeout(() => {
                        getDeploymentDetailStepsData()
                    }, 10000)
                }
                setDeploymentStatusDetailsBreakdownData(processedDeploymentStatusDetailsData)
                setDeploymentListLoader(false)
            })
            .catch((e) => {
                setDeploymentListLoader(false)
            })
    }

    useEffect(() => {
        if (deploymentAppType === DeploymentAppType.helm) {
            history.replace(`${url.replace('deployment-steps', 'source-code')}`)
            if (initTimer) {
                clearTimeout(initTimer)
            }
            return
        }
        if (deploymentStatus !== 'Aborted') {
            getDeploymentDetailStepsData()
        }
        return (): void => {
            if (initTimer) {
                clearTimeout(initTimer)
            }
        }
    }, [])

    const redirectToDeploymentStatus = () => {
        history.push({
            pathname: `${URLS.APP}/${appId}/${URLS.APP_DETAILS}/${envId}/${URLS.APP_DETAILS_K8}`,
            search: DEPLOYMENT_STATUS_QUERY_PARAM,
        })
    }

    const toggleApproverDetailsExpanded = () => {
        setApproverDetailsExpanded(!approverDetailsExpanded)
    }

    return deploymentStatus.toUpperCase() === TIMELINE_STATUS.ABORTED ||
        deploymentStatusDetailsBreakdownData.deploymentStatus === DEPLOYMENT_STATUS.SUPERSEDED ? (
        <div className="flexbox deployment-aborted" data-testid="deployment-history-steps-failed-message">
            <CDEmptyState
                title="Deployment failed"
                subtitle="A new deployment was initiated before this deployment completed."
            />
        </div>
    ) : deploymentListLoader ? (
        <Progressing pageLoader />
    ) : !deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.APP_HEALTH.isCollapsed ? (
        <div className="h-100 flex">
            <CDEmptyState
                title="Deployment in progress"
                imgSource={mechanicalOperation}
                actionButtonClass="bcb-5 cn-0"
                ActionButtonIcon={Arrow}
                actionHandler={redirectToDeploymentStatus}
                subtitle="This deployment is in progress. Click on Check status to know the live status."
                actionButtonText="Check live status"
                actionButtonIconRight={true}
                dataTestId="deployment-progress"
            />
        </div>
    ) : (
        <div className="dc__mxw-1000 min-w-800">
            {userApprovalMetadata && (
                <div className="deployment-approval-container pl-20 pr-20 pt-20">
                    <div className="deployment-status-breakdown-row pt-8 pb-8 pl-8 pr-8 bcn-0 bw-1 border-collapse en-2">
                        <Check className="icon-dim-20 green-tick" />
                        <span className="ml-12 mr-12 fs-13">
                            <span>Approval requested by {userApprovalMetadata.requestedUserData.userEmail}</span>
                        </span>
                    </div>
                    <div className="vertical-connector" />
                    <div className="deployment-status-breakdown-row pt-8 pb-8 pl-8 pr-8 bcn-0 bw-1 border-collapse en-2">
                        <Check className="icon-dim-20 green-tick" />
                        <span className="ml-12 mr-12 fs-13">
                            <span>{userApprovalMetadata.approvedUsersData.length} Approved</span>
                        </span>
                        <ChevronDown
                            style={{
                                marginLeft: 'auto',
                                ['--rotateBy' as any]: `${180 * Number(approverDetailsExpanded)}deg`,
                            }}
                            className="icon-dim-24 rotate pointer"
                            onClick={toggleApproverDetailsExpanded}
                        />
                    </div>
                    {approverDetailsExpanded && (
                        <div className="bcn-0 en-2 detail-tab_border bw-1">
                            <ol className="pt-12 pb-4 pl-12 pr-12 mb-0 dc__list-style-none">
                                {userApprovalMetadata.approvedUsersData.map((_approver, idx) => {
                                    return (
                                        <li key={_approver.userEmail} className="flex left mb-8 fs-13 fw-4">
                                            {getAlphabetIcon(_approver.userEmail)}
                                            {_approver.userEmail}
                                        </li>
                                    )
                                })}
                            </ol>
                        </div>
                    )}
                    <div className="vertical-connector" />
                </div>
            )}
            <DeploymentStatusDetailBreakdown
                deploymentStatusDetailsBreakdownData={deploymentStatusDetailsBreakdownData}
                streamData={null}
            />
        </div>
    )
}
