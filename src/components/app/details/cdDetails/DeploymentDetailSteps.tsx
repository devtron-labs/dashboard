import React, { useEffect, useState } from 'react'
import { useRouteMatch, useParams } from 'react-router'
import { Progressing } from '../../../common'
import { getDeploymentStatusDetail } from '../appDetails/appDetails.service'
import { DeploymentStatusDetailsBreakdownDataType } from '../appDetails/appDetails.type'
import DeploymentStatusDetailBreakdown from '../appDetails/DeploymentStatusBreakdown'
import { processDeploymentStatusDetailsData } from '../appDetails/utils'
export default function DeploymentDetailSteps() {
    const match = useRouteMatch()
    const { appId, envId, triggerId } = useParams<{ appId: string; envId?: string; triggerId?: string }>()
    const [deploymentListLoader, setDeploymentListLoader] = useState<boolean>(true)
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
                    }, 10 * 1000)
                }
                setDeploymentStatusDetailsBreakdownData(processedDeploymentStatusDetailsData)
                setDeploymentListLoader(false)
            })
            .catch((e) => {
                setDeploymentListLoader(false)
            })
    }

    useEffect(() => {
        getDeploymentDetailStepsData()
        return (): void => {
            if (initTimer) {
                clearTimeout(initTimer)
            }
        }
    }, [])

    return (
        <>
            {deploymentListLoader ? (
                <Progressing pageLoader />
            ) : (
                <div className="bcn-0 pt-12 br-4 en-2 bw-1 pb-12 m-16" style={{ width: 'min( 100%, 800px )' }}>
                    <DeploymentStatusDetailBreakdown
                        deploymentStatusDetailsBreakdownData={deploymentStatusDetailsBreakdownData}
                    />
                </div>
            )}
        </>
    )
}
