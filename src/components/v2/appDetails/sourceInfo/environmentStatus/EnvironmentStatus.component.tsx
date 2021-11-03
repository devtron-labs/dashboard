import React, { useState } from 'react'
import { VisibleModal } from '../../../../common'
import { DeploymentStatusModal } from '../../../../externalApp/src/components/apps/details/DeploymentStatusModal'
import AppStatusDetailModal from './AppStatusDetailModal'

function EnvironmentStatusComponent() {
    const [showAppStatusDetail, setShowAppStatusDetail] = useState(false)
    const [showDeploymentStatusDetail, setShowDeploymentStatusDetail] = useState(false)


    return (
        <div>
            <div className="pl-20 pr-20" style={{
                display: 'grid',
                gridTemplateColumns: '50% 50%',
                minHeight: '92px',
                gridGap: "16px"
            }}>
                <div className="bcn-0 br-8 p-16" onClick={() => setShowAppStatusDetail(true)}>
                    <div className="cn-9 fw-6">Config Apply</div>
                    <div className="cg-5 fw-6 fs-14 cursor">Success</div>
                    <div>Last update <span className="fw-6"> 12 mins ago </span> <span className="cb-5">Details</span></div>
                </div>
                <div className="bcn-0 br-8 pt-16 pl-16 pb-16 mr-16" onClick={() => setShowDeploymentStatusDetail(true)}>
                    <div className="cn-9 fw-6">Application status</div>
                    <div className="cg-5 fw-6 fs-14 cursor">Healthy</div>
                    <div>The active service is serving traffic to the current pod spec</div>
                </div>
            </div>
                    {showAppStatusDetail && <AppStatusDetailModal
                        message={'text'}
                        close={() => { setShowAppStatusDetail(false) }}
                        status={'DEGRADED'} />}
                    {showDeploymentStatusDetail && <DeploymentStatusModal />}
        </div>
    )
}

export default EnvironmentStatusComponent
