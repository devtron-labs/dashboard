import React from 'react'
import { VisibleModal } from '../../../../common'
import TableUtil from '../../../utils/tableUtils/Table.util'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg';

const AppDetailJSON = {
    tHead: [
        { value: "NAME", className: "pl-20" },
        { value: "STATUS", },
        { value: "MESSAGE"},
    ],
    tBody: [
        [
            { value: " manish-testing-devtron-demo-service", className: "pl-20" },
            { value: "healthy" },
            { value: "Waiting for rollout to finish: 0 out of 1 new replicas are availab" },

        ],
        [
            { value: "manish-testing-devtron-demo-service-fh48c", className: "pl-20" },
            { value: "progressing" },
            { value: "Waiting for rollout to finish: 0 out of 1 new replicas are available." },
        ],
        [
            { value: "shivani-testing-devtron-demo-service-fh48c", className: "pl-20" },
            { value: "imagepullbackoff" },
            { value: "Back-off pulling image 686244538589.dkr.ecr.us-east-2.amazonaws.com/dheeth/devtron:tag1new-27" },
        ]
    ]
}

function AppStatusDetailModal({ message, close, status }) {
    return (
        <VisibleModal className="app-status__material-modal">
            <div className="app-status-detail-modal bcn-0 pt-12">

                <div className="app-status-detail__header border-shadow pb-12 mb-8">
                    <div className="title flex content-space cn-9 fs-16 fw-6 pl-20 pr-20 ">
                        App status detail
                     <span className="cursor" onClick={close} ><Close className="icon-dim-24" /></span>
                    </div>
                    <div className="flex left">
                        <div className={`subtitle app-summary__status-name fw-6 pl-20 f-${status.toLowerCase()} mr-16`}>{status.toUpperCase()}</div>
                        {/* {message && <div>{message}</div>} */}
                    </div>
                </div>

                <div className="app-status-detail__header ">
                    <TableUtil table={AppDetailJSON} gap20="20px" gap12="12px" />
                </div>
            </div>
        </VisibleModal>
    )
}

export default AppStatusDetailModal
