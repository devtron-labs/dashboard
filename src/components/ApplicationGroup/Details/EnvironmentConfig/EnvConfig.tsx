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
import { generatePath, Route, Switch, useHistory, useLocation, useRouteMatch } from 'react-router-dom'

import {
    BASE_CONFIGURATION_ENV_ID,
    EnvResourceType,
    GenericEmptyState,
    Progressing,
    ResourceIdToResourceApprovalPolicyConfigMapType,
    noop,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'

import { URLS } from '@Config/routes'
import { importComponentFromFELibrary } from '@Components/common'
import { getEnvConfig } from '@Pages/Applications/DevtronApps/service'
import EnvironmentOverride from '@Pages/Shared/EnvironmentOverride/EnvironmentOverride'
import { ENV_CONFIG_PATH_REG } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/AppConfig.constants'
import { DeploymentConfigCompare } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/MainContent/DeploymentConfigCompare'

import { EnvConfigType } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/AppConfig.types'
import { DEPLOYMENT_CONFIGURATION_RESOURCE_TYPE_ROUTE } from '@Config/constants'
import { getConfigAppList } from '../../AppGroup.service'
import { AppGroupDetailDefaultType, ApplicationRouteType, ConfigAppList } from '../../AppGroup.types'
import ApplicationRoute from './ApplicationRoutes'

const getApprovalPolicyConfigForEnv: (envId: number) => Promise<ResourceIdToResourceApprovalPolicyConfigMapType> =
    importComponentFromFELibrary('getApprovalPolicyConfigForEnv', null, 'function')

const EnvConfig = ({ filteredAppIds, envName }: AppGroupDetailDefaultType) => {
    // HOOKS
    const { path, params } = useRouteMatch<{ envId: string; appId: string }>()
    const { appId, envId } = params
    const { pathname } = useLocation()
    const { replace } = useHistory()

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
                const res = await getEnvConfig(+appId, +envId, callback)
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
            replace(generatePath(path, { ...params, appId: null }))
        }
    }, [isAppNotPresentInEnv])

    if (loading || !envAppList.length || isAppNotPresentInEnv) {
        return (
            <div className="loading-state">
                <Progressing pageLoader />
            </div>
        )
    }

    return (
        <Switch>
            <Route
                path={`${path}/${URLS.APP_ENV_CONFIG_COMPARE}/:compareTo/${DEPLOYMENT_CONFIGURATION_RESOURCE_TYPE_ROUTE}/:resourceName?`}
            >
                {({ match, location }) => {
                    const basePath = generatePath(path, match.params)
                    // Used in cm/cs
                    const resourceNamePath = match.params.resourceName ? `/${match.params.resourceName}` : ''
                    const goBackURL =
                        match.params.resourceType === EnvResourceType.Manifest ||
                        match.params.resourceType === EnvResourceType.PipelineStrategy
                            ? basePath
                            : `${basePath}/${match.params.resourceType}${resourceNamePath}`

                    return (
                        <DeploymentConfigCompare
                            type="appGroup"
                            envName={envName}
                            environments={envAppList}
                            goBackURL={goBackURL}
                            getNavItemHref={(resourceType, resourceName) =>
                                `${generatePath(match.path, { ...match.params, resourceType, resourceName })}${location.search}`
                            }
                            appOrEnvIdToResourceApprovalConfigurationMap={appIdToAppApprovalConfigMap}
                        />
                    )
                }}
            </Route>
            <Route>
                <div className="env-compose">
                    <div
                        className={`env-compose__nav ${pathname.match(ENV_CONFIG_PATH_REG) ? 'env-configurations' : ''}`}
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
                                onErrorRedirectURL={generatePath(path, { envId })}
                                appOrEnvIdToResourceApprovalConfigurationMap={appIdToAppApprovalConfigMap}
                            />
                        </div>
                    ) : (
                        <GenericEmptyState
                            title="Select an application to view & edit its configurations"
                            subTitle="You can view and edit configurations for all applications deployed on this environment"
                        />
                    )}
                </div>
            </Route>
        </Switch>
    )
}

export default EnvConfig
