import React from 'react'
import { validateMomentDate } from './utils'
import { DEPLOYMENT_STATUS } from '../../../../config'
import { ReactComponent as Timer } from '../../../../assets/icons/ic-timer.svg'
import { LastUpdatedCardType } from './appDetails.type'

const LastUpdatedCard = ({
    deploymentTriggerTime,
    triggeredBy,
    deploymentStatusDetailsBreakdownData,
}: LastUpdatedCardType) => {
    return (
        <div data-testid="last-updated-card" className={`source-info-container flex left bcn-0 p-16 br-8 mr-12`}>
            <div className="flex left column mw-140">
                <div className="fs-12 fw-4 cn-9" data-testid="last-updated-heading">
                    Last updated
                </div>
                <div className="flexbox" data-testid="last-updated-time">
                    <span className="fs-13 mr-5 fw-6 cn-9">
                        {validateMomentDate(deploymentTriggerTime, 'YYYY-MM-DDTHH:mm:ssZ')}
                    </span>
                    {deploymentStatusDetailsBreakdownData?.deploymentStatus === DEPLOYMENT_STATUS.INPROGRESS && (
                        <Timer className="icon-dim-16 mt-4" />
                    )}
                </div>
                <div className="fw-4 fs-12 cn-9 dc__ellipsis-right dc__mxw-inherit">by {triggeredBy || '-'}</div>
            </div>
        </div>
    )
}

export default React.memo(LastUpdatedCard)
