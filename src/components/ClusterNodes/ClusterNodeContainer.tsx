import React from 'react'
import { NavLink } from 'react-router-dom'
import { URLS } from '../../config/routes'
import clusterMovedToResource from '../../assets/img/cluster-redirect.png'
import PageHeader from '../common/header/PageHeader'
import { ReactComponent as Arrow } from '../../assets/icons/ic-arrow-forward.svg'

export default function ClusterNodeContainer() {
    return (
        <div>
            <PageHeader headerName="Clusters" />
            <div className="bcn-0 dc__container-below-header flex">
                <div className="w-600">
                    <div className="fw-6 fs-20 lh-30 flex">This section has moved to Resource Browser</div>
                    <span className="fw-4 fs-14 lh-20 flex mb-20 dc__align-center">Clusters and node details have been merged into the Resource Browser, providing an integrated view of the cluster and its resources.</span>
                    <img style={{"boxShadow": "0px 4px 6px 0px rgba(0, 0, 0, 0.10)"}} className="w-600" src={clusterMovedToResource} />
                    <div className="flex mt-20">
                        <NavLink className="flex h-36 dc__no-decor cta h-28 pl-8 pr-10 pt-5 pb-5 lh-n fcb-5" to={URLS.RESOURCE_BROWSER}>Go to Resource Browser <Arrow className='icon-dim-16 ml-8 scn-0' /></NavLink>
                    </div>
                </div>
            </div>
        </div>
    )
}
