import React, { useEffect, useRef, useState } from 'react'
import { useHistory, useParams, useRouteMatch } from 'react-router'
import { DeploymentAppTypes, GenericEmptyState, Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { getDeploymentStatusDetail } from '../appDetails/appDetails.service'
import DeploymentStatusDetailBreakdown from '../appDetails/DeploymentStatusBreakdown'
import { processDeploymentStatusDetailsData } from '../appDetails/utils'
import { DeploymentDetailStepsType } from './cd.type'
import CDEmptyState from './CDEmptyState'
import mechanicalOperation from '../../../../assets/img/ic-mechanical-operation.svg'
import { ReactComponent as Arrow } from '../../../../assets/icons/ic-arrow-forward.svg'
import { DEPLOYMENT_STATUS, DEPLOYMENT_STATUS_QUERY_PARAM, TIMELINE_STATUS, URLS } from '../../../../config'
import { EMPTY_STATE_STATUS } from '../../../../config/constantMessaging'
import { DeploymentStatusDetailsBreakdownDataType, DeploymentStatusDetailsType } from '../appDetails/appDetails.type'
import { importComponentFromFELibrary } from '../../../common'

const DeploymentApprovalInfo = importComponentFromFELibrary('DeploymentApprovalInfo')
const processVirtualEnvironmentDeploymentData = importComponentFromFELibrary('processVirtualEnvironmentDeploymentData', null, 'function')

let deploymentStatusTimer = null
export default function DeploymentDetailSteps({
    deploymentStatus,
    deploymentAppType,
    isHelmApps = false,
    installedAppVersionHistoryId,
    isGitops,
    userApprovalMetadata,
    isVirtualEnvironment
}: DeploymentDetailStepsType) {
    const history = useHistory()
    const { url } = useRouteMatch()
    const { appId, envId, triggerId } = useParams<{ appId: string; envId?: string; triggerId?: string }>()
    const [deploymentListLoader, setDeploymentListLoader] = useState<boolean>(
        deploymentStatus?.toUpperCase() !== TIMELINE_STATUS.ABORTED,
    )
    const isVirtualEnv = useRef(isVirtualEnvironment)
    const processedData = (isVirtualEnv.current && processVirtualEnvironmentDeploymentData) ? processVirtualEnvironmentDeploymentData() :  processDeploymentStatusDetailsData()
    const [deploymentStatusDetailsBreakdownData, setDeploymentStatusDetailsBreakdownData] =
        useState<DeploymentStatusDetailsBreakdownDataType>(processedData)

    useEffect(() => {
        if (deploymentAppType === DeploymentAppTypes.HELM) {
            history.replace(`${url.replace('deployment-steps', 'source-code')}`)
        }
        if (isGitops) {
            getDeploymentDetailStepsData()
        }

        return (): void => {
            clearDeploymentStatusTimer()
        }
    }, [installedAppVersionHistoryId])

    useEffect(() => {
        isVirtualEnv.current = isVirtualEnvironment
    },[isVirtualEnvironment])

    const getDeploymentDetailStepsData = (): void => {
        getDeploymentStatusDetail(appId, envId, true, triggerId, isHelmApps, installedAppVersionHistoryId).then(
            (deploymentStatusDetailRes) => {
                deploymentStatus !== 'Aborted' && processDeploymentStatusData(deploymentStatusDetailRes.result)
            }
        )
        .catch((e) => {
          setDeploymentListLoader(false)
      })
      .finally(()=>{
        setDeploymentListLoader(false)
      })
    }
    const clearDeploymentStatusTimer = (): void => {
        if (deploymentStatusTimer) {
            clearTimeout(deploymentStatusTimer)
        }
    }

    const processDeploymentStatusData = (deploymentStatusDetailRes: DeploymentStatusDetailsType): void => {
        const processedDeploymentStatusDetailsData = (isVirtualEnv.current && processVirtualEnvironmentDeploymentData) ? processVirtualEnvironmentDeploymentData(deploymentStatusDetailRes): processDeploymentStatusDetailsData(deploymentStatusDetailRes)
        clearDeploymentStatusTimer()
        // If deployment status is in progress then fetch data in every 10 seconds

        if (processedDeploymentStatusDetailsData.deploymentStatus === DEPLOYMENT_STATUS.INPROGRESS) {
            deploymentStatusTimer = setTimeout(() => {
                getDeploymentDetailStepsData()
            }, 10000)
        } else {
            deploymentStatusTimer = setTimeout(() => {
                getDeploymentDetailStepsData()
            }, 30000)
        }
        setDeploymentStatusDetailsBreakdownData(processedDeploymentStatusDetailsData)
    }

    const redirectToDeploymentStatus = () => {
      isHelmApps
            ? history.push({
                  pathname: `${URLS.APP}/${URLS.DEVTRON_CHARTS}/${URLS.APP_DEPLOYMNENT_HISTORY}/${appId}/env/${envId}/${URLS.DETAILS}/${URLS.APP_DETAILS_K8}`,
                  search: DEPLOYMENT_STATUS_QUERY_PARAM,
              })
            : history.push({
                  pathname: `${URLS.APP}/${appId}/${URLS.APP_DETAILS}/${envId}/${URLS.APP_DETAILS_K8}`,
                  search: DEPLOYMENT_STATUS_QUERY_PARAM,
              })
    }

    return deploymentStatus?.toUpperCase() === TIMELINE_STATUS.ABORTED ||
        deploymentStatusDetailsBreakdownData.deploymentStatus === DEPLOYMENT_STATUS.SUPERSEDED ? (
        <div className="flexbox deployment-aborted" data-testid="deployment-history-steps-failed-message">
            <GenericEmptyState
                title={EMPTY_STATE_STATUS.DEPLOYMENT_DETAILS_SETPS_FAILED.TITLE}
                subTitle={EMPTY_STATE_STATUS.DEPLOYMENT_DETAILS_SETPS_FAILED.SUBTITLE}
            />
        </div>
    ) : deploymentListLoader ? (
        <Progressing pageLoader />
    ) : !isVirtualEnv.current && !deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.APP_HEALTH.isCollapsed ? (
        <div className="h-100 flex">
            <CDEmptyState
                title={EMPTY_STATE_STATUS.DEPLOYMENT_DETAILS_SETPS_PROGRESSING.TITLE}
                imgSource={mechanicalOperation}
                actionButtonClass="bcb-5 cn-0"
                ActionButtonIcon={Arrow}
                actionHandler={redirectToDeploymentStatus}
                subtitle={EMPTY_STATE_STATUS.DEPLOYMENT_DETAILS_SETPS_PROGRESSING.SUBTITLE}
                actionButtonText="Check live status"
                actionButtonIconRight={true}
                dataTestId="deployment-progress"
            />
        </div>
    ) : (
        <div className="dc__mxw-1000 min-w-800">
            {DeploymentApprovalInfo && userApprovalMetadata && (
                <DeploymentApprovalInfo userApprovalMetadata={userApprovalMetadata} />
            )}
            <DeploymentStatusDetailBreakdown
                deploymentStatusDetailsBreakdownData={deploymentStatusDetailsBreakdownData}
                streamData={null}
                isVirtualEnvironment={isVirtualEnv.current}
            />
        </div>
    )
}
