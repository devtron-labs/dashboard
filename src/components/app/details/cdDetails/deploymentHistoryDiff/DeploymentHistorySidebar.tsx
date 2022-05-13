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
        <div className="pt-8 pb-8 bcn-0 border-right">
            {deploymentHistoryList?.map((historicalComponent, index) => {
                const newURL = `${match.url.split(URLS.DEPLOYMENT_HISTORY_CONFIGURATIONS)[0]}${
                    URLS.DEPLOYMENT_HISTORY_CONFIGURATIONS
                }/${historicalComponent.name.toLowerCase()}/${historicalComponent.id}`

                return historicalComponent.childList?.length > 1 ? (
                    historicalComponent.childList.map((historicalComponentName, idx) => {
                        return (
                            <div className={`cursor`} key={`deployment-history-childlist__${idx}`}>
                                <NavLink
                                    activeClassName="active"
                                    to={`${newURL}/${historicalComponentName}`}
                                    className={
                                        'inline-block no-decor pt-12 pb-12 pl-16 pr-12 fs-13 cn-9 configuration-link w-280'
                                    }
                                >
                                    {historicalComponent.name}/{historicalComponentName.toLowerCase()}
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
                                'historical-name inline-block no-decor pt-12 pb-12 pl-16 pr-12 fs-13 cn-9 configuration-link w-280 text-capitalize'
                            }
                        >
                            {historicalComponent.name.replace('_', ' ').toLowerCase()}
                        </NavLink>
                    </div>
                )
            })}
        </div>
    )
}

export default DeploymentHistorySidebar
