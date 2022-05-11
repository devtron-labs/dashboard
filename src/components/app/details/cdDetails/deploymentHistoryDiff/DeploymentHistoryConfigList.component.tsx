import React, { useEffect, useState } from 'react'
import { ReactComponent as RightArrow } from '../../../../../assets/icons/ic-arrow-left.svg'
import { NavLink } from 'react-router-dom'
import { useRouteMatch, useParams } from 'react-router'
import { DeploymentTemplateConfiguration, DeploymentTemplateList } from '../cd.type'
import CDEmptyState from '../CDEmptyState'
import { DEPLOYMENT_HISTORY_LINK_MAP } from './constants'
import { use } from 'chai'
import { getDeploymentHistoryList } from '../service'

interface TemplateConfiguration {
    setShowTemplate: (boolean) => void
    deploymentTemplatesConfiguration: DeploymentTemplateConfiguration[]
    setBaseTimeStamp
    baseTimeStamp: string
}

export default function DeploymentTemplateWrapper({
    setShowTemplate,
    deploymentTemplatesConfiguration,
    setBaseTimeStamp,
    baseTimeStamp,
}: TemplateConfiguration) {
    const match = useRouteMatch()
    const { appId, pipelineId, triggerId } = useParams<{ appId: string; pipelineId: string; triggerId: string }>()
    const deploymentTemplateFilteredTrigger = deploymentTemplatesConfiguration?.find(
        (dt) => dt.wfrId.toString() === triggerId,
    )
    const isLastDeploymentTemplatesConfiguration =
        deploymentTemplatesConfiguration &&
        deploymentTemplatesConfiguration.length > 0 &&
        deploymentTemplatesConfiguration[deploymentTemplatesConfiguration.length - 1]?.wfrId.toString() === triggerId
    const [deploymentHistoryList, setDepolymentHistoryList] = useState<DeploymentTemplateList[]>()

    useEffect(() => {
        getDeploymentHistoryList(appId, pipelineId, triggerId).then((response) => {
            setDepolymentHistoryList(response.result)
        })
    }, [triggerId])

    return deploymentTemplateFilteredTrigger && !isLastDeploymentTemplatesConfiguration ? (
        <>
            {deploymentHistoryList &&
                deploymentHistoryList.map((li, index) => {
                    return (
                        <div className="m-20 fs-13 cn-9" key={`history-list__${index}`}>
                            <div className="fs-14 fw-6 mb-12 ">{li.childList?.length > 0 && li.name.replace('-', '').toUpperCase()}</div>
                            {li.childList?.length > 1 ? (
                                li.childList.map((el) => {
                                    return (
                                        <NavLink
                                            to={`${match.url}/${DEPLOYMENT_HISTORY_LINK_MAP[li.name.toLowerCase()]}`}
                                            activeClassName="active"
                                            onClick={() => {
                                                setShowTemplate(true)
                                                setBaseTimeStamp(baseTimeStamp)
                                            }}
                                            className="bcb-1 no-decor bcn-0 cn-9 pl-16 pr-16 pt-12 pb-12 br-4 en-2 bw-1 mb-12 flex content-space cursor lh-20 text-capitalize"
                                        >
                                            {el.replace('-', ' ')}
                                            <RightArrow
                                                className="rotate icon-dim-20"
                                                style={{ ['--rotateBy' as any]: '180deg' }}
                                            />
                                        </NavLink>
                                    )
                                })
                            ) : (
                                <NavLink
                                    to={`${match.url}/${DEPLOYMENT_HISTORY_LINK_MAP[li.name.toLowerCase()]}`}
                                    activeClassName="active"
                                    onClick={() => {
                                        setShowTemplate(true)
                                        setBaseTimeStamp(baseTimeStamp)
                                    }}
                                    className="bcb-1 no-decor bcn-0 cn-9 pl-16 pr-16 pt-12 pb-12 br-4 en-2 bw-1 mb-20 flex content-space cursor lh-20 text-capitalize"
                                >
                                    {li.name.replace('_', ' ')}
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
    ) : (
        <CDEmptyState />
    )
}
