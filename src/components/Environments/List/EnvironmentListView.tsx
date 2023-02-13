import React, { useState, useEffect } from 'react'
import EnvEmptyStates from '../EnvEmptyStates'
import { ReactComponent as EnvIcon } from '../../../assets/icons/ic-environment.svg'
import { NavLink, useLocation, useRouteMatch } from 'react-router-dom'
import { URLS } from '../../../config'
import { useAsync } from '../../common'


export default function EnvironmentsListView({clearSearch}) {
    const match = useRouteMatch()
    const location = useLocation()
    const [filteredEnvList, setFilteredEnvList] = useState([])
    // const [checkingUserRole, userRoleResponse] = useAsync(sxsx, [])

    useEffect(() => {


    },[location.search])

    return (filteredEnvList?.length != 0 ? (
        <EnvEmptyStates actionHandler={clearSearch} />
    ) : (
        <div className="dc__overflow-scroll" style={{ height: `calc(100vh - 125px)` }}>
            <div className="env-list-row fw-6 cn-7 fs-12 dc__border-bottom pt-8 pb-8 pr-20 pl-20 dc__uppercase">
                <div></div>
                <div>Environments</div>
                <div>Namespace</div>
                <div>Cluster</div>
                <div>Applications</div>
            </div>
            {filteredEnvList?.map((envData) => (
                <div className="env-list-row fw-4 cn-9 fs-13 dc__border-bottom-n1 pt-12 pb-12 pr-20 pl-20 ">
                    <EnvIcon className="icon-dim-20" />
                    <div className="cb-5 dc__ellipsis-right">
                        <NavLink to={`${match.url}/${envData.id}`}>{envData.name}</NavLink>
                    </div>
                    <div>{envData.namespace}</div>
                    <div>{envData.cluster}</div>
                    <div>{envData.applications}</div>
                </div>
            ))}
            <div className="env-list-row fw-4 cn-9 fs-13 dc__border-bottom-n1 pt-12 pb-12 pr-20 pl-20 ">
                <EnvIcon className="icon-dim-20" />
                <div className="cb-5 dc__ellipsis-right">
                    <NavLink to={`${URLS.ENVIRONMENT}/1`}>devtron-demo1</NavLink>
                </div>
                <div>devtron-demo1</div>
                <div>default_cluster</div>
                <div>10</div>
            </div>
        </div>
    ))
}