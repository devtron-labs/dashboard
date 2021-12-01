import React from 'react'
import { Drawer, VisibleModal } from '../../../../common'
import TableUtil from '../../../utils/tableUtils/Table.util'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg';

const AppDetailJSON = {
    tHead: [
        { value: "NAME", className: "table__padding-left col-md-5" },
        { value: "STATUS", className: "col-md-2" },
        { value: "MESSAGE", className: "table__padding-right col-md-5" },
    ],
    tBody: [
        [
            { value: " manish-testing-devtron-demo-service", className: "table__padding-left col-md-5" },
            { value: "healthy", className: "col-md-2" },
            { value: "Waiting for rollout to finish: 0 out of 1 new replicas are availab", className: "table__padding-right col-md-5" },

        ],
        [
            { value: "manish-testing-devtron-demo-service-fh48c", className: "table__padding-left col-md-5" },
            { value: "progressing", className: "col-md-2" },
            { value: "Waiting for rollout to finish: 0 out of 1 new replicas are available.", className: "table__padding-right col-md-5" },
        ],
        [
            { value: "shivani-testing-devtron-demo-service-fh48c", className: "table__padding-left col-md-5" },
            { value: "imagepullbackoff", className: "col-md-2" },
            { value: "Back-off pulling image 686244538589.dkr.ecr.us-east-2.amazonaws.com/dheeth/devtron:tag1new-27", className: "table__padding-right col-md-5" },
        ]
    ]
}

function AppStatusDetailModal({ message, close, status }) {
    return (
        <Drawer position="right" width="50%" onClose={close} >
                <div className="app-status-detail-modal bcn-0 pt-12">

                    <div className="app-status-detail__header box-shadow pb-12 mb-8">
                        <div className="title flex content-space cn-9 fs-16 fw-6 pl-20 pr-20 ">
                            App status detail
                     <span className="cursor" onClick={close} ><Close className="icon-dim-24" /></span>
                        </div>
                        <div className="flex left">
                            <div className={`subtitle app-summary__status-name fw-6 pl-20 f-${status.toLowerCase()} mr-16`}>{status.toUpperCase()}</div>
                            {/* {message && <div>{message}</div>} */}
                        </div>
                    </div>

                    <div className="app-status-detail__header">
                        <TableUtil table={AppDetailJSON} />
                    </div>
                </div>
        </Drawer>
    )
}

export default AppStatusDetailModal
