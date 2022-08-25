import React from 'react'
import { Drawer } from '../../../common'
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg'
import DeploymentStatusDetailBreakdown from './DeploymentStatusBreakdown'
import { DeploymentStatusDetailsBreakdownDataType } from './appDetails.type'

export default function DeploymentStatusDetailModal({
    close,
    appName,
    environmentName,
    deploymentStatusDetailsBreakdownData,
}: {
    close: () => void
    appName: string
    environmentName: string
    deploymentStatusDetailsBreakdownData: DeploymentStatusDetailsBreakdownDataType
}) {
    return (
        <Drawer position="right" width="50%">
            <div className="app-status-detail-modal bcn-0">
                <div className="app-status-detail__header box-shadow pb-12 pt-12 mb-20 bcn-0">
                    <div className="title flex content-space pl-20 pr-20 ">
                        <div>
                            <div className="cn-9 fs-16 fw-6">
                                Deployment status: {appName} / {environmentName}
                            </div>
                            <div>
                                <span className="">{deploymentStatusDetailsBreakdownData.deploymentStatusText}</span>
                                <span>Mon, 08 Aug 2022, 01:29 PM</span>
                            </div>
                        </div>
                        <span className="cursor" onClick={close}>
                            <Close className="icon-dim-24" />
                        </span>
                    </div>
                </div>
                <div style={{ height: 'calc(100vh - 90px)' }} className="bcn-0">
                    <DeploymentStatusDetailBreakdown deploymentStatusDetailsBreakdownData={deploymentStatusDetailsBreakdownData} />
                </div>
            </div>
        </Drawer>
    )
}
