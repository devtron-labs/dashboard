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
import { generatePath, Route, Switch, useRouteMatch } from 'react-router-dom'

import { DEPLOYMENT_CONFIGURATION_RESOURCE_TYPE_ROUTE } from '@Config/constants'
import { EnvConfigurationsNav } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/Navigation/EnvConfigurationsNav'
import { renderNavItem } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/Navigation/Navigation.helper'

import { ApplicationRouteType } from '../../AppGroup.types'

const ApplicationRoute = ({
    envAppList,
    envConfig,
    fetchEnvConfig,
    appIdToAppApprovalConfigMap,
}: ApplicationRouteType) => {
    const {
        url,
        params: { envId, appId },
        path,
    } = useRouteMatch<{ envId: string; appId: string }>()

    return (
        <Switch>
            {!!appId && (
                <Route path={`${path}/${DEPLOYMENT_CONFIGURATION_RESOURCE_TYPE_ROUTE}?`}>
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
                    />
                </Route>
            )}

            <Route key="default-navigation">
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
                                href: `${url}/${id}`,
                            })}
                        </Fragment>
                    ))}
                </div>
            </Route>
        </Switch>
    )
}

export default ApplicationRoute
