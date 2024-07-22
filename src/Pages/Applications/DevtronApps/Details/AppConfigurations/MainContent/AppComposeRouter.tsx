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
import { useRouteMatch, useHistory, Route, Switch, Redirect, useLocation } from 'react-router-dom'

import { Progressing } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Next } from '@Icons/ic-arrow-forward.svg'
import { URLS } from '@Config/index'
import { ErrorBoundary, importComponentFromFELibrary } from '@Components/common'
import ExternalLinks from '@Components/externalLinks/ExternalLinks'
import { CMSecretComponentType } from '@Pages/Shared/ConfigMapSecret/ConfigMapSecret.types'
import { ConfigMapSecretContainer } from '@Pages/Shared/ConfigMapSecret/ConfigMapSecret.container'

import { NextButtonProps, STAGE_NAME } from '../AppConfig.types'
import { useAppConfigurationContext } from '../AppConfiguration.provider'

import '../appConfig.scss'

const MaterialList = lazy(() => import('@Components/material/MaterialList'))
const CIConfig = lazy(() => import('@Components/ciConfig/CIConfig'))
const DeploymentConfig = lazy(() => import('@Components/deploymentConfig/DeploymentConfig'))
const WorkflowEdit = lazy(() => import('@Components/workflowEditor/workflowEditor'))
const EnvironmentOverride = lazy(() => import('@Pages/Shared/EnvironmentOverride/EnvironmentOverride'))
const ConfigProtectionView = importComponentFromFELibrary('ConfigProtectionView')
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
        isBaseConfigProtected,
        reloadEnvironments,
        configProtectionData,
        filteredEnvIds,
        isGitOpsConfigurationRequired,
        reloadAppConfig,
        lastUnlockedStage,
        envConfig,
        fetchEnvConfig,
    } = useAppConfigurationContext()

    const renderJobViewRoutes = (): JSX.Element => {
        // currently the logic for redirection to next unlocked stage is in respondOnSuccess function can be done for MaterialList also
        return (
            <Switch>
                <Route path={`${path}/${URLS.APP_GIT_CONFIG}`}>
                    <>
                        <MaterialList
                            respondOnSuccess={respondOnSuccess}
                            isWorkflowEditorUnlocked={isUnlocked.workflowEditor}
                            toggleRepoSelectionTippy={toggleRepoSelectionTippy}
                            setRepo={setRepoState}
                            isJobView={isJobView}
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
                        />
                    </Route>,
                    <Route key={`${path}/${URLS.APP_CM_CONFIG}`} path={`${path}/${URLS.APP_CM_CONFIG}/:name?`}>
                        <ConfigMapSecretContainer
                            isJob
                            isProtected={false}
                            reloadEnvironments={reloadEnvironments}
                            envConfig={envConfig}
                            fetchEnvConfig={fetchEnvConfig}
                            onErrorRedirectURL={lastUnlockedStage}
                        />
                    </Route>,
                    <Route key={`${path}/${URLS.APP_CS_CONFIG}`} path={`${path}/${URLS.APP_CS_CONFIG}/:name?`}>
                        <ConfigMapSecretContainer
                            isJob
                            isProtected={false}
                            componentType={CMSecretComponentType.Secret}
                            reloadEnvironments={reloadEnvironments}
                            envConfig={envConfig}
                            fetchEnvConfig={fetchEnvConfig}
                            onErrorRedirectURL={lastUnlockedStage}
                        />
                    </Route>,
                    <Route
                        key={`${path}/${URLS.APP_ENV_OVERRIDE_CONFIG}`}
                        path={`${path}/${URLS.APP_ENV_OVERRIDE_CONFIG}/:envId(\\d+)?`}
                    >
                        <EnvironmentOverride
                            isJob
                            environments={environments}
                            reloadEnvironments={reloadEnvironments}
                            envConfig={envConfig}
                            fetchEnvConfig={fetchEnvConfig}
                            onErrorRedirectURL={lastUnlockedStage}
                        />
                    </Route>,
                ]}
            </Switch>
        )
    }

    const renderAppViewRoutes = (): JSX.Element => {
        return (
            <Switch>
                <Route path={`${path}/${URLS.APP_GIT_CONFIG}`}>
                    <>
                        <MaterialList
                            respondOnSuccess={respondOnSuccess}
                            isWorkflowEditorUnlocked={isUnlocked.workflowEditor}
                            toggleRepoSelectionTippy={toggleRepoSelectionTippy}
                            setRepo={setRepoState}
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
                        />
                    </Route>
                )}
                {isUnlocked.deploymentTemplate && (
                    <Route path={`${path}/${URLS.APP_DEPLOYMENT_CONFIG}`}>
                        <DeploymentConfig
                            respondOnSuccess={respondOnSuccess}
                            isUnSet={!isUnlocked.workflowEditor}
                            isCiPipeline={isCiPipeline}
                            environments={environments}
                            isProtected={isBaseConfigProtected}
                            reloadEnvironments={reloadEnvironments}
                        />
                    </Route>
                )}
                {canShowExternalLinks && (
                    <Route path={`${path}/${URLS.APP_EXTERNAL_LINKS}`}>
                        <ExternalLinks isAppConfigView userRole={userRole} />
                    </Route>
                )}
                {isGitOpsConfigurationRequired && (
                    <Route path={`${path}/${URLS.APP_GITOPS_CONFIG}`}>
                        <UserGitRepoConfiguration
                            respondOnSuccess={respondOnSuccess}
                            appId={+appId}
                            reloadAppConfig={reloadAppConfig}
                        />
                    </Route>
                )}
                {isUnlocked.workflowEditor && ConfigProtectionView && (
                    <Route path={`${path}/${URLS.APP_CONFIG_PROTECTION}`}>
                        <ConfigProtectionView
                            appId={Number(appId)}
                            envList={environments}
                            reloadEnvironments={reloadEnvironments}
                            configProtectionData={configProtectionData}
                            isBaseConfigProtected={isBaseConfigProtected}
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
                        />
                    </Route>,
                    <Route key={`${path}/${URLS.APP_CM_CONFIG}`} path={`${path}/${URLS.APP_CM_CONFIG}/:name?`}>
                        <ConfigMapSecretContainer
                            isProtected={isBaseConfigProtected}
                            reloadEnvironments={reloadEnvironments}
                            envConfig={envConfig}
                            fetchEnvConfig={fetchEnvConfig}
                            onErrorRedirectURL={lastUnlockedStage}
                        />
                    </Route>,
                    <Route key={`${path}/${URLS.APP_CS_CONFIG}`} path={`${path}/${URLS.APP_CS_CONFIG}/:name?`}>
                        <ConfigMapSecretContainer
                            isProtected={isBaseConfigProtected}
                            componentType={CMSecretComponentType.Secret}
                            reloadEnvironments={reloadEnvironments}
                            envConfig={envConfig}
                            fetchEnvConfig={fetchEnvConfig}
                            onErrorRedirectURL={lastUnlockedStage}
                        />
                    </Route>,
                    <Route
                        key={`${path}/${URLS.APP_ENV_OVERRIDE_CONFIG}`}
                        path={`${path}/${URLS.APP_ENV_OVERRIDE_CONFIG}/:envId(\\d+)?`}
                    >
                        <EnvironmentOverride
                            environments={environments}
                            reloadEnvironments={reloadEnvironments}
                            envConfig={envConfig}
                            fetchEnvConfig={fetchEnvConfig}
                            onErrorRedirectURL={lastUnlockedStage}
                        />
                    </Route>,
                ]}
                {/* Redirect route is there when current path url has something after /edit */}
                {location.pathname !== url && <Redirect to={lastUnlockedStage} />}
            </Switch>
        )
    }
    return (
        <ErrorBoundary>
            <Suspense fallback={<Progressing pageLoader />}>
                {isJobView ? renderJobViewRoutes() : renderAppViewRoutes()}
            </Suspense>
        </ErrorBoundary>
    )
}

export default AppComposeRouter
