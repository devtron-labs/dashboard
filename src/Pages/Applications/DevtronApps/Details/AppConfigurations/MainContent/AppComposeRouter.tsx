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

import React, { lazy, Suspense } from 'react'
import { useRouteMatch, useHistory, Route, Switch, Redirect, useLocation, generatePath } from 'react-router-dom'
import {
    Progressing,
    EnvResourceType,
    BASE_CONFIGURATION_ENV_ID,
    ApprovalConfigDataKindType,
    getIsApprovalPolicyConfigured,
    CMSecretComponentType,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Next } from '@Icons/ic-arrow-forward.svg'
import { DEPLOYMENT_CONFIGURATION_RESOURCE_TYPE_ROUTE, URLS } from '@Config/index'
import { ErrorBoundary, useAppContext } from '@Components/common'
import ExternalLinks from '@Components/externalLinks/ExternalLinks'
import { ConfigMapSecretWrapper } from '@Pages/Shared/ConfigMapSecret/ConfigMapSecret.wrapper'

import { NextButtonProps, STAGE_NAME } from '../AppConfig.types'
import { useAppConfigurationContext } from '../AppConfiguration.provider'

import '../appConfig.scss'
import { DeploymentConfigCompare } from './DeploymentConfigCompare'

const MaterialList = lazy(() => import('@Components/material/MaterialList'))
const CIConfig = lazy(() => import('@Components/ciConfig/CIConfig'))
const DeploymentTemplate = lazy(() => import('./DeploymentTemplate/DeploymentTemplate'))
const WorkflowEdit = lazy(() => import('@Components/workflowEditor/workflowEditor'))
const EnvironmentOverride = lazy(() => import('@Pages/Shared/EnvironmentOverride/EnvironmentOverride'))
const UserGitRepoConfiguration = lazy(() => import('@Components/gitOps/UserGitRepConfiguration'))

const NextButton: React.FC<NextButtonProps> = ({ isCiPipeline, navItems, currentStageName, isDisabled }) => {
    const history = useHistory()
    const index = navItems.findIndex((item) => item.stage === currentStageName)
    const nextUrl = navItems[index + 1].href
    if (!isCiPipeline) {
        return (
            <div className="app-compose__next-section">
                <button
                    type="button"
                    disabled={isDisabled}
                    className="cta dc__align-right flex"
                    onClick={() => {
                        history.push(nextUrl)
                    }}
                >
                    <span className="mr-5">Next </span>
                    <Next className="icon-dim-18" />
                </button>
            </div>
        )
    }
    return null
}

const AppComposeRouter = () => {
    const { path, url } = useRouteMatch()
    const location = useLocation()
    const {
        appId,
        isUnlocked,
        navItems,
        respondOnSuccess,
        isCiPipeline,
        getWorkflows,
        isCDPipeline,
        environments,
        userRole,
        canShowExternalLinks,
        toggleRepoSelectionTippy,
        setRepoState,
        isJobView,
        reloadEnvironments,
        filteredEnvIds,
        isGitOpsConfigurationRequired,
        reloadAppConfig,
        lastUnlockedStage,
        envConfig,
        fetchEnvConfig,
        envIdToEnvApprovalConfigurationMap,
        isTemplateView,
    } = useAppConfigurationContext()
    const { currentAppName } = useAppContext()

    const approvalConfigMapForBaseConfiguration =
        envIdToEnvApprovalConfigurationMap?.[BASE_CONFIGURATION_ENV_ID]?.approvalConfigurationMap

    const renderJobViewRoutes = (): JSX.Element => (
        // currently the logic for redirection to next unlocked stage is in respondOnSuccess function can be done for MaterialList also
        <Switch>
            <Route path={`${path}/${URLS.APP_GIT_CONFIG}`}>
                <>
                    <MaterialList
                        respondOnSuccess={respondOnSuccess}
                        isWorkflowEditorUnlocked={isUnlocked.workflowEditor}
                        toggleRepoSelectionTippy={toggleRepoSelectionTippy}
                        setRepo={setRepoState}
                        isJobView={isJobView}
                        appId={appId}
                    />
                    <NextButton
                        currentStageName={STAGE_NAME.GIT_MATERIAL}
                        navItems={navItems}
                        isDisabled={!isUnlocked.workflowEditor}
                        isCiPipeline={isCiPipeline}
                    />
                </>
            </Route>
            {isUnlocked.workflowEditor && [
                <Route
                    key={`${path}/${URLS.APP_WORKFLOW_CONFIG}`}
                    path={`${path}/${URLS.APP_WORKFLOW_CONFIG}/:workflowId(\\d+)?`}
                >
                    <WorkflowEdit
                        configStatus={1}
                        isCDPipeline={isCDPipeline}
                        respondOnSuccess={respondOnSuccess}
                        getWorkflows={getWorkflows}
                        isJobView={isJobView}
                        envList={environments}
                        reloadEnvironments={reloadEnvironments}
                        isTemplateView={isTemplateView}
                    />
                </Route>,
                <Route
                    key={`${path}/${URLS.BASE_CONFIG}/${URLS.APP_CM_CONFIG}`}
                    path={`${path}/${URLS.BASE_CONFIG}/${URLS.APP_CM_CONFIG}/:name?`}
                >
                    <ConfigMapSecretWrapper
                        isJob
                        isApprovalPolicyConfigured={false}
                        reloadEnvironments={reloadEnvironments}
                        envConfig={envConfig}
                        fetchEnvConfig={fetchEnvConfig}
                        onErrorRedirectURL={lastUnlockedStage}
                        appName={currentAppName}
                        envName=""
                        isTemplateView={isTemplateView}
                    />
                </Route>,
                <Route
                    key={`${path}/${URLS.BASE_CONFIG}/${URLS.APP_CS_CONFIG}`}
                    path={`${path}/${URLS.BASE_CONFIG}/${URLS.APP_CS_CONFIG}/:name?`}
                >
                    <ConfigMapSecretWrapper
                        isJob
                        isApprovalPolicyConfigured={false}
                        componentType={CMSecretComponentType.Secret}
                        reloadEnvironments={reloadEnvironments}
                        envConfig={envConfig}
                        fetchEnvConfig={fetchEnvConfig}
                        onErrorRedirectURL={lastUnlockedStage}
                        appName={currentAppName}
                        envName=""
                        isTemplateView={isTemplateView}
                    />
                </Route>,
                <Route path={`${path}/${URLS.APP_ENV_OVERRIDE_CONFIG}/:envId(\\d+)?`}>
                    {({ match }) => (
                        <EnvironmentOverride
                            key={`${URLS.APP_ENV_OVERRIDE_CONFIG}-${match.params.envId}`}
                            isJob
                            environments={environments}
                            reloadEnvironments={reloadEnvironments}
                            envConfig={envConfig}
                            fetchEnvConfig={fetchEnvConfig}
                            onErrorRedirectURL={lastUnlockedStage}
                            appName={currentAppName}
                            appOrEnvIdToResourceApprovalConfigurationMap={envIdToEnvApprovalConfigurationMap}
                            isTemplateView={isTemplateView}
                        />
                    )}
                </Route>,
            ]}
        </Switch>
    )

    const renderAppViewRoutes = (): JSX.Element => (
        <Switch>
            <Route path={`${path}/${URLS.APP_GIT_CONFIG}`}>
                <>
                    <MaterialList
                        respondOnSuccess={respondOnSuccess}
                        isWorkflowEditorUnlocked={isUnlocked.workflowEditor}
                        toggleRepoSelectionTippy={toggleRepoSelectionTippy}
                        setRepo={setRepoState}
                        isTemplateView={isTemplateView}
                        appId={appId}
                    />
                    <NextButton
                        currentStageName={STAGE_NAME.GIT_MATERIAL}
                        navItems={navItems}
                        isDisabled={!isUnlocked.dockerBuildConfig}
                        isCiPipeline={isCiPipeline}
                    />
                </>
            </Route>

            {isUnlocked.dockerBuildConfig && (
                <Route path={`${path}/${URLS.APP_DOCKER_CONFIG}`}>
                    <CIConfig
                        respondOnSuccess={respondOnSuccess}
                        isCDPipeline={isCDPipeline}
                        isCiPipeline={isCiPipeline}
                        isTemplateView={isTemplateView}
                        appId={appId}
                    />
                </Route>
            )}

            {(isUnlocked.deploymentTemplate || isUnlocked.workflowEditor) && (
                <Route path={`${path}/${URLS.BASE_CONFIG}`} exact>
                    <Progressing pageLoader />
                </Route>
            )}

            {isUnlocked.deploymentTemplate && (
                <Route path={`${path}/${URLS.BASE_CONFIG}/${URLS.APP_DEPLOYMENT_CONFIG}`}>
                    <DeploymentTemplate
                        respondOnSuccess={respondOnSuccess}
                        isCiPipeline={isCiPipeline}
                        isApprovalPolicyConfigured={getIsApprovalPolicyConfigured(
                            approvalConfigMapForBaseConfiguration?.[ApprovalConfigDataKindType.deploymentTemplate],
                        )}
                        reloadEnvironments={reloadEnvironments}
                        fetchEnvConfig={fetchEnvConfig}
                        isTemplateView={isTemplateView}
                    />
                </Route>
            )}
            {!isTemplateView && canShowExternalLinks && (
                <Route path={`${path}/${URLS.APP_EXTERNAL_LINKS}`}>
                    <ExternalLinks isAppConfigView userRole={userRole} />
                </Route>
            )}
            {!isTemplateView && isGitOpsConfigurationRequired && (
                <Route path={`${path}/${URLS.APP_GITOPS_CONFIG}`}>
                    <UserGitRepoConfiguration
                        respondOnSuccess={respondOnSuccess}
                        appId={+appId}
                        reloadAppConfig={reloadAppConfig}
                    />
                </Route>
            )}
            {isUnlocked.workflowEditor && [
                <Route
                    key={`${path}/${URLS.APP_WORKFLOW_CONFIG}`}
                    path={`${path}/${URLS.APP_WORKFLOW_CONFIG}/:workflowId(\\d+)?`}
                >
                    <WorkflowEdit
                        configStatus={1}
                        isCDPipeline={isCDPipeline}
                        respondOnSuccess={respondOnSuccess}
                        getWorkflows={getWorkflows}
                        filteredEnvIds={filteredEnvIds}
                        reloadEnvironments={reloadEnvironments}
                        reloadAppConfig={reloadAppConfig}
                        isTemplateView={isTemplateView}
                    />
                </Route>,
                <Route
                    key={`${path}/${URLS.BASE_CONFIG}/${URLS.APP_CM_CONFIG}`}
                    path={`${path}/${URLS.BASE_CONFIG}/${URLS.APP_CM_CONFIG}/:name?`}
                >
                    <ConfigMapSecretWrapper
                        isApprovalPolicyConfigured={getIsApprovalPolicyConfigured(
                            approvalConfigMapForBaseConfiguration?.[ApprovalConfigDataKindType.configMap],
                        )}
                        reloadEnvironments={reloadEnvironments}
                        envConfig={envConfig}
                        fetchEnvConfig={fetchEnvConfig}
                        onErrorRedirectURL={lastUnlockedStage}
                        appName={currentAppName}
                        envName=""
                        isTemplateView={isTemplateView}
                    />
                </Route>,
                <Route
                    key={`${path}/${URLS.BASE_CONFIG}/${URLS.APP_CS_CONFIG}`}
                    path={`${path}/${URLS.BASE_CONFIG}/${URLS.APP_CS_CONFIG}/:name?`}
                >
                    <ConfigMapSecretWrapper
                        isApprovalPolicyConfigured={getIsApprovalPolicyConfigured(
                            approvalConfigMapForBaseConfiguration?.[ApprovalConfigDataKindType.configSecret],
                        )}
                        componentType={CMSecretComponentType.Secret}
                        reloadEnvironments={reloadEnvironments}
                        envConfig={envConfig}
                        fetchEnvConfig={fetchEnvConfig}
                        onErrorRedirectURL={lastUnlockedStage}
                        appName={currentAppName}
                        envName=""
                        isTemplateView={isTemplateView}
                    />
                </Route>,
                <Route
                    key={`${path}/${URLS.APP_ENV_OVERRIDE_CONFIG}`}
                    path={`${path}/${URLS.APP_ENV_OVERRIDE_CONFIG}/:envId(\\d+)?`}
                >
                    {({ match }) => (
                        <EnvironmentOverride
                            key={`${URLS.APP_ENV_OVERRIDE_CONFIG}-${match.params.envId}`}
                            environments={environments}
                            reloadEnvironments={reloadEnvironments}
                            envConfig={envConfig}
                            fetchEnvConfig={fetchEnvConfig}
                            onErrorRedirectURL={lastUnlockedStage}
                            appName={currentAppName}
                            appOrEnvIdToResourceApprovalConfigurationMap={envIdToEnvApprovalConfigurationMap}
                            isTemplateView={isTemplateView}
                        />
                    )}
                </Route>,
                !isTemplateView && (
                    <Route
                        key={`${path}/${URLS.APP_ENV_CONFIG_COMPARE}`}
                        path={`${path}/:envId(\\d+)?/${URLS.APP_ENV_CONFIG_COMPARE}/:compareTo?/${DEPLOYMENT_CONFIGURATION_RESOURCE_TYPE_ROUTE}/:resourceName?`}
                    >
                        {({ match }) => {
                            const basePath = generatePath(path, match.params)
                            const envOverridePath = match.params.envId
                                ? `/${URLS.APP_ENV_OVERRIDE_CONFIG}/${match.params.envId}`
                                : `/${URLS.BASE_CONFIG}`

                            // Used in CM/CS
                            const resourceNamePath = match.params.resourceName ? `/${match.params.resourceName}` : ''

                            const goBackURL =
                                match.params.resourceType === EnvResourceType.Manifest ||
                                match.params.resourceType === EnvResourceType.PipelineStrategy
                                    ? `${basePath}${envOverridePath}`
                                    : `${basePath}${envOverridePath}/${match.params.resourceType}${resourceNamePath}`

                            return (
                                <DeploymentConfigCompare
                                    type="app"
                                    appName={currentAppName}
                                    environments={environments.map(({ environmentId, environmentName }) => ({
                                        id: environmentId,
                                        name: environmentName,
                                    }))}
                                    goBackURL={goBackURL}
                                    getNavItemHref={(resourceType, resourceName) =>
                                        `${generatePath(match.path, { ...match.params, resourceType, resourceName })}${location.search}`
                                    }
                                    appOrEnvIdToResourceApprovalConfigurationMap={envIdToEnvApprovalConfigurationMap}
                                />
                            )
                        }}
                    </Route>
                ),
            ]}
            {/* Redirect route is there when current path url has something after /edit */}
            {location.pathname !== url && <Redirect to={lastUnlockedStage} />}
        </Switch>
    )
    return (
        <ErrorBoundary>
            <Suspense fallback={<Progressing pageLoader />}>
                {isJobView ? renderJobViewRoutes() : renderAppViewRoutes()}
            </Suspense>
        </ErrorBoundary>
    )
}

export default AppComposeRouter
