import React, { lazy, Suspense } from 'react'
import { useRouteMatch, useHistory, Route, Switch } from 'react-router-dom'

import { URLS } from '../../../../config'
import { ErrorBoundary, importComponentFromFELibrary } from '../../../common'
import { Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Next } from '../../../../assets/icons/ic-arrow-forward.svg'
import { AppComposeRouterProps, NextButtonProps, STAGE_NAME } from './appConfig.type'
import ExternalLinks from '../../../externalLinks/ExternalLinks'
import SecretList from '../../../ConfigMapSecret/Secret/SecretList'
import ConfigMapList from '../../../ConfigMapSecret/ConfigMap/ConfigMapList'
import './appConfig.scss'

const MaterialList = lazy(() => import('../../../material/MaterialList'))
const CIConfig = lazy(() => import('../../../ciConfig/CIConfig'))
const DeploymentConfig = lazy(() => import('../../../deploymentConfig/DeploymentConfig'))
const WorkflowEdit = lazy(() => import('../../../workflowEditor/workflowEditor'))
const EnvironmentOverride = lazy(() => import('../../../EnvironmentOverride/EnvironmentOverride'))
const ConfigProtectionView = importComponentFromFELibrary('ConfigProtectionView')

const NextButton: React.FC<NextButtonProps> = ({ isCiPipeline, navItems, currentStageName, isDisabled }) => {
    const history = useHistory()
    let index = navItems.findIndex((item) => item.stage === currentStageName)
    let nextUrl = navItems[index + 1].href
    if (!isCiPipeline) {
        return (
            <div className="app-compose__next-section">
                <button
                    type="button"
                    disabled={isDisabled}
                    className="cta dc__align-right flex"
                    onClick={(event) => {
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

export default function AppComposeRouter({
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
    filteredEnvIds
}: AppComposeRouterProps) {
    const { path } = useRouteMatch()
    const renderJobViewRoutes = (): JSX.Element => {
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
                            />
                        )}
                    />,
                    <Route
                        key={`${path}/${URLS.APP_CM_CONFIG}`}
                        path={`${path}/${URLS.APP_CM_CONFIG}`}
                        render={(props) => <ConfigMapList isJobView={isJobView} isProtected={false} />}
                    />,
                    <Route
                        key={`${path}/${URLS.APP_CS_CONFIG}`}
                        path={`${path}/${URLS.APP_CS_CONFIG}`}
                        render={(props) => <SecretList isJobView={isJobView} isProtected={false} />}
                    />,
                    <Route
                        key={`${path}/${URLS.APP_ENV_OVERRIDE_CONFIG}`}
                        path={`${path}/${URLS.APP_ENV_OVERRIDE_CONFIG}/:envId(\\d+)?`}
                        render={(props) => (
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
                            navItems={navItems}
                        />
                    </Route>
                )}
                {isUnlocked.deploymentTemplate && (
                    <Route path={`${path}/${URLS.APP_DEPLOYMENT_CONFIG}`}>
                        <DeploymentConfig
                            respondOnSuccess={respondOnSuccess}
                            isUnSet={!isUnlocked.workflowEditor}
                            navItems={navItems}
                            isCiPipeline={isCiPipeline}
                            environments={environments}
                            isProtected={isBaseConfigProtected}
                            reloadEnvironments={reloadEnvironments}
                        />
                    </Route>
                )}
                {canShowExternalLinks && (
                    <Route path={`${path}/${URLS.APP_EXTERNAL_LINKS}`}>
                        <ExternalLinks isAppConfigView={true} userRole={userRole} />
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
                        render={(props) => (
                            <WorkflowEdit
                                configStatus={1}
                                isCDPipeline={isCDPipeline}
                                respondOnSuccess={respondOnSuccess}
                                getWorkflows={getWorkflows}
                                filteredEnvIds={filteredEnvIds}
                            />
                        )}
                    />,
                    <Route key={`${path}/${URLS.APP_CM_CONFIG}`} path={`${path}/${URLS.APP_CM_CONFIG}`}>
                        <ConfigMapList isProtected={isBaseConfigProtected} reloadEnvironments={reloadEnvironments} />
                    </Route>,
                    <Route key={`${path}/${URLS.APP_CS_CONFIG}`} path={`${path}/${URLS.APP_CS_CONFIG}`}>
                        <SecretList isProtected={isBaseConfigProtected} reloadEnvironments={reloadEnvironments} />
                    </Route>,
                    <Route
                        key={`${path}/${URLS.APP_ENV_OVERRIDE_CONFIG}`}
                        path={`${path}/${URLS.APP_ENV_OVERRIDE_CONFIG}/:envId(\\d+)?`}
                        render={(props) => (
                            <EnvironmentOverride environments={environments} reloadEnvironments={reloadEnvironments} />
                        )}
                    />,
                ]}
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
