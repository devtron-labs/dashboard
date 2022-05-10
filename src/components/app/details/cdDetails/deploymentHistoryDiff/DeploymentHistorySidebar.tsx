import React, { useEffect } from 'react'
import { NavLink, useRouteMatch } from 'react-router-dom'
import { DEPLOYMENT_HISTORY_LINK_MAP, DEPLOYMENT_HISTORY_LIST } from './constants'

function DeploymentHistorySidebar() {
    const match = useRouteMatch()
    return (
        <div className="bcn-0">
            {DEPLOYMENT_HISTORY_LIST.map((elm, index) => {
             const url = match.url.includes(DEPLOYMENT_HISTORY_LINK_MAP[elm.label.toLowerCase()]) ? match.url : DEPLOYMENT_HISTORY_LINK_MAP[elm.label.toLowerCase()]

                return (
                    <div className={`fw-6 cursor pt-12 pb-12`} key={`deployment-history-sidebar-${index}`}>
                        <NavLink
                            activeClassName="active"
                            to={url}
                            className={'no-decor pt-12 pb-12 pl-16 pr-12 fs-14 cn-9 node-link w-100'}
                        >
                            {elm.label}
                        </NavLink>
                     </div>
                )
            })}
        </div>
    )
}

export default DeploymentHistorySidebar
