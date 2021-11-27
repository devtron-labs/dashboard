import React, { useState } from 'react'
import AppStatusDetailModal from './AppStatusDetailModal'
import './environmentStatus.css'
import { ReactComponent as Question } from '../../../assets/icons/ic-question.svg'
import ConfigStatusModalComponent from './ConfigStatusModal.component'
import IndexStore from '../../index.store'
import moment from 'moment'
import appDetails from '../../../../app/details/appDetails'

function EnvironmentStatusComponent() {
    const [showAppStatusDetail, setShowAppStatusDetail] = useState(false)
    const [showConfigStatusModal, setShowConfigStatusModal] = useState(false)
    const response = IndexStore.getAppDetails()
    const status = response?.resourceTree?.status || ""
    console.log(response)

    return (
        <div>
            <div className="flex left ml-20">
                <div className="app-status-card  bcn-0 mr-12 br-8 p-16">
                    <div className="lh-1-33 cn-9 flex left"><span>Application status</span><Question className="icon-dim-16 ml-4" /></div>
                    <div className=" fw-6 fs-14 ">{status}</div>
                    <div onClick={() => setShowAppStatusDetail(true)}><span className="cursor cb-5">Details</span></div>
                </div>
                <div className="app-status-card bcn-0 br-8 pt-16 pl-16 pb-16 pr-16 mr-12" >
                    <div className="cn-9 lh-1-33 flex left"><span>Config apply status</span><Question className="icon-dim-16 ml-4" /></div>
                    <div className="cr-5 fw-6 fs-14 cursor" onClick={() => setShowConfigStatusModal(true)}>Failed</div>
                    <div className="lh-1-33">The active service is serving traffic to the current pod spec</div>
                </div>
                {response?.lastDeployedTime
                    ?
                    <div className="app-status-card bcn-0 br-8 pt-16 pl-16 pb-16 pr-16 mr-12">
                        <div className="cn-9 lh-1-33 flex left"><span>Last updated</span><Question className="icon-dim-16 ml-4" /></div>
                        <div className=" fw-6 fs-14">{moment(response?.lastDeployedTime, 'YYYY-MM-DDTHH:mm:ssZ').fromNow()}</div>
                    </div>
                    : ''}

                <div className="app-status-card bcn-0 br-8 pt-16 pl-16 pb-16 pr-16 mr-12" >
                    <div className="cn-9 lh-1-33 flex left"><span>Chart used</span><Question className="icon-dim-16 ml-4" /></div>
                    <div className=" fw-6 fs-14">anchore-engine (v3.4.0)</div>
                </div>
            </div>

            {showAppStatusDetail &&
                <AppStatusDetailModal
                    message={'text'}
                    close={() => { setShowAppStatusDetail(false) }}
                    status={'DEGRADED'}
                />}

            {showConfigStatusModal && <ConfigStatusModalComponent
                close={() => setShowConfigStatusModal(false)}
                status={'FAILED'}
            />
            }
        </div>
    )
}

export default EnvironmentStatusComponent
