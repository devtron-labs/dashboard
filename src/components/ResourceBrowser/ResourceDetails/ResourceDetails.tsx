import React from 'react'
import { LogSearchTermType } from '../../v2/appDetails/appDetails.type'
import NodeDetailComponent from '../../v2/appDetails/k8Resource/nodeDetail/NodeDetail.component'
import './ResourceDetails.scss'

export default function ResourceDetails({ logSearchTerms, setLogSearchTerms }: LogSearchTermType) {
    return <div className="resource-details-container">
        <NodeDetailComponent logSearchTerms={logSearchTerms} setLogSearchTerms={setLogSearchTerms} />
    </div>
}