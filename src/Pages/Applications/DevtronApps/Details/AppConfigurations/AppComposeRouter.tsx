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
import { URLS } from '../../../../../config'
import { ErrorBoundary, importComponentFromFELibrary } from '../../../../../components/common'
import { ReactComponent as Next } from '../../../../../assets/icons/ic-arrow-forward.svg'
import { NextButtonProps, STAGE_NAME } from './appConfig.type'
import ExternalLinks from '../../../../../components/externalLinks/ExternalLinks'
import SecretList from '../../../../../components/ConfigMapSecret/Secret/SecretList'
import ConfigMapList from '../../../../../components/ConfigMapSecret/ConfigMap/ConfigMapList'
import './appConfig.scss'
import { useAppConfigurationContext } from './AppConfiguration.context'

const MaterialList = lazy(() => import('../../../../../components/material/MaterialList'))
const CIConfig = lazy(() => import('../../../../../components/ciConfig/CIConfig'))
const DeploymentConfig = lazy(() => import('../../../../../components/deploymentConfig/DeploymentConfig'))
const WorkflowEdit = lazy(() => import('../../../../../components/workflowEditor/workflowEditor'))
const EnvironmentOverride = lazy(() => import('../../../../../components/EnvironmentOverride/EnvironmentOverride'))
const ConfigProtectionView = importComponentFromFELibrary('ConfigProtectionView')
const UserGitRepoConfiguration = lazy(() => import('../../../../../components/gitOps/UserGitRepConfiguration'))

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
                        render={() => (
                            <WorkflowEdit
                                configStatus={1}
                                isCDPipeline={isCDPipeline}
                                respondOnSuccess={respondOnSuccess}
                                getWorkflows={getWorkflows}
                                isJobView={isJobView}
                                envList={environments}
                                reloadEnvironments={reloadEnvironments}
                            />
                        )}
                    />,
                    <Route
                        key={`${path}/${URLS.APP_CM_CONFIG}`}
                        path={`${path}/${URLS.APP_CM_CONFIG}/:name?`}
                        render={() => <ConfigMapList isJobView={isJobView} isProtected={false} />}
                    />,
                    <Route
                        key={`${path}/${URLS.APP_CS_CONFIG}`}
                        path={`${path}/${URLS.APP_CS_CONFIG}/:name?`}
                        render={() => <SecretList isJobView={isJobView} isProtected={false} />}
                    />,
                    <Route
                        key={`${path}/${URLS.APP_ENV_OVERRIDE_CONFIG}`}
                        path={`${path}/${URLS.APP_ENV_OVERRIDE_CONFIG}/:envId(\\d+)?`}
                        render={() => (
                            <EnvironmentOverride
                                environments={environments}
                                isJobView={isJobView}
                                reloadEnvironments={reloadEnvironments}
                            />
                        )}
                    />,
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
                        render={() => (
                            <WorkflowEdit
                                configStatus={1}
                                isCDPipeline={isCDPipeline}
                                respondOnSuccess={respondOnSuccess}
                                getWorkflows={getWorkflows}
                                filteredEnvIds={filteredEnvIds}
                                reloadEnvironments={reloadEnvironments}
                                reloadAppConfig={reloadAppConfig}
                            />
                        )}
                    />,
                    <Route key={`${path}/${URLS.APP_CM_CONFIG}`} path={`${path}/${URLS.APP_CM_CONFIG}/:name?`}>
                        <ConfigMapList isProtected={isBaseConfigProtected} reloadEnvironments={reloadEnvironments} />
                    </Route>,
                    <Route key={`${path}/${URLS.APP_CS_CONFIG}`} path={`${path}/${URLS.APP_CS_CONFIG}/:name?`}>
                        <SecretList isProtected={isBaseConfigProtected} reloadEnvironments={reloadEnvironments} />
                    </Route>,
                    <Route
                        key={`${path}/${URLS.APP_ENV_OVERRIDE_CONFIG}`}
                        path={`${path}/${URLS.APP_ENV_OVERRIDE_CONFIG}/:envId(\\d+)?`}
                        render={() => (
                            <EnvironmentOverride environments={environments} reloadEnvironments={reloadEnvironments} />
                        )}
                    />,
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
