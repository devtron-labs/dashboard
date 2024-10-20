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

import { useEffect } from 'react'
import { NavLink, useRouteMatch, useParams } from 'react-router-dom'
import { DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP } from '../../../constants'
import { DeploymentHistoryParamsType } from './types'
import { getDeploymentHistoryList } from '../service'
import { DeploymentHistorySidebarType } from '../types'
import { URLS } from '../../../../Common'

const DeploymentHistorySidebar = ({
    deploymentHistoryList,
    setDeploymentHistoryList,
}: DeploymentHistorySidebarType) => {
    const match = useRouteMatch()
    const { appId, pipelineId, triggerId } = useParams<DeploymentHistoryParamsType>()
    useEffect(() => {
        if (!deploymentHistoryList) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
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
            {deploymentHistoryList?.map((historicalComponent, index) =>
                historicalComponent.childList?.length > 0
                    ? historicalComponent.childList.map((historicalComponentName, childIndex) =>
                          getNavLink(
                              historicalComponent.id,
                              historicalComponent.name,
                              `config-${index}-${childIndex}`,
                              historicalComponentName,
                          ),
                      )
                    : getNavLink(historicalComponent.id, historicalComponent.name, `config-${index}`),
            )}
        </div>
    )
}

export default DeploymentHistorySidebar
