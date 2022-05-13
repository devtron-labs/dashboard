import React, { useEffect } from 'react'
import { NavLink, useRouteMatch, useParams } from 'react-router-dom'
import { DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP, URLS } from '../../../../../config'
import { DeploymentTemplateList } from '../cd.type'
import { getDeploymentHistoryList } from '../service'

export interface DeploymentHistorySidebar {
    deploymentHistoryList: DeploymentTemplateList[]
    setDeploymentHistoryList: React.Dispatch<React.SetStateAction<DeploymentTemplateList[]>>
}

function DeploymentHistorySidebar({ deploymentHistoryList, setDeploymentHistoryList }: DeploymentHistorySidebar) {
    const match = useRouteMatch()
    const { appId, pipelineId, triggerId } = useParams<{ appId: string; pipelineId: string; triggerId: string }>()
    useEffect(() => {
        if (!deploymentHistoryList) {
            getDeploymentHistoryList(appId, pipelineId, triggerId).then((response) => {
                setDeploymentHistoryList(response.result)
            })
        }
    }, [deploymentHistoryList])

    const getNavLink = (componentId: number, componentName: string, key: string, childComponentName?: string) => {
        const currentComponent = DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP[componentName]
        const configURL = `${match.url.split(URLS.DEPLOYMENT_HISTORY_CONFIGURATIONS)[0]}${
            URLS.DEPLOYMENT_HISTORY_CONFIGURATIONS
        }/${currentComponent.VALUE}/${componentId}${childComponentName ? '/' + childComponentName : ''}`
        return (
            <div className={`cursor`} key={key}>
                <NavLink
                    to={configURL}
                    activeClassName="active"
                    className="historical-name inline-block no-decor pt-12 pb-12 pl-16 pr-12 fs-13 cn-9 configuration-link w-280 text-capitalize"
                >
                    {currentComponent.DISPLAY_NAME + (childComponentName ? '/' + childComponentName : '')}
                </NavLink>
            </div>
        )
    }

    return (
        <div className="pt-8 pb-8 bcn-0 border-right">
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
