import React from 'react'
import { Drawer, handleUTCTime } from '../../../common'
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg'
import { ReactComponent as Timer } from '../../../../assets/icons/ic-timer.svg'
import DeploymentStatusDetailBreakdown from './DeploymentStatusBreakdown'
import { DeploymentStatusDetailModalType, DeploymentStatusDetailsBreakdownDataType } from './appDetails.type'
import moment from 'moment'
import { Moment12HourFormat } from '../../../../config'

export default function DeploymentStatusDetailModal({
    close,
    appName,
    environmentName,
    deploymentStatusDetailsBreakdownData,
}: DeploymentStatusDetailModalType) {
    return (
        <Drawer position="right" width="50%">
            <div className="deployment-status-breakdown-modal-container bcn-0">
                <div className="box-shadow pb-12 pt-12 mb-20 bcn-0">
                    <div className="title flex content-space pl-20 pr-20 ">
                        <div>
                            <div className="cn-9 fs-16 fw-6">
                                Deployment status: {appName} / {environmentName}
                            </div>
                            <div className="flexbox">
                                <span
                                    className={`app-summary__status-name fs-13 fw-6 f-${deploymentStatusDetailsBreakdownData.deploymentStatus}`}
                                >
                                    {deploymentStatusDetailsBreakdownData.deploymentStatusText}
                                </span>
                                <span className="bullet mr-8 ml-8 mt-10"></span>
                                {deploymentStatusDetailsBreakdownData.deploymentStatus === 'inprogress' ? (
                                    <>
                                        <Timer className="icon-dim-16 mt-3 mr-5 timer-icon" />
                                        <span className="fs-13">
                                            {handleUTCTime(
                                                deploymentStatusDetailsBreakdownData.deploymentTriggerTime,
                                                true,
                                            )}
                                        </span>
                                    </>
                                ) : (
                                    <span className="fs-13">
                                        {deploymentStatusDetailsBreakdownData.deploymentEndTime !==
                                        '0001-01-01T00:00:00Z'
                                            ? moment(
                                                  deploymentStatusDetailsBreakdownData.deploymentEndTime,
                                                  'YYYY-MM-DDTHH:mm:ssZ',
                                              ).format(Moment12HourFormat)
                                            : '-'}
                                    </span>
                                )}
                            </div>
                        </div>
                        <span className="cursor" onClick={close}>
                            <Close className="icon-dim-24" />
                        </span>
                    </div>
                </div>
                <div style={{ height: 'calc(100vh - 90px)' }} className="bcn-0">
                    <DeploymentStatusDetailBreakdown
                        deploymentStatusDetailsBreakdownData={deploymentStatusDetailsBreakdownData}
                    />
                </div>
            </div>
        </Drawer>
    )
}
