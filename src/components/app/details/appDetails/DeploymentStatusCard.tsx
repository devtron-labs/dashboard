import React from 'react'
import Tippy from '@tippyjs/react'
import { ReactComponent as CD } from '../../../../assets/icons/ic-CD.svg'
import { ReactComponent as Rocket } from '../../../../assets/icons/ic-paper-rocket.svg'
import { ReactComponent as Question } from '../../../../assets/icons/ic-help-outline.svg'
import { DEPLOYMENT_STATUS, DEPLOYMENT_STATUS_QUERY_PARAM } from '../../../../config'
import { useHistory } from 'react-router'
import { DeploymentStatusCardType } from './appDetails.type'
import { noop } from '@devtron-labs/devtron-fe-common-lib'
import { validateMomentDate } from './utils'
import LoadingCard from './LoadingCard'

function DeploymentStatusCard({
    deploymentStatusDetailsBreakdownData,
    cardLoading,
    hideDetails,
    isVirtualEnvironment,
    refetchDeploymentStatus,
}: DeploymentStatusCardType) {
    const history = useHistory()

    const showDeploymentDetailedStatus = (e): void => {
        e.stopPropagation()
        history.push({
            search: DEPLOYMENT_STATUS_QUERY_PARAM,
        })
    }
    const ProgressingStateList: string[] = [
        DEPLOYMENT_STATUS.INPROGRESS,
        DEPLOYMENT_STATUS.STARTING,
        DEPLOYMENT_STATUS.INITIATING,
    ]
    const renderDeploymentStatus = () => {
        const { triggeredBy, deploymentStatus, deploymentTriggerTime, deploymentStatusText } =
            deploymentStatusDetailsBreakdownData
        return (
            <>
                <div className="app-details-info-card__top-container flex">
                    <div className="app-details-info-card__top-container__content">
                        <div className="app-details-info-card__top-container__content__title-wrapper">
                            <div className="fs-12 fw-4 cn-7 mr-5">Deployment status</div>
                            <Tippy
                                className="default-tt"
                                arrow={false}
                                placement="top"
                                content="Status of last triggered deployment"
                            >
                                <Question className="icon-dim-16 mt-2" />
                            </Tippy>
                        </div>
                        <div className="flex fs-12 fw-4">
                            <span
                                data-testid="deployment-status-name"
                                className={`app-summary__status-name fs-14 mr-8 fw-6 f-${deploymentStatus?.toLowerCase()} ${
                                    ProgressingStateList.includes(deploymentStatus) ? 'dc__loading-dots' : ''
                                }`}
                            >
                                {deploymentStatusText}
                            </span>
                        </div>
                    </div>

                    {isVirtualEnvironment ? (
                        <Rocket className="icon-dim-24 mr-2" />
                    ) : (
                        <CD className="icon-dim-24 dc__flip-90 mr-2" />
                    )}
                </div>
                <div className="app-details-info-card__bottom-container dc__content-space">
                    <div className="app-details-info-card__bottom-container__message fs-12 fw-4">
                        <span className="fs-13 mr-5 fw-6">
                            {validateMomentDate(deploymentTriggerTime, 'YYYY-MM-DDTHH:mm:ssZ')}
                        </span>
                        by {triggeredBy || '-'}
                    </div>
                    {!hideDetails && (
                        <div
                            data-testid="deployment-status-details"
                            className="app-details-info-card__bottom-container__details fs-12 fw-6"
                        >
                            Details
                        </div>
                    )}
                </div>
            </>
        )
    }

    const onClickLastDeploymentStatus = (e) => {
        if (cardLoading) noop()
        if (!hideDetails) {
            refetchDeploymentStatus(true)
            showDeploymentDetailedStatus(e)
        }
    }

    if (cardLoading) return <LoadingCard wider />

    return (
        <div
            data-testid="deployment-status-card"
            onClick={onClickLastDeploymentStatus}
            className={`app-details-info-card flex left bcn-0 br-8 mr-12 lh-20 w-250 ${
                hideDetails ? '' : 'cursor'
            }`}
        >
            {renderDeploymentStatus()}
        </div>
    )
}

export default React.memo(DeploymentStatusCard)
