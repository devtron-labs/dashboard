import React, { useEffect } from 'react'
import { ReactComponent as RightArrow } from '../../../../../assets/icons/ic-arrow-left.svg'
import { NavLink } from 'react-router-dom'
import { useRouteMatch, useParams } from 'react-router'
import { DeploymentTemplateConfiguration, DeploymentTemplateList } from '../cd.type'
import CDEmptyState from '../CDEmptyState'
import { getDeploymentHistoryList } from '../service'

interface TemplateConfiguration {
    setShowTemplate: (boolean) => void
    deploymentTemplatesConfiguration: DeploymentTemplateConfiguration[]
    setBaseTimeStamp
    baseTimeStamp: string
    deploymentHistoryList: DeploymentTemplateList[]
    setDepolymentHistoryList
}

export default function DeploymentHistoryConfigList({
    setShowTemplate,
    deploymentTemplatesConfiguration,
    setBaseTimeStamp,
    baseTimeStamp,
    deploymentHistoryList,
    setDepolymentHistoryList,
}: TemplateConfiguration) {
    const match = useRouteMatch()
    const { appId, pipelineId, triggerId } = useParams<{ appId: string; pipelineId: string; triggerId: string }>()

    useEffect(() => {
        getDeploymentHistoryList(appId, pipelineId, triggerId).then((response) => {
            setDepolymentHistoryList(response.result)
        })
    }, [triggerId])

    return (
        <>
            {deploymentHistoryList &&
                deploymentHistoryList.map((historicalComponent, index) => {
                    // const newURL =  match.url.includes(li.name) ? match.url : `${match.url}/${li.name}/${li.id}`
                    const newURL = `${match.url}/${historicalComponent.name}/${historicalComponent.id}`

                    return (
                        <div className="m-20 fs-13 cn-9" key={`history-list__${index}`}>
                            <div className="fs-14 fw-6 mb-12 ">
                                {historicalComponent.childList?.length > 0 &&
                                    historicalComponent.name.replace('-', '').toUpperCase()}
                            </div>
                            {historicalComponent.childList?.length > 1 ? (
                                historicalComponent.childList.map((historicalComponentName, index) => {
                                    return (
                                        <NavLink
                                            key={`config-childlist-${index}`}
                                            to={`${newURL}/${historicalComponentName}`}
                                            activeClassName="active"
                                            onClick={() => {
                                                setShowTemplate(true)
                                                setBaseTimeStamp(baseTimeStamp)
                                            }}
                                            className="bcb-1 no-decor bcn-0 cn-9 pl-16 pr-16 pt-12 pb-12 br-4 en-2 bw-1 mb-12 flex content-space cursor lh-20 text-capitalize"
                                        >
                                            {historicalComponentName.replace('-', ' ')}
                                            <RightArrow
                                                className="rotate icon-dim-20"
                                                style={{ ['--rotateBy' as any]: '180deg' }}
                                            />
                                        </NavLink>
                                    )
                                })
                            ) : (
                                <NavLink
                                    to={newURL}
                                    activeClassName="active"
                                    onClick={() => {
                                        setShowTemplate(true)
                                        setBaseTimeStamp(baseTimeStamp)
                                    }}
                                    className="bcb-1 no-decor bcn-0 cn-9 pl-16 pr-16 pt-12 pb-12 br-4 en-2 bw-1 mb-20 flex content-space cursor lh-20 text-capitalize"
                                >
                                    {historicalComponent.name.replace('_', ' ').toLowerCase()}
                                    <RightArrow
                                        className="rotate icon-dim-20"
                                        style={{ ['--rotateBy' as any]: '180deg' }}
                                    />
                                </NavLink>
                            )}
                        </div>
                    )
                })}
        </>
    )
    //  : (
    //     <CDEmptyState />
    // )
}
