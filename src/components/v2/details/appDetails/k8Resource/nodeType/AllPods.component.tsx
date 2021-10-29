import React from 'react'
import { iNode } from '../node.type'
import NestedTableComponent from './NestedTable.component'

function AllPodsComponent(props) {
    return (<div>
        <div className="flex left old-new-switch-container">
            <div
                className={`no-decor old-new-link flex left column pl-16 pr-16 pointer `}
                // onClick={(e) => selectPodTab('new')}
                data-testid="all-pods-new"
            >
                <div className="fs-14 fw-6">New Pods (newPodStats.all)</div>
                <div className="flex left fs-12 cn-9">
                    <React.Fragment>
                        {<span className="bullet mr-4 ml-4"></span>}
                        <span data-testid={`new-pod-status`}> newPodStats[status] </span>
                    </React.Fragment>
                </div>
            </div>
            <div
                className={`no-decor old-new-link flex left column pl-16 pr-16 pointer  `}
                // onClick={(e) => selectPodTab('old')}
                data-testid="all-pods-old"
            >
                <div className="fs-14 fw-6">Old Pods (oldPodStats.all)</div>
                <div className="flex left fs-12 cn-9">
                    <React.Fragment >
                        {<span className="bullet mr-4 ml-4"></span>}
                        <span > oldPodStats[status]</span>
                    </React.Fragment>
                </div>
            </div>
        </div>
        <NestedTableComponent selectedNode={props.selectedNode}/>
    </div>
    )
}

export default AllPodsComponent
