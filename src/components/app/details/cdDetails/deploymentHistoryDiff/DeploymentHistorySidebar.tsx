import React, { useEffect, useState } from 'react'
import { NavLink, useRouteMatch, useParams } from 'react-router-dom'
import { URLS } from '../../../../../config'
import { DeploymentTemplateList } from '../cd.type'
import { getDeploymentHistoryList } from '../service'

export interface DeploymentHistorySidebar {
    deploymentHistoryList: DeploymentTemplateList[]
    setDepolymentHistoryList
}

function DeploymentHistorySidebar({ deploymentHistoryList, setDepolymentHistoryList }: DeploymentHistorySidebar) {
    const match = useRouteMatch()
    const { appId, pipelineId, triggerId } = useParams<{ appId: string; pipelineId: string; triggerId: string }>()
    useEffect(() => {
        if (!deploymentHistoryList) {
            getDeploymentHistoryList(appId, pipelineId, triggerId).then((response) => {
                setDepolymentHistoryList(response.result)
            })
        }
    }, [deploymentHistoryList])
    return (
        <div className="bcn-0">
            {deploymentHistoryList?.map((elm, index) => {
                const newURL = `${match.url.split(URLS.DEPLOYMENT_HISTORY)[0]}${URLS.DEPLOYMENT_HISTORY}/${elm.name}/${
                    elm.id
                }`

                return elm.childList?.length > 1 ? (
                    elm.childList.map((el,idx) => {
                        return (
                            <div className={`cursor`} key={`deployment-history-childlist__${idx}`}>
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
                    <div className={`cursor`} key={`deployment-history-list-${index}`}>
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
