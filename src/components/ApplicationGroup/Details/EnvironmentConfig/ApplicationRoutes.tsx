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

import { Fragment } from 'react'
import { generatePath, Route, Routes, useParams } from 'react-router-dom'

import { ROUTER_URLS } from '@devtron-labs/devtron-fe-common-lib'

import { DEPLOYMENT_CONFIGURATION_RESOURCE_TYPE_ROUTE } from '@Config/constants'
import { EnvConfigurationsNav } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/Navigation/EnvConfigurationsNav'
import { renderNavItem } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/Navigation/Navigation.helper'

import { ApplicationRouteType } from '../../AppGroup.types'

const path = `${ROUTER_URLS.APP_GROUP_DETAILS.CONFIGURATIONS}/:appId?`

const ApplicationRoute = ({
    envAppList,
    envConfig,
    fetchEnvConfig,
    appIdToAppApprovalConfigMap,
}: ApplicationRouteType) => {
    const { envId, appId } = useParams<{ envId: string; appId: string }>()

    return (
        <Routes>
            {!!appId && (
                <Route
                    path={`${DEPLOYMENT_CONFIGURATION_RESOURCE_TYPE_ROUTE}?/*`}
                    element={
                        <EnvConfigurationsNav
                            key={appId}
                            envConfig={envConfig}
                            fetchEnvConfig={fetchEnvConfig}
                            environments={envAppList}
                            goBackURL={generatePath(path, { envId })}
                            showDeploymentTemplate
                            paramToCheck="appId"
                            compareWithURL={path}
                            showComparison
                            appOrEnvIdToResourceApprovalConfigurationMap={appIdToAppApprovalConfigMap}
                            isTemplateView={false}
                            path={`${path}/${DEPLOYMENT_CONFIGURATION_RESOURCE_TYPE_ROUTE}?`}
                        />
                    }
                />
            )}

            <Route
                index
                key="default-navigation"
                element={
                    <>
                        <div className="pt-8 px-8" data-testid="application-group-configuration-heading">
                            <h4
                                className="m-0 fs-12 lh-20 cn-7 px-8 py-4 w-100"
                                data-testid="application-group-configuration-heading"
                            >
                                APPLICATIONS
                            </h4>
                        </div>
                        <div className="px-8 pb-8 dc__overflow-auto">
                            {envAppList.map(({ name, id }) => (
                                <Fragment key={id}>
                                    {renderNavItem({
                                        title: name,
                                        isProtectionAllowed: appIdToAppApprovalConfigMap?.[id]?.isApprovalApplicable,
                                        href: generatePath(path, {
                                            envId,
                                            appId: String(id),
                                        }),
                                    })}
                                </Fragment>
                            ))}
                        </div>
                    </>
                }
            />
        </Routes>
    )
}

export default ApplicationRoute
