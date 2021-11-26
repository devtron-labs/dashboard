import React from 'react'
import { useState } from 'react'
import './nodeType.css'

function PodHeaderComponent() {
    const [podTab, selectPodTab] = useState<'old' | 'new'>('new')
    
    return (
        <div>
            <div className="pod-node-tab__wrapper flex left old-new-switch-container">
                <div
                    className={`lh-1-4-33 no-decor pod-tab ${podTab === 'new' ? 'pod-tab__active' : ''} border-right flex left column pl-16 pr-16 pointer `}
                    onClick={(e) => selectPodTab('new')}
                    data-testid="all-pods-new"
                >
                    <div className="fs-14 fw-6 pt-12 ">New Pods (23)</div>
                    <div className="flex left fs-12 cn-9 pb-12">
                        <React.Fragment>
                            {/* {<span className="bullet mr-4 ml-4"></span>} */}
                            <span data-testid={`new-pod-status`}> 8 running • 3 failed • 5 pending • 4 succeeded </span>
                        </React.Fragment>
                    </div>
                </div>
                <div
                    className={`pod-tab ${podTab === 'old' ? 'pod-tab__active border-right' : 'pod-tab__transparent-top'} no-decor flex left column pl-16 pr-16 pointer  `}
                    onClick={(e) => selectPodTab('old')}
                    data-testid="all-pods-old"
                >
                    <div className="fs-14 fw-6 pt-12">Old Pods (0)</div>
                    <div className="flex left fs-12 cn-9 pb-12 ">
                        <React.Fragment >
                            {<span className="bullet mr-4 ml-4"></span>}
                            <span > 0 running</span>
                        </React.Fragment>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PodHeaderComponent
