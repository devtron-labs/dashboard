import React, { useEffect, useState } from 'react'
import { ReactComponent as RightArrow } from '../../../../../assets/icons/ic-arrow-left.svg'
import { NavLink } from 'react-router-dom'
import { useRouteMatch, useParams } from 'react-router'
import { DeploymentHistoryParamsType, DeploymentTemplateList } from '../cd.type'
import { getDeploymentHistoryList } from '../service'
import { DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP } from '../../../../../config'
import CDEmptyState from '../CDEmptyState'

interface TemplateConfiguration {
    setShowTemplate: (boolean) => void
    deploymentHistoryList: DeploymentTemplateList[]
    setDeploymentHistoryList: React.Dispatch<React.SetStateAction<DeploymentTemplateList[]>>
}

export default function DeploymentHistoryConfigList({
    setShowTemplate,
    deploymentHistoryList,
    setDeploymentHistoryList: setDeploymentHistoryList,
}: TemplateConfiguration) {
    const match = useRouteMatch()
    const { appId, pipelineId, triggerId } = useParams<DeploymentHistoryParamsType>()
    const [deploymentListLoader, setDeploymentListLoader] = useState<boolean>(false)

    useEffect(() => {
        setDeploymentListLoader(true)
        getDeploymentHistoryList(appId, pipelineId, triggerId).then((response) => {
            setDeploymentHistoryList(response.result)
            setDeploymentListLoader(false)
        })
    }, [triggerId])

    const getNavLink = (componentId: number, componentName: string, key: string, childComponentName?: string) => {
        const currentComponent = DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP[componentName]
        const configURL = `${match.url}/${currentComponent.VALUE}/${componentId}${
            childComponentName ? `/${childComponentName}` : ''
        }`
        return (
            <NavLink
                key={key}
                to={configURL}
                activeClassName="active"
                onClick={() => {
                    setShowTemplate(true)
                }}
                className="bcb-1 no-decor bcn-0 cn-9 pl-16 pr-16 pt-12 pb-12 br-4 en-2 bw-1 mb-12 flex content-space cursor lh-20"
            >
                {childComponentName ? childComponentName : currentComponent.DISPLAY_NAME}
                <RightArrow className="rotate icon-dim-20" style={{ ['--rotateBy' as any]: '180deg' }} />
            </NavLink>
        )
    }

    return (
        <>
            {!deploymentHistoryList && !deploymentListLoader ? (
                <CDEmptyState />
            ) : (
                deploymentHistoryList &&
                deploymentHistoryList.map((historicalComponent, index) => {
                    return (
                        <div className="m-20 fs-13 cn-9" key={`history-list__${index}`}>
                            {historicalComponent.childList?.length > 0 ? (
                                <>
                                    <div className="fs-14 fw-6 mb-12 ">
                                        {
                                            DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP[historicalComponent.name]
                                                .DISPLAY_NAME
                                        }
                                    </div>
                                    {historicalComponent.childList.map((historicalComponentName, childIndex) =>
                                        getNavLink(
                                            historicalComponent.id,
                                            historicalComponent.name,
                                            `config-${index}-${childIndex}`,
                                            historicalComponentName,
                                        ),
                                    )}
                                </>
                            ) : (
                                getNavLink(historicalComponent.id, historicalComponent.name, `config-${index}`)
                            )}
                        </div>
                    )
                })
            )}
        </>
    )
}
