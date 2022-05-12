import React, { useEffect } from 'react'
import { NavLink, useRouteMatch } from 'react-router-dom'
import { DeploymentTemplateList } from '../cd.type'
import { DEPLOYMENT_HISTORY_LINK_MAP, DEPLOYMENT_HISTORY_LIST } from './constants'

export interface DeploymentHistorySidebar {
    deploymentHistoryList: DeploymentTemplateList[]
}

function DeploymentHistorySidebar({ deploymentHistoryList }: DeploymentHistorySidebar) {
    const match = useRouteMatch()
    return (
        <div className="bcn-0">
            {deploymentHistoryList?.map((elm, index) => {
                console.log(elm)
                const newURL =  `${match.url}/${elm.name}/${elm.id}`

                return elm.childList?.length > 1 ? (
                    elm.childList.map((el) => {
                        return (
                            <div className={`cursor`} key={`deployment-history-sidebar-${index}`}>
                                <NavLink
                                    activeClassName="active"
                                    to={`${newURL}/${el}`}
                                    className={
                                        'inline-block no-decor pt-12 pb-12 pl-16 pr-12 fs-13 cn-9 configuration-link w-280'
                                    }
                                >
                                    {el}
                                </NavLink>
                            </div>
                        )
                    })
                ) : (
                    <div className={`cursor`} key={`deployment-history-sidebar-${index}`}>
                        <NavLink
                            activeClassName="active"
                            to={newURL}
                            className={
                                'inline-block no-decor pt-12 pb-12 pl-16 pr-12 fs-13 cn-9 configuration-link w-280'
                            }
                        >
                            {elm.name}
                        </NavLink>
                    </div>
                )
            })}
        </div>
    )
}

export default DeploymentHistorySidebar
