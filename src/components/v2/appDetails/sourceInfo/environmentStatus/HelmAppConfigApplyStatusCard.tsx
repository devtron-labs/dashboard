import React from 'react'
import Tippy from '@tippyjs/react'
import { ReactComponent as Question } from '../../../assets/icons/ic-question.svg'

function HelmAppConfigApplyStatusCard({ releaseStatus }) {
    return releaseStatus ? (
        <div className="app-status-card bcn-0 mr-12 br-8 p-16  ">
            <div className="cn-9 flex left">
                <span>Config apply status</span>
                <Tippy
                    className="default-tt cursor"
                    arrow={false}
                    content={'Whether or not your last helm install was successful'}
                >
                    <Question className="cursor icon-dim-16 ml-4" />
                </Tippy>
            </div>
            <div className={`f-${releaseStatus['status'].toLowerCase()} dc__capitalize fw-6 fs-14 flex left`}>
                <span>{releaseStatus['status']}</span>
                <figure
                    className={`${releaseStatus['status'].toLowerCase()} dc__app-summary__icon ml-8 icon-dim-20`}
                ></figure>
            </div>
            <div className="cn-9 flex left">
                <span>{releaseStatus['message']}</span>
            </div>
        </div>
    ) : null
}

export default HelmAppConfigApplyStatusCard
