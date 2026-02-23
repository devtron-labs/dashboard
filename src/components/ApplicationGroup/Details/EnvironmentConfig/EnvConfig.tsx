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

import { useEffect, useMemo, useState } from 'react'
import { generatePath, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'

import {
    BASE_CONFIGURATION_ENV_ID,
    GenericEmptyState,
    noop,
    Progressing,
    ResourceIdToResourceApprovalPolicyConfigMapType,
    ROUTER_URLS,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'
import { DEPLOYMENT_CONFIGURATION_RESOURCE_TYPE_ROUTE } from '@Config/constants'
import { URLS } from '@Config/routes'
import { ENV_CONFIG_PATH_REG } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/AppConfig.constants'
import { EnvConfigType } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/AppConfig.types'
import { DeploymentConfigCompareWrapper } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/MainContent/DeploymentConfigCompare'
import { getEnvConfig } from '@Pages/Applications/DevtronApps/service'
import EnvironmentOverride from '@Pages/Shared/EnvironmentOverride/EnvironmentOverride'

import { getConfigAppList } from '../../AppGroup.service'
import { AppGroupDetailDefaultType, ApplicationRouteType, ConfigAppList } from '../../AppGroup.types'
import ApplicationRoute from './ApplicationRoutes'

const getApprovalPolicyConfigForEnv: (envId: number) => Promise<ResourceIdToResourceApprovalPolicyConfigMapType> =
    importComponentFromFELibrary('getApprovalPolicyConfigForEnv', null, 'function')

const EnvConfig = ({ filteredAppIds, envName }: AppGroupDetailDefaultType) => {
    // HOOKS
    const params = useParams<{ envId: string; appId: string }>()
    const { appId, envId } = params
    const { pathname } = useLocation()
    const navigate = useNavigate()

    // ASYNC CALLS
    const [loading, initDataResults] = useAsync(
        () =>
            Promise.allSettled([
                getConfigAppList(+envId, filteredAppIds),
                typeof getApprovalPolicyConfigForEnv === 'function'
                    ? getApprovalPolicyConfigForEnv(Number(envId))
                    : null,
            ]),
        [filteredAppIds],
    )

    const [envConfigLoading, setEnvConfigLoading] = useState<boolean>(false)
    const [envConfigRes, setEnvConfigRes] = useState<EnvConfigType>(null)

    const fetchEnvConfig = async (
        propsEnvId?: number,
        callback?: Parameters<ApplicationRouteType['fetchEnvConfig']>[1],
    ) => {
        setEnvConfigLoading(true)
        try {
            if (appId) {
                const res = await getEnvConfig(+appId, +envId, false, callback)
                setEnvConfigRes(res)
            } else {
                setEnvConfigRes(null)
            }
        } catch {
            // Do nothing
        } finally {
            setEnvConfigLoading(false)
        }
    }

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        fetchEnvConfig()
    }, [])

    const envConfig = {
        config: envConfigRes,
        isLoading: envConfigLoading,
    }

    // CONSTANTS
    const { envAppList, appIdToAppApprovalConfigMap } = useMemo<{
        envAppList: ConfigAppList[]
        appIdToAppApprovalConfigMap: ResourceIdToResourceApprovalPolicyConfigMapType
    }>(() => {
        if (
            initDataResults?.[0].status === 'fulfilled' &&
            initDataResults?.[1].status === 'fulfilled' &&
            initDataResults[0].value?.result?.length
        ) {
            const _appIdToAppApprovalConfigMap = initDataResults[1].value
            const _appList = initDataResults[0].value.result

            _appList.sort((a, b) => a.name.localeCompare(b.name))

            return {
                envAppList: _appList,
                appIdToAppApprovalConfigMap: _appIdToAppApprovalConfigMap,
            }
        }

        return {
            envAppList: [],
            appIdToAppApprovalConfigMap: {
                [BASE_CONFIGURATION_ENV_ID]: null,
            },
        }
    }, [initDataResults])

    const isAppNotPresentInEnv = useMemo(
        () => envAppList.length && appId && !envAppList.some(({ id }) => id === +appId),
        [envAppList, appId],
    )

    useEffect(() => {
        // If the app is unavailable in the current environment, redirect to the app selection page
        if (isAppNotPresentInEnv) {
            navigate(generatePath(ROUTER_URLS.APP_GROUP_DETAILS.CONFIGURATIONS, { envId }), { replace: true })
        }
    }, [isAppNotPresentInEnv])

    if (loading || !envAppList.length || isAppNotPresentInEnv) {
        return (
            <div className="flex-grow-1">
                <Progressing pageLoader />
            </div>
        )
    }

    return (
        <Routes>
            {appId && (
                <Route
                    path={`${URLS.APP_ENV_CONFIG_COMPARE}/:compareTo/${DEPLOYMENT_CONFIGURATION_RESOURCE_TYPE_ROUTE}/:resourceName?`}
                    element={
                        <DeploymentConfigCompareWrapper
                            type="appGroup"
                            envName={envName}
                            environments={envAppList}
                            routePath={`${ROUTER_URLS.APP_GROUP_DETAILS.CONFIGURATIONS}/:appId/${URLS.APP_ENV_CONFIG_COMPARE}/:compareTo/${DEPLOYMENT_CONFIGURATION_RESOURCE_TYPE_ROUTE}/:resourceName?`}
                            baseGoBackURL={generatePath(ROUTER_URLS.APP_GROUP_DETAILS.CONFIGURATIONS, { envId })}
                            appOrEnvIdToResourceApprovalConfigurationMap={appIdToAppApprovalConfigMap}
                        />
                    }
                />
            )}
            <Route
                index
                path="/*"
                element={
                    <div className="env-compose deploy-config-collapsible-layout flex-grow-1">
                        <div
                            className={`env-compose__nav collapsible-sidebar ${pathname.match(ENV_CONFIG_PATH_REG) ? 'env-configurations' : ''}`}
                        >
                            <ApplicationRoute
                                key={appId}
                                envAppList={envAppList}
                                envConfig={envConfig}
                                fetchEnvConfig={fetchEnvConfig}
                                appIdToAppApprovalConfigMap={appIdToAppApprovalConfigMap}
                            />
                        </div>
                        {appId ? (
                            <div className="env-compose__main">
                                <EnvironmentOverride
                                    appList={envAppList}
                                    environments={[]}
                                    reloadEnvironments={noop}
                                    envName={envName}
                                    envConfig={envConfig}
                                    fetchEnvConfig={fetchEnvConfig}
                                    onErrorRedirectURL={generatePath(ROUTER_URLS.APP_GROUP_DETAILS.CONFIGURATIONS, {
                                        envId,
                                    })}
                                    appOrEnvIdToResourceApprovalConfigurationMap={appIdToAppApprovalConfigMap}
                                    isTemplateView={false}
                                    routePath={`${ROUTER_URLS.APP_GROUP_DETAILS.CONFIGURATIONS}/:appId`}
                                />
                            </div>
                        ) : (
                            <GenericEmptyState
                                title="Select an application to view & edit its configurations"
                                subTitle="You can view and edit configurations for all applications deployed on this environment"
                            />
                        )}
                    </div>
                }
            />
        </Routes>
    )
}

export default EnvConfig
