import React, { useState } from 'react'
import AppStatusDetailModal from './AppStatusDetailModal'
import './environmentStatus.css'
import { ReactComponent as Question } from '../../../assets/icons/ic-question.svg'
import { ReactComponent as Alert } from '../../../assets/icons/ic-alert-triangle.svg'
import ConfigStatusModalComponent from './ConfigStatusModal.component'
import IndexStore from '../../index.store'
import moment from 'moment'

function EnvironmentStatusComponent() {
    const [showAppStatusDetail, setShowAppStatusDetail] = useState(false)
    const [showConfigStatusModal, setShowConfigStatusModal] = useState(false)
    const appDetails = IndexStore.getAppDetails()
    const status = appDetails?.resourceTree?.status || ""

    return (
        <div>
            <div className="flex left ml-20">
                <div className="app-status-card bcn-0 mr-12 br-8 p-16">
                    <div className="lh-1-33 cn-9 flex left"><span>Application status</span><Question className="icon-dim-16 ml-4" /></div>

                    <div className={`f-${status.toLowerCase()} text-capitalize fw-6 fs-14 flex left`}>
                        <span>{status}</span>
                        <figure className={`${status.toLowerCase()} app-summary__icon ml-8 icon-dim-20`}></figure>
                    </div>
                    <div onClick={() => setShowAppStatusDetail(true)}><span className="cursor cb-5">Details</span></div>
                </div>

                {appDetails?.lastDeployedTime
                    ?
                    <div className="app-status-card bcn-0 br-8 pt-16 pl-16 pb-16 pr-16 mr-12">
                        <div className="cn-9 lh-1-33 flex left"><span>Last updated</span><Question className="icon-dim-16 ml-4" /></div>
                        <div className=" fw-6 fs-14 text-capitalize">{moment(appDetails?.lastDeployedTime, 'YYYY-MM-DDTHH:mm:ssZ').fromNow()}</div>
                        {appDetails?.lastDeployedBy && appDetails?.lastDeployedBy}
                    </div>
                    : ''}

                {
                    appDetails?.deprecated &&
                    <div className="app-status-card er-2 bw-1 bcr-1 br-8 pt-16 pl-16 pb-16 pr-16 mr-12" >
                        <div className="cn-9 lh-1-33 flex left"><span>Chart deprecated</span><Alert className="icon-dim-16 ml-4" /></div>
                        <div className=" fw-6 fs-14">Upgrader required</div>
                        <a href="" className="cb-5 fw-6">Upgrade chart</a>

                    </div>
                }
            </div>

            {showAppStatusDetail &&
                <AppStatusDetailModal
                    message={'text'}
                    close={() => { setShowAppStatusDetail(false) }}
                    status={'DEGRADED'}
                />}


        </div>
    )
}

export default EnvironmentStatusComponent
