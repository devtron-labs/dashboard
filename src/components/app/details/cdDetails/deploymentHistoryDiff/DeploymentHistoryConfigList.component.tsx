import React, { useEffect, useState } from 'react'
import { ReactComponent as RightArrow } from '../../../../../assets/icons/ic-arrow-left.svg'
import { NavLink } from 'react-router-dom'
import { useRouteMatch, useParams } from 'react-router'
import { DeploymentTemplateList } from '../cd.type'
import { DeploymentHistoryParamsType } from './types'
import { getDeploymentHistoryList } from '../service'
import { DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP, EMPTY_STATE_STATUS } from '../../../../../config'
import CDEmptyState from '../CDEmptyState'
import { Progressing } from '../../../../common'
import AppNotDeployed from '../../../../../assets/img/app-not-deployed.png'
import GenericEmptyState from '../../../../EmptyState/GenericEmptyState'

interface TemplateConfiguration {
  setFullScreenView: React.Dispatch<React.SetStateAction<boolean>>
    deploymentHistoryList: DeploymentTemplateList[]
    setDeploymentHistoryList: React.Dispatch<React.SetStateAction<DeploymentTemplateList[]>>
}

export default function DeploymentHistoryConfigList({
  setFullScreenView,
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
                  setFullScreenView(false)
                }}
                className="bcb-1 dc__no-decor bcn-0 cn-9 pl-16 pr-16 pt-12 pb-12 br-4 en-2 bw-1 mb-12 flex dc__content-space cursor lh-20"
            >
                {childComponentName ? childComponentName : currentComponent.DISPLAY_NAME}
                <RightArrow className="rotate icon-dim-20" style={{ ['--rotateBy' as any]: '180deg' }} />
            </NavLink>
        )
    }

    return (
        <>
            {!deploymentHistoryList && !deploymentListLoader ? (
                 <GenericEmptyState
                    title={EMPTY_STATE_STATUS.DEPLOYMENT_HISTORY_CONFIG_LIST.TITLE}
                    subTitle={EMPTY_STATE_STATUS.DEPLOYMENT_HISTORY_CONFIG_LIST.SUBTITLE}
                />
            ) : deploymentListLoader ? (
                <Progressing pageLoader />
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
