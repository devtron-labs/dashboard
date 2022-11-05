import React, { useEffect, useState } from 'react'
import { useHistory, useParams, useRouteMatch } from 'react-router'
import { Progressing } from '../../../common'
import { DeploymentAppType } from '../../../v2/appDetails/appDetails.type'
import { getDeploymentStatusDetail } from '../appDetails/appDetails.service'
import { DeploymentStatusDetailsBreakdownDataType } from '../appDetails/appDetails.type'
import DeploymentStatusDetailBreakdown from '../appDetails/DeploymentStatusBreakdown'
import { processDeploymentStatusDetailsData } from '../appDetails/utils'
import { DeploymentDetailStepsType } from './cd.type'
import CDEmptyState from './CDEmptyState'

export default function DeploymentDetailSteps({ deploymentStatus, deploymentAppType }: DeploymentDetailStepsType) {
    const history = useHistory()
    const { url } = useRouteMatch()
    const { appId, envId, triggerId } = useParams<{ appId: string; envId?: string; triggerId?: string }>()
    const [deploymentListLoader, setDeploymentListLoader] = useState<boolean>(deploymentStatus !== 'Aborted')
    const [deploymentStatusDetailsBreakdownData, setDeploymentStatusDetailsBreakdownData] =
        useState<DeploymentStatusDetailsBreakdownDataType>(processDeploymentStatusDetailsData())

    let initTimer = null
    const getDeploymentDetailStepsData = (): void => {
        getDeploymentStatusDetail(appId, envId, triggerId)
            .then((deploymentStatusDetailRes) => {
                const processedDeploymentStatusDetailsData = processDeploymentStatusDetailsData(
                    deploymentStatusDetailRes.result,
                )
                if (processedDeploymentStatusDetailsData.deploymentStatus === 'inprogress') {
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

    return deploymentStatus === 'Aborted' ? (
        <div className="flexbox deployment-aborted">
            <CDEmptyState
                title="This deployment was aborted"
                subtitle="This deployment was aborted as a successive deployment was triggered before this deployment could complete."
            />
        </div>
    ) : deploymentListLoader ? (
        <Progressing pageLoader />
    ) : (
        <div className="bcn-0 pt-12 br-4 en-2 bw-1 pb-12 m-16" style={{ width: 'min( 100%, 800px )' }}>
            <DeploymentStatusDetailBreakdown
                deploymentStatusDetailsBreakdownData={deploymentStatusDetailsBreakdownData}
            />
        </div>
    )
}
