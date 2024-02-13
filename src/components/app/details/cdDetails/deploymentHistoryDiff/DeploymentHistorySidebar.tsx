import React, { useEffect } from 'react'
import { NavLink, useRouteMatch, useParams } from 'react-router-dom'
import { DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP, URLS } from '../../../../../config'
import { DeploymentHistoryParamsType, DeploymentHistorySidebarType } from './types'
import { getDeploymentHistoryList } from '../service'

const DeploymentHistorySidebar = ({
    deploymentHistoryList,
    setDeploymentHistoryList,
}: DeploymentHistorySidebarType) => {
    const match = useRouteMatch()
    const { appId, pipelineId, triggerId } = useParams<DeploymentHistoryParamsType>()
    useEffect(() => {
        if (!deploymentHistoryList) {
            getDeploymentHistoryList(appId, pipelineId, triggerId).then((response) => {
                setDeploymentHistoryList(response.result)
            })
        }
    }, [deploymentHistoryList])

    const getNavLink = (componentId: number, componentName: string, key: string, childComponentName?: string) => {
        const currentComponent = DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP[componentName]
        const childComponentDetail = childComponentName ? `/${childComponentName}` : ''
        const configURL = `${match.url.split(URLS.DEPLOYMENT_HISTORY_CONFIGURATIONS)[0]}${
            URLS.DEPLOYMENT_HISTORY_CONFIGURATIONS
        }/${currentComponent.VALUE}/${componentId}${childComponentDetail}`
        return (
            <div className="cursor" key={key}>
                <NavLink
                    to={configURL}
                    activeClassName="active"
                    className="historical-name dc__inline-block dc__no-decor pt-12 pb-12 pl-16 pr-12 fs-13 cn-9 configuration-link w-280"
                >
                    {currentComponent.DISPLAY_NAME + childComponentDetail}
                </NavLink>
            </div>
        )
    }

    return (
        <div className="pt-8 pb-8 bcn-0 dc__border-right h-100">
            {deploymentHistoryList?.map((historicalComponent, index) => {
                return historicalComponent.childList?.length > 0
                    ? historicalComponent.childList.map((historicalComponentName, childIndex) =>
                          getNavLink(
                              historicalComponent.id,
                              historicalComponent.name,
                              `config-${index}-${childIndex}`,
                              historicalComponentName,
                          ),
                      )
                    : getNavLink(historicalComponent.id, historicalComponent.name, `config-${index}`)
            })}
        </div>
    )
}

export default DeploymentHistorySidebar
