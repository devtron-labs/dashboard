import React from 'react'
import { VisibleModal } from '../../../../common'
import TableUtil from '../../../utils/tableUtils/Table.util'

const AppDetailJSON = {
    tHead: [
        { value: "name", className: "pl-20 pr-20" },
        { value: "status" },
        { value: "message" },
    ],
    tBody: [
        [
            { value: " manish-testing-devtron-demo-service", className: "pl-20 pr-20" },
            { value: "healthy" },
            { value: "Waiting for rollout to finish: 0 out of 1 new replicas are availab" },

        ],
        [
            { value: "manish-testing-devtron-demo-service-fh48c", className: "pl-20 pr-20" },
            { value: "progressing" },
            { value: "Waiting for rollout to finish: 0 out of 1 new replicas are available." },
        ],
        [
            { value: "shivani-testing-devtron-demo-service-fh48c", className: "pl-20 pr-20" },
            { value: "imagepullbackoff" },
            { value: "Back-off pulling image 686244538589.dkr.ecr.us-east-2.amazonaws.com/dheeth/devtron:tag1new-27" },
        ]
    ]
}

function AppStatusDetailModal({ message, close, status }) {
    return (
        <VisibleModal className="app-status__material-modal">
            <div className="app-status-detai bcn-0">
                <div className="title flex left">
                    App status detail
               <div className="fa fa-close" onClick={close} />
                </div>
                <div className="flex left">
                    <div className={`subtitle app-summary__status-name f-${status.toLowerCase()} mr-16`}>{status}</div>
                    {message && <div>{message}</div>}
                </div>
                <TableUtil table={AppDetailJSON} />
            </div>
        </VisibleModal>
    )
}

export default AppStatusDetailModal
