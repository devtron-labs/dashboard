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

import React, { type JSX, lazy, Suspense } from 'react'
import { generatePath, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'

import {
    ApprovalConfigDataKindType,
    BASE_CONFIGURATION_ENV_ID,
    Button,
    CMSecretComponentType,
    getIsApprovalPolicyConfigured,
    Progressing,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Next } from '@Icons/ic-arrow-forward.svg'
import { ErrorBoundary, useAppContext } from '@Components/common'
import ExternalLinks from '@Components/externalLinks/ExternalLinks'
import { DEPLOYMENT_CONFIGURATION_RESOURCE_TYPE_ROUTE, URLS } from '@Config/index'
import { ConfigMapSecretWrapper } from '@Pages/Shared/ConfigMapSecret/ConfigMapSecret.wrapper'

import { NextButtonProps, STAGE_NAME } from '../AppConfig.types'
import { useAppConfigurationContext } from '../AppConfiguration.provider'
import { DeploymentConfigCompareWrapper } from './DeploymentConfigCompare'

import '../appConfig.scss'

const MaterialList = lazy(() => import('@Components/material/MaterialList'))
const CIConfig = lazy(() => import('@Components/ciConfig/CIConfig'))
const DeploymentTemplate = lazy(() => import('./DeploymentTemplate/DeploymentTemplate'))
const WorkflowEdit = lazy(() => import('@Components/workflowEditor/workflowEditor'))
const EnvironmentOverride = lazy(() => import('@Pages/Shared/EnvironmentOverride/EnvironmentOverride'))
const UserGitRepoConfiguration = lazy(() => import('@Components/gitOps/UserGitRepConfiguration'))

const NextButton: React.FC<NextButtonProps> = ({ isCiPipeline, navItems, currentStageName, isDisabled }) => {
    const navigate = useNavigate()
    const index = navItems.findIndex((item) => item.stage === currentStageName)
    const nextUrl = navItems[index + 1].href
    if (!isCiPipeline) {
        return (
            <div className="app-compose__next-section flex right">
                <Button
                    disabled={isDisabled}
                    onClick={() => {
                        navigate(nextUrl)
                    }}
                    text="Next"
                    endIcon={<Next />}
                    dataTestId="app-compose-next-button"
                />
            </div>
        )
    }
    return null
}

const AppComposeRouter = ({ routePath }: { routePath: string }) => {
    const location = useLocation()
    const navigate = useNavigate()
    const params = useParams()

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
        <Routes>
            <Route
                path={URLS.APP_GIT_CONFIG}
                element={
                    <div className="flexbox-col flex-grow-1 dc__content-space h-100 dc__overflow-hidden">
                        <div className="flex-grow-1 dc__overflow-auto">
                            <MaterialList
                                respondOnSuccess={respondOnSuccess}
                                toggleRepoSelectionTippy={toggleRepoSelectionTippy}
                                setRepo={setRepoState}
                                isJobView={isJobView}
                                appId={appId}
                            />
                        </div>
                        <NextButton
                            currentStageName={STAGE_NAME.GIT_MATERIAL}
                            navItems={navItems}
                            isDisabled={!isUnlocked.workflowEditor}
                            isCiPipeline={isCiPipeline}
                        />
                    </div>
                }
            />
            {isUnlocked.workflowEditor && [
                <Route
                    key={URLS.APP_WORKFLOW_CONFIG}
                    path={`${URLS.APP_WORKFLOW_CONFIG}/*`}
                    element={
                        <WorkflowEdit
                            configStatus={1}
                            isCDPipeline={isCDPipeline}
                            respondOnSuccess={respondOnSuccess}
                            getWorkflows={getWorkflows}
                            isJobView={isJobView}
                            envList={environments}
                            reloadEnvironments={reloadEnvironments}
                            isTemplateView={isTemplateView}
                            navigate={navigate}
                            location={location}
                            params={params}
                        />
                    }
                />,
                <Route
                    key={`${URLS.BASE_CONFIG}/${URLS.APP_CM_CONFIG}`}
                    path={`${URLS.BASE_CONFIG}/${URLS.APP_CM_CONFIG}/:name?`}
                    element={
                        <ConfigMapSecretWrapper
                            isJob
                            isApprovalPolicyConfigured={false}
                            reloadEnvironments={reloadEnvironments}
                            envConfig={envConfig}
                            fetchEnvConfig={fetchEnvConfig}
                            onErrorRedirectURL={lastUnlockedStage}
                            appName={currentAppName}
                            envName=""
                            isExceptionUser={false}
                            isTemplateView={isTemplateView}
                            routePath={`${routePath}/${URLS.BASE_CONFIG}/${URLS.APP_CM_CONFIG}/:name?`}
                        />
                    }
                />,
                <Route
                    key={`${URLS.BASE_CONFIG}/${URLS.APP_CS_CONFIG}`}
                    path={`${URLS.BASE_CONFIG}/${URLS.APP_CS_CONFIG}/:name?`}
                    element={
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
                            isExceptionUser={false}
                            isTemplateView={isTemplateView}
                            routePath={`${routePath}/${URLS.BASE_CONFIG}/${URLS.APP_CS_CONFIG}/:name?`}
                        />
                    }
                />,
                <Route
                    key={URLS.APP_ENV_OVERRIDE_CONFIG}
                    path={`${URLS.APP_ENV_OVERRIDE_CONFIG}/:envId?/*`}
                    element={
                        <EnvironmentOverride
                            isJob
                            environments={environments}
                            reloadEnvironments={reloadEnvironments}
                            envConfig={envConfig}
                            fetchEnvConfig={fetchEnvConfig}
                            onErrorRedirectURL={lastUnlockedStage}
                            appName={currentAppName}
                            appOrEnvIdToResourceApprovalConfigurationMap={envIdToEnvApprovalConfigurationMap}
                            isTemplateView={isTemplateView}
                            routePath={`${routePath}/${URLS.APP_ENV_OVERRIDE_CONFIG}/:envId?`}
                        />
                    }
                />,
            ]}
        </Routes>
    )

    const renderAppViewRoutes = (): JSX.Element => (
        <Routes>
            <Route
                path={URLS.APP_GIT_CONFIG}
                element={
                    <div className="flexbox-col flex-grow-1 dc__content-space h-100 dc__overflow-hidden">
                        <div className="flex-grow-1 dc__overflow-auto">
                            <MaterialList
                                respondOnSuccess={respondOnSuccess}
                                toggleRepoSelectionTippy={toggleRepoSelectionTippy}
                                setRepo={setRepoState}
                                isTemplateView={isTemplateView}
                                appId={appId}
                            />
                        </div>
                        <NextButton
                            currentStageName={STAGE_NAME.GIT_MATERIAL}
                            navItems={navItems}
                            isDisabled={!isUnlocked.dockerBuildConfig}
                            isCiPipeline={isCiPipeline}
                        />
                    </div>
                }
            />

            {isUnlocked.dockerBuildConfig && (
                <Route
                    path={URLS.APP_DOCKER_CONFIG}
                    element={
                        <CIConfig
                            respondOnSuccess={respondOnSuccess}
                            isCDPipeline={isCDPipeline}
                            isCiPipeline={isCiPipeline}
                            isTemplateView={isTemplateView}
                            appId={appId}
                        />
                    }
                />
            )}

            {(isUnlocked.deploymentTemplate || isUnlocked.workflowEditor) && (
                <Route path={URLS.BASE_CONFIG} element={<Progressing pageLoader />} />
            )}

            {isUnlocked.deploymentTemplate && (
                <Route
                    path={`${URLS.BASE_CONFIG}/${URLS.APP_DEPLOYMENT_CONFIG}`}
                    element={
                        <DeploymentTemplate
                            respondOnSuccess={respondOnSuccess}
                            isCiPipeline={isCiPipeline}
                            isApprovalPolicyConfigured={getIsApprovalPolicyConfigured(
                                approvalConfigMapForBaseConfiguration?.[ApprovalConfigDataKindType.deploymentTemplate],
                            )}
                            reloadEnvironments={reloadEnvironments}
                            fetchEnvConfig={fetchEnvConfig}
                            isExceptionUser={
                                approvalConfigMapForBaseConfiguration?.[ApprovalConfigDataKindType.deploymentTemplate]
                                    .isExceptionUser ?? false
                            }
                            isTemplateView={isTemplateView}
                        />
                    }
                />
            )}
            {!isTemplateView && canShowExternalLinks && (
                <Route path={URLS.APP_EXTERNAL_LINKS} element={<ExternalLinks isAppConfigView userRole={userRole} />} />
            )}
            {!isTemplateView && isGitOpsConfigurationRequired && (
                <Route
                    path={URLS.APP_GITOPS_CONFIG}
                    element={
                        <UserGitRepoConfiguration
                            respondOnSuccess={respondOnSuccess}
                            appId={+appId}
                            reloadAppConfig={reloadAppConfig}
                        />
                    }
                />
            )}
            {isUnlocked.workflowEditor && [
                <Route
                    key={URLS.APP_WORKFLOW_CONFIG}
                    path={`${URLS.APP_WORKFLOW_CONFIG}/*`}
                    element={
                        <WorkflowEdit
                            configStatus={1}
                            isCDPipeline={isCDPipeline}
                            respondOnSuccess={respondOnSuccess}
                            getWorkflows={getWorkflows}
                            filteredEnvIds={filteredEnvIds}
                            reloadEnvironments={reloadEnvironments}
                            reloadAppConfig={reloadAppConfig}
                            isTemplateView={isTemplateView}
                            navigate={navigate}
                            location={location}
                            params={params}
                        />
                    }
                />,
                <Route
                    key={`${URLS.BASE_CONFIG}/${URLS.APP_CM_CONFIG}`}
                    path={`${URLS.BASE_CONFIG}/${URLS.APP_CM_CONFIG}/:name?`}
                    element={
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
                            isExceptionUser={
                                approvalConfigMapForBaseConfiguration?.[ApprovalConfigDataKindType.configMap]
                                    .isExceptionUser
                            }
                            isTemplateView={isTemplateView}
                            routePath={`${routePath}/${URLS.BASE_CONFIG}/${URLS.APP_CM_CONFIG}/:name?`}
                        />
                    }
                />,
                <Route
                    key={`${URLS.BASE_CONFIG}/${URLS.APP_CS_CONFIG}`}
                    path={`${URLS.BASE_CONFIG}/${URLS.APP_CS_CONFIG}/:name?`}
                    element={
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
                            isExceptionUser={
                                approvalConfigMapForBaseConfiguration?.[ApprovalConfigDataKindType.configSecret]
                                    .isExceptionUser
                            }
                            isTemplateView={isTemplateView}
                            routePath={`${routePath}/${URLS.BASE_CONFIG}/${URLS.APP_CS_CONFIG}/:name?`}
                        />
                    }
                />,
                <Route
                    key={URLS.APP_ENV_OVERRIDE_CONFIG}
                    path={`${URLS.APP_ENV_OVERRIDE_CONFIG}/:envId?/*`}
                    element={
                        <EnvironmentOverride
                            environments={environments}
                            reloadEnvironments={reloadEnvironments}
                            envConfig={envConfig}
                            fetchEnvConfig={fetchEnvConfig}
                            onErrorRedirectURL={lastUnlockedStage}
                            appName={currentAppName}
                            appOrEnvIdToResourceApprovalConfigurationMap={envIdToEnvApprovalConfigurationMap}
                            isTemplateView={isTemplateView}
                            routePath={`${routePath}/${URLS.APP_ENV_OVERRIDE_CONFIG}/:envId?`}
                        />
                    }
                />,
                !isTemplateView && (
                    <Route
                        key={URLS.APP_ENV_CONFIG_COMPARE}
                        path={`:envId?/${URLS.APP_ENV_CONFIG_COMPARE}/:compareTo?/${DEPLOYMENT_CONFIGURATION_RESOURCE_TYPE_ROUTE}/:resourceName?`}
                        element={
                            <DeploymentConfigCompareWrapper
                                type="app"
                                appName={currentAppName}
                                environments={environments.map(({ environmentId, environmentName }) => ({
                                    id: environmentId,
                                    name: environmentName,
                                }))}
                                routePath={`${routePath}/:envId?/${URLS.APP_ENV_CONFIG_COMPARE}/:compareTo?/${DEPLOYMENT_CONFIGURATION_RESOURCE_TYPE_ROUTE}/:resourceName?`}
                                appendEnvOverridePath
                                baseGoBackURL={generatePath(routePath, params)}
                                appOrEnvIdToResourceApprovalConfigurationMap={envIdToEnvApprovalConfigurationMap}
                            />
                        }
                    />
                ),
            ]}
            {location.pathname !== generatePath(routePath, params) && (
                <Route path="*" element={<Navigate to={lastUnlockedStage} />} />
            )}
        </Routes>
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
