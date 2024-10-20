/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-nested-ternary */
import { useEffect, useState } from 'react'
import { NavLink, useRouteMatch, useParams } from 'react-router-dom'
import { GenericEmptyState, Progressing } from '../../../../Common'
import { ReactComponent as ICChevron } from '../../../../Assets/Icon/ic-chevron-down.svg'
import { DeploymentHistoryParamsType, TemplateConfiguration } from './types'
import { getDeploymentHistoryList } from '../service'
import { EMPTY_STATE_STATUS, DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP } from '../../../constants'

const DeploymentHistoryConfigList = ({
    setFullScreenView,
    deploymentHistoryList,
    setDeploymentHistoryList,
}: TemplateConfiguration) => {
    const match = useRouteMatch()
    const { appId, pipelineId, triggerId } = useParams<DeploymentHistoryParamsType>()
    const [deploymentListLoader, setDeploymentListLoader] = useState<boolean>(false)

    useEffect(() => {
        setDeploymentListLoader(true)
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        getDeploymentHistoryList(appId, pipelineId, triggerId).then((response) => {
            setDeploymentHistoryList(response.result)
            setDeploymentListLoader(false)
        })
    }, [triggerId])

    const getNavLink = (
        index: number,
        componentId: number,
        componentName: string,
        key: string,
        childComponentName?: string,
    ) => {
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
                data-testid={`configuration-link-option-${index}`}
                className="bcb-1 dc__no-decor bcn-0 cn-9 pl-16 pr-16 pt-12 pb-12 br-4 en-2 bw-1 flex dc__content-space cursor lh-20"
            >
                {childComponentName || currentComponent.DISPLAY_NAME}
                <ICChevron className="icon-dim-20 fcn-6 dc__flip-270" />
            </NavLink>
        )
    }

    return (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>
            {!deploymentHistoryList && !deploymentListLoader ? (
                <GenericEmptyState
                    title={EMPTY_STATE_STATUS.DATA_NOT_AVAILABLE}
                    subTitle={EMPTY_STATE_STATUS.DEPLOYMENT_HISTORY_CONFIG_LIST.SUBTITLE}
                />
            ) : deploymentListLoader ? (
                <Progressing pageLoader />
            ) : (
                deploymentHistoryList &&
                deploymentHistoryList.map((historicalComponent, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <div className="px-20 pt-20 fs-13 cn-9 flexbox-col dc__gap-12" key={`history-list__${index}`}>
                        {historicalComponent.childList?.length > 0 ? (
                            <>
                                <div className="fs-14 fw-6">
                                    {DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP[historicalComponent.name].DISPLAY_NAME}
                                </div>
                                {historicalComponent.childList.map((historicalComponentName, childIndex) =>
                                    getNavLink(
                                        index,
                                        historicalComponent.id,
                                        historicalComponent.name,
                                        `config-${index}-${childIndex}`,
                                        historicalComponentName,
                                    ),
                                )}
                            </>
                        ) : (
                            getNavLink(index, historicalComponent.id, historicalComponent.name, `config-${index}`)
                        )}
                    </div>
                ))
            )}
        </>
    )
}

export default DeploymentHistoryConfigList
