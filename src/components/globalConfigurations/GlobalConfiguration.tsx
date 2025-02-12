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

import { lazy, useState, useEffect, Suspense, isValidElement, useRef } from 'react'
import { Route, NavLink, Router, Switch, Redirect, useHistory, useLocation } from 'react-router-dom'
import {
    showError,
    Progressing,
    Toggle,
    ConditionalWrap,
    TippyCustomized,
    TippyTheme,
    useMainContext,
    PageHeader,
    URLS as CommonURLS,
} from '@devtron-labs/devtron-fe-common-lib'
import { URLS } from '../../config'
import { ErrorBoundary, importComponentFromFELibrary } from '../common'
import arrowTriangle, { ReactComponent as Dropdown } from '../../assets/icons/ic-chevron-down.svg'
import { AddNotification } from '../notifications/AddNotification'
import { ReactComponent as FormError } from '../../assets/icons/ic-warning.svg'
import { getHostURLConfiguration, getAppCheckList } from '../../services/service'
import './globalConfigurations.scss'
import {
    ModuleNameMap,
    MODULE_STATUS_POLLING_INTERVAL,
    MODULE_STATUS_RETRY_COUNT,
    Routes,
    SERVER_MODE,
} from '../../config/constants'
import ExternalLinks from '../externalLinks/ExternalLinks'
import { ModuleStatus } from '../v2/devtronStackManager/DevtronStackManager.type'
import { getModuleInfo } from '../v2/devtronStackManager/DevtronStackManager.service'
import { BodyType, ProtectedInputType } from './globalConfiguration.type'
import { GlobalConfigurationProvider, useGlobalConfiguration } from './GlobalConfigurationProvider'
import { OffendingPipelineModalAppView } from '@Pages/GlobalConfigurations/PluginPolicy/OffendingPipelineModal'
import { getShouldHidePageHeaderAndSidebar } from './utils'
import AppConfig from '@Pages/Applications/DevtronApps/Details/AppConfigurations/AppConfig'

const HostURLConfiguration = lazy(() => import('../hostURL/HostURL'))
const GitOpsConfiguration = lazy(() => import('../gitOps/GitOpsConfiguration'))
const GitProvider = lazy(() => import('../gitProvider/GitProvider'))
const Docker = lazy(() => import('../dockerRegistry/Docker'))
const ClusterList = lazy(() => import('../cluster/Cluster'))
const ChartRepo = lazy(() => import('../chartRepo/ChartRepo'))
const Notifier = lazy(() => import('../notifications/Notifications'))
const Project = lazy(() => import('../project/ProjectList'))
const Authorization = lazy(() => import('@Pages/GlobalConfigurations/Authorization'))
const DeploymentChartsRouter = lazy(() => import('@Pages/GlobalConfigurations/DeploymentCharts'))
const ScopedVariables = lazy(() => import('../scopedVariables/ScopedVariables'))
// NOTE: Might import from index itself
const BuildInfra = lazy(() => import('../../Pages/GlobalConfigurations/BuildInfra/BuildInfra'))
const TagListContainer = importComponentFromFELibrary('TagListContainer')
const PluginsPolicyV1 = importComponentFromFELibrary('PluginsPolicyV1')
const PluginsPolicy = importComponentFromFELibrary('PluginsPolicy', null, 'function')
const FilterConditions = importComponentFromFELibrary('FilterConditions')
const LockDeploymentConfiguration = importComponentFromFELibrary('LockDeploymentConfiguration', null, 'function')
const ApprovalPolicy = importComponentFromFELibrary('ApprovalPolicy', null, 'function')
const CatalogFramework = importComponentFromFELibrary('CatalogFramework')
const PullImageDigest = importComponentFromFELibrary('PullImageDigest')
const DeploymentWindow = importComponentFromFELibrary('DeploymentWindowComponent')
const ImagePromotion = importComponentFromFELibrary('ImagePromotion')
const DevtronAppTemplates = importComponentFromFELibrary('DevtronAppTemplates', null, 'function')

export default function GlobalConfiguration(props) {
    const location = useLocation()
    const [hostURLConfig, setIsHostURLConfig] = useState(undefined)
    const [checkList, setCheckList] = useState({
        isLoading: true,
        isAppCreated: false,
        appChecklist: undefined,
        chartChecklist: undefined,
        appStageCompleted: 0,
        chartStageCompleted: 0,
    })
    const { serverMode } = useMainContext()

    const shouldHidePageHeaderAndSidebar = getShouldHidePageHeaderAndSidebar(location.pathname)

    useEffect(() => {
        serverMode !== SERVER_MODE.EA_ONLY && getHostURLConfig()
        serverMode !== SERVER_MODE.EA_ONLY && fetchCheckList()
    }, [])

    useEffect(() => {
        if (location.pathname.includes(URLS.GLOBAL_CONFIG_HOST_URL)) {
            getHostURLConfig()
        }
    }, [location.pathname])

    function getHostURLConfig() {
        if (props.isSuperAdmin) {
            getHostURLConfiguration().then((response) => {
                setIsHostURLConfig(response.result)
            })
        }
    }

    function handleChecklistUpdate(itemName: string): void {
        const list = checkList

        if (!list.appChecklist[itemName]) {
            list.appStageCompleted += 1
            list.appChecklist[itemName] = 1
        }

        if (!list.chartChecklist[itemName]) {
            list.chartStageCompleted += 1
            list.chartChecklist[itemName] = 1
        }
        setCheckList(list)
    }

    function fetchCheckList(): void {
        getAppCheckList()
            .then((response) => {
                const appChecklist = response.result.appChecklist || {}
                const chartChecklist = response.result.chartChecklist || {}
                const appStageArray: number[] = Object.values(appChecklist)
                const chartStageArray: number[] = Object.values(chartChecklist)
                const appStageCompleted: number = appStageArray.reduce((item, sum) => {
                    sum += item
                    return sum
                }, 0)
                const chartStageCompleted: number = chartStageArray.reduce((item, sum) => {
                    sum += item
                    return sum
                }, 0)

                setCheckList({
                    isLoading: false,
                    isAppCreated: response.result.isAppCreated,
                    appChecklist,
                    chartChecklist,
                    appStageCompleted,
                    chartStageCompleted,
                })
            })
            .catch((error) => {
                showError(error)
            })
    }

    return (
        <main className={`global-configuration ${shouldHidePageHeaderAndSidebar ? 'global-configuration--full-content' : ''}`}>
            {!shouldHidePageHeaderAndSidebar && <PageHeader headerName="Global Configurations" />}
            <Router history={useHistory()}>
                <GlobalConfigurationProvider>
                    {!shouldHidePageHeaderAndSidebar && (
                        <section className="global-configuration__navigation">
                            <NavItem serverMode={serverMode} />
                        </section>
                    )}
                    <section className="global-configuration__component-wrapper">
                        <Suspense fallback={<Progressing pageLoader />}>
                            <ErrorBoundary>
                                <Body
                                    isSuperAdmin={props.isSuperAdmin}
                                    getHostURLConfig={getHostURLConfig}
                                    checkList={checkList}
                                    serverMode={serverMode}
                                    handleChecklistUpdate={handleChecklistUpdate}
                                />
                            </ErrorBoundary>
                        </Suspense>
                    </section>
                </GlobalConfigurationProvider>
            </Router>
        </main>
    )
}

const NavItem = ({ serverMode }) => {
    const location = useLocation()
    const { installedModuleMap } = useMainContext()
    const [, setForceUpdateTime] = useState(Date.now())
    // Add key of NavItem if grouping is used
    const [collapsedState, setCollapsedState] = useState<Record<string, boolean>>({
        Authorization: !location.pathname.startsWith('/global-config/auth'),
    })
    const { tippyConfig, setTippyConfig } = useGlobalConfiguration()

    let moduleStatusTimer = null
    const ConfigRequired = [
        {
            name: 'Host URL',
            href: URLS.GLOBAL_CONFIG_HOST_URL,
            component: HostURLConfiguration,
            isAvailableInEA: false,
        },
        {
            name: 'GitOps ',
            href: URLS.GLOBAL_CONFIG_GITOPS,
            component: GitOpsConfiguration,
            moduleName: ModuleNameMap.ARGO_CD,
        },
        { name: 'Projects', href: URLS.GLOBAL_CONFIG_PROJECT, component: Project, isAvailableInEA: true },
        {
            name: `Clusters${serverMode === SERVER_MODE.EA_ONLY ? '' : ' & Environments'}`,
            href: URLS.GLOBAL_CONFIG_CLUSTER,
            component: ClusterList,
            isAvailableInEA: true,
            isAvailableInDesktop: true,
        },
        { name: 'Git Accounts', href: URLS.GLOBAL_CONFIG_GIT, component: GitProvider, isAvailableInEA: false },
        {
            name: serverMode === SERVER_MODE.EA_ONLY ? 'OCI Registry' : 'Container/ OCI Registry',
            href: URLS.GLOBAL_CONFIG_DOCKER,
            component: Docker,
            isAvailableInEA: true,
        },
    ]

    const ConfigOptional = [
        { name: 'Chart Repositories', href: URLS.GLOBAL_CONFIG_CHART, component: ChartRepo, isAvailableInEA: true },
        {
            name: 'Deployment Charts',
            href: CommonURLS.GLOBAL_CONFIG_DEPLOYMENT_CHARTS_LIST,
            component: DeploymentChartsRouter,
            isAvailableInEA: false,
        },
        {
            name: 'Authorization',
            href: `${URLS.GLOBAL_CONFIG_AUTH}/users`,
            preventDefaultKey: URLS.GLOBAL_CONFIG_AUTH,
            group: [
                {
                    name: 'SSO Login Services',
                    dataTestId: 'authorization-sso-login-link',
                    href: `${URLS.GLOBAL_CONFIG_AUTH}/${Routes.SSO_LOGIN_SERVICES}`,
                    isAvailableInEA: true,
                },
                {
                    name: 'User Permissions',
                    dataTestId: 'authorization-user-permissions-link',
                    href: `${URLS.GLOBAL_CONFIG_AUTH}/${Routes.USER_PERMISSIONS}`,
                    isAvailableInEA: true,
                },
                {
                    name: 'Permission Groups',
                    dataTestId: 'authorization-permission-groups-link',
                    href: `${URLS.GLOBAL_CONFIG_AUTH}/${Routes.PERMISSION_GROUPS}`,
                    isAvailableInEA: true,
                },
                {
                    name: 'API Tokens',
                    dataTestId: 'authorization-api-tokens-link',
                    href: `${URLS.GLOBAL_CONFIG_AUTH}/${Routes.API_TOKEN}`,
                    isAvailableInEA: true,
                },
            ],
            component: Authorization,
            isAvailableInEA: true,
        },
        {
            name: 'Notifications',
            href: URLS.GLOBAL_CONFIG_NOTIFIER,
            component: Notifier,
            moduleName: ModuleNameMap.NOTIFICATION,
            isAvailableInEA: false,
        },
        ...(window._env_.FEATURE_APPLICATION_TEMPLATES_ENABLE
            ? [
                  {
                      name: 'Application Templates',
                      href: CommonURLS.GLOBAL_CONFIG_TEMPLATES_DEVTRON_APP,
                      component: DevtronAppTemplates,
                      isAvailableInEA: false,
                  },
              ]
            : []),
    ]

    useEffect(() => {
        getModuleStatus(ModuleNameMap.ARGO_CD, MODULE_STATUS_RETRY_COUNT)
        getModuleStatus(ModuleNameMap.NOTIFICATION, MODULE_STATUS_RETRY_COUNT)
        return () => {
            if (moduleStatusTimer) {
                clearTimeout(moduleStatusTimer)
            }
        }
    }, [])

    const getModuleStatus = async (moduleName: string, retryOnError: number): Promise<void> => {
        if (installedModuleMap.current?.[moduleName] || window._env_.K8S_CLIENT) {
            return
        }
        try {
            const { result } = await getModuleInfo(moduleName)
            if (result?.status === ModuleStatus.INSTALLED) {
                installedModuleMap.current = { ...installedModuleMap.current, [moduleName]: true }
                setForceUpdateTime(Date.now())
            } else if (result?.status === ModuleStatus.INSTALLING) {
                moduleStatusTimer = setTimeout(() => {
                    getModuleStatus(moduleName, MODULE_STATUS_RETRY_COUNT)
                }, MODULE_STATUS_POLLING_INTERVAL)
            }
        } catch (error) {
            if (retryOnError >= 0) {
                getModuleStatus(moduleName, --retryOnError)
            }
        }
    }

    const renderNavItem = (route, className = '', preventOnClickOp = false) => {
        const onTippyClose = () => {
            // Resetting the tippy state
            setTippyConfig({
                showTippy: false,
            })
        }

        return (
            // FIXME: Reuse the renderNavItem function for all nav item to extend the tippy support to all links
            <ConditionalWrap
                condition={tippyConfig.showTippy && tippyConfig.showOnRoute === route.href}
                wrap={(children) => (
                    <TippyCustomized
                        theme={TippyTheme.black}
                        className="w-300 ml-2"
                        placement="right"
                        showCloseButton
                        trigger="manual"
                        interactive
                        showOnCreate
                        arrow
                        animation="shift-toward-subtle"
                        onClose={onTippyClose}
                        {...tippyConfig}
                    >
                        {children}
                    </TippyCustomized>
                )}
                key={`${route.name}-${route.href}`}
            >
                <NavLink
                    to={`${route.href}`}
                    activeClassName="active-route"
                    data-testid={route.dataTestId}
                    className={`${route.name === 'API tokens' &&
                        location.pathname.startsWith(`${URLS.GLOBAL_CONFIG_AUTH}/${Routes.API_TOKEN}`)
                        ? 'active-route'
                        : ''
                        }`}
                    onClick={(e) => {
                        if (!preventOnClickOp) {
                            handleGroupCollapsedState(e, route)
                        }
                    }}
                >
                    <div className={`flexbox flex-justify ${className || ''}`} data-testid={`${route.name}-page`}>
                        <div>{route.name}</div>
                    </div>
                </NavLink>
            </ConditionalWrap>
        )
    }

    // Collapse group except the one with preventKey
    const collapseExpandedGroup = (preventKey: string) => {
        const expandedGroupKey = Object.entries(collapsedState).find(([key, value]) => {
            if (!value) {
                return [key, value]
            }
        })

        if (!expandedGroupKey && !preventKey) {
            return
        }

        const _collapsedState = {
            ...collapsedState,
        }

        // If any group is expanded then collapse it
        if (expandedGroupKey) {
            _collapsedState[expandedGroupKey[0]] = true
        }

        // If preventKey is passed then prevent the expanded state for the same
        if (preventKey) {
            _collapsedState[preventKey] = false
        }

        // set the updated state
        setCollapsedState(_collapsedState)
    }

    const handleGroupCollapsedState = (e, route) => {
        // If current path starts with default prevent key then prevent the default behaviour
        // & reverse the collapse state
        if (location.pathname.startsWith(route.preventDefaultKey)) {
            e.preventDefault()
            setCollapsedState({
                ...collapsedState,
                [route.name]: !collapsedState[route.name],
            })
        } else {
            // Pass the route name as preventKey if it's a group and/else collapse any expanded group
            collapseExpandedGroup(route.group ? route.name : '')
        }
    }

    return (
        <div className="flex column left">
            {ConfigRequired.map(
                (route) =>
                    ((!window._env_.K8S_CLIENT &&
                        ((serverMode !== SERVER_MODE.EA_ONLY && !route.moduleName) ||
                            route.isAvailableInEA ||
                            installedModuleMap.current?.[route.moduleName])) ||
                        route.isAvailableInDesktop) &&
                    renderNavItem(route),
            )}
            {!window._env_.K8S_CLIENT && (
                <>
                    <hr className="mt-8 mb-8 w-100 checklist__divider" />
                    {ConfigOptional.map(
                        (route, index) =>
                            ((serverMode !== SERVER_MODE.EA_ONLY && !route.moduleName) ||
                                route.isAvailableInEA ||
                                installedModuleMap.current?.[route.moduleName]) &&
                            (route.group ? (
                                <>
                                    <NavLink
                                        key={`nav_item_${index}`}
                                        to={route.href}
                                        data-testid="user-authorization-link"
                                        className={`cursor ${
                                            collapsedState[route.name] ? '' : 'fw-6'
                                        } flex dc__content-space`}
                                        onClick={(e) => {
                                            handleGroupCollapsedState(e, route)
                                        }}
                                    >
                                        {route.name}
                                        <Dropdown
                                            className="icon-dim-20 rotate fcn-6"
                                            style={{
                                                ['--rotateBy' as any]: !collapsedState[route.name] ? '180deg' : '0deg',
                                            }}
                                        />
                                    </NavLink>
                                    {!collapsedState[route.name] && (
                                        <>
                                            {route.group.map((_route) => {
                                                return renderNavItem(_route, 'ml-10', true)
                                            })}
                                        </>
                                    )}
                                </>
                            ) : (
                                renderNavItem(route)
                            )),
                    )}
                    <hr className="mt-8 mb-8 w-100 checklist__divider" />
                    {serverMode !== SERVER_MODE.EA_ONLY && (
                        <>
                            {DeploymentWindow && (
                                <NavLink
                                    to={URLS.GLOBAL_CONFIG_DEPLOYMENT_WINDOW}
                                    key={URLS.GLOBAL_CONFIG_DEPLOYMENT_WINDOW}
                                    activeClassName="active-route"
                                >
                                    <div className="flexbox flex-justify">Deployment Window</div>
                                </NavLink>
                            )}
                            {ApprovalPolicy && (
                                <NavLink
                                    to={URLS.GLOBAL_CONFIG_APPROVAL_POLICY}
                                    key={URLS.GLOBAL_CONFIG_APPROVAL_POLICY}
                                    activeClassName="active-route"
                                >
                                    <div className="flexbox flex-justify">Approval Policy</div>
                                </NavLink>
                            )}
                            {window._env_.FEATURE_IMAGE_PROMOTION_ENABLE && ImagePromotion && (
                                <NavLink
                                    to={URLS.GLOBAL_CONFIG_IMAGE_PROMOTION}
                                    key={URLS.GLOBAL_CONFIG_IMAGE_PROMOTION}
                                    activeClassName="active-route"
                                >
                                    <div className="flexbox flex-justify">Image Promotion</div>
                                </NavLink>
                            )}
                        </>
                    )}
                    <NavLink
                        to={URLS.GLOBAL_CONFIG_EXTERNAL_LINKS}
                        key={URLS.GLOBAL_CONFIG_EXTERNAL_LINKS}
                        activeClassName="active-route"
                    >
                        <div className="flexbox flex-justify">External Links</div>
                    </NavLink>
                    {CatalogFramework && (
                        <NavLink
                            to={URLS.GLOBAL_CONFIG_CATALOG_FRAMEWORK}
                            key={URLS.GLOBAL_CONFIG_CATALOG_FRAMEWORK}
                            activeClassName="active-route"
                        >
                            <div className="flexbox flex-justify">Catalog Framework</div>
                        </NavLink>
                    )}
                    {serverMode !== SERVER_MODE.EA_ONLY && (
                        <>
                            {window._env_.ENABLE_SCOPED_VARIABLES && (
                                <NavLink
                                    to={CommonURLS.GLOBAL_CONFIG_SCOPED_VARIABLES}
                                    key={`${CommonURLS.GLOBAL_CONFIG_SCOPED_VARIABLES}-nav-link`}
                                    activeClassName="active-route"
                                >
                                    <div className="flexbox flex-justify">Scoped Variables</div>
                                </NavLink>
                            )}

                            {PluginsPolicy && (
                                <NavLink
                                    to={URLS.GLOBAL_CONFIG_PLUGIN_POLICY}
                                    key={URLS.GLOBAL_CONFIG_PLUGIN_POLICY}
                                    activeClassName="active-route"
                                >
                                    <div className="flexbox flex-justify">Plugin Policy</div>
                                </NavLink>
                            )}

                            {PullImageDigest && (
                                <NavLink
                                    to={URLS.GLOBAL_CONFIG_PULL_IMAGE_DIGEST}
                                    key={URLS.GLOBAL_CONFIG_PULL_IMAGE_DIGEST}
                                    activeClassName="active-route"
                                >
                                    <div className="flexbox flex-justify">Pull Image Digest</div>
                                </NavLink>
                            )}

                            {TagListContainer && (
                                <NavLink
                                    to={URLS.GLOBAL_CONFIG_TAGS}
                                    key={URLS.GLOBAL_CONFIG_TAGS}
                                    activeClassName="active-route"
                                >
                                    <div className="flexbox flex-justify">Tags Policy</div>
                                </NavLink>
                            )}
                            {FilterConditions && (
                                <NavLink
                                    to={URLS.GLOBAL_CONFIG_FILTER_CONDITION}
                                    key={URLS.GLOBAL_CONFIG_FILTER_CONDITION}
                                    activeClassName="active-route"
                                >
                                    <div className="flexbox flex-justify">Filter Condition</div>
                                </NavLink>
                            )}
                            {LockDeploymentConfiguration && (
                                <NavLink
                                    to={URLS.GLOBAL_CONFIG_LOCK_DEPLOYMENT_CONFIGURATION}
                                    key={URLS.GLOBAL_CONFIG_LOCK_DEPLOYMENT_CONFIGURATION}
                                    activeClassName="active-route"
                                >
                                    <div className="flexbox flex-justify">Lock Deployment Configuration</div>
                                </NavLink>
                            )}

                            <NavLink
                                to={URLS.GLOBAL_CONFIG_BUILD_INFRA}
                                key={URLS.GLOBAL_CONFIG_BUILD_INFRA}
                                activeClassName="active-route"
                            >
                                <div className="flexbox flex-justify">Build Infra</div>
                            </NavLink>
                        </>
                    )}
                </>
            )}
        </div>
    )
}

const Body = ({ getHostURLConfig, checkList, serverMode, handleChecklistUpdate, isSuperAdmin }: BodyType) => {
    const location = useLocation()
    const defaultRoute = (): string => {
        if (window._env_.K8S_CLIENT) {
            return URLS.GLOBAL_CONFIG_CLUSTER
        }
        if (serverMode === SERVER_MODE.EA_ONLY) {
            return URLS.GLOBAL_CONFIG_PROJECT
        }
        return URLS.GLOBAL_CONFIG_HOST_URL
    }

    return (
        <Switch>
            <Route
                path={URLS.GLOBAL_CONFIG_CLUSTER}
                render={(props) => {
                    return (
                        <ClusterList
                            {...props}
                            serverMode={serverMode}
                            isSuperAdmin={isSuperAdmin || window._env_.K8S_CLIENT}
                        />
                    )
                }}
            />
            {!window._env_.K8S_CLIENT && [
                ...(serverMode !== SERVER_MODE.EA_ONLY
                    ? [
                          <Route
                              key={URLS.GLOBAL_CONFIG_HOST_URL}
                              path={URLS.GLOBAL_CONFIG_HOST_URL}
                              render={(props) => {
                                  return (
                                      <HostURLConfiguration
                                          {...props}
                                          isSuperAdmin={isSuperAdmin}
                                          refreshGlobalConfig={getHostURLConfig}
                                          handleChecklistUpdate={handleChecklistUpdate}
                                      />
                                  )
                              }}
                          />,
                      ]
                    : []),
                <Route
                    key={URLS.GLOBAL_CONFIG_GITOPS}
                    path={URLS.GLOBAL_CONFIG_GITOPS}
                    render={(props) => {
                        return <GitOpsConfiguration handleChecklistUpdate={handleChecklistUpdate} {...props} />
                    }}
                />,
                <Route
                    key={URLS.GLOBAL_CONFIG_PROJECT}
                    path={URLS.GLOBAL_CONFIG_PROJECT}
                    render={(props) => {
                        return <Project {...props} isSuperAdmin={isSuperAdmin} />
                    }}
                />,
                ...(serverMode !== SERVER_MODE.EA_ONLY
                    ? [
                          <Route
                              key={URLS.GLOBAL_CONFIG_GIT}
                              path={URLS.GLOBAL_CONFIG_GIT}
                              render={(props) => {
                                  return <GitProvider {...props} isSuperAdmin={isSuperAdmin} />
                              }}
                          />,
                      ]
                    : []),
                <Route
                    key={URLS.GLOBAL_CONFIG_DOCKER}
                    path={`${URLS.GLOBAL_CONFIG_DOCKER}/:id?`}
                    render={(props) => {
                        return (
                            <Docker
                                {...props}
                                handleChecklistUpdate={handleChecklistUpdate}
                                isSuperAdmin={isSuperAdmin}
                                isHyperionMode={serverMode === SERVER_MODE.EA_ONLY}
                            />
                        )
                    }}
                />,
                <Route
                    key={URLS.GLOBAL_CONFIG_CHART}
                    path={URLS.GLOBAL_CONFIG_CHART}
                    render={(props) => {
                        return <ChartRepo {...props} isSuperAdmin={isSuperAdmin} />
                    }}
                />,
                ...(serverMode !== SERVER_MODE.EA_ONLY
                    ? [
                          <Route
                              key={CommonURLS.GLOBAL_CONFIG_DEPLOYMENT_CHARTS_LIST}
                              path={CommonURLS.GLOBAL_CONFIG_DEPLOYMENT_CHARTS_LIST}
                          >
                              <DeploymentChartsRouter />
                          </Route>,
                      ]
                    : []),
                <Route key={URLS.GLOBAL_CONFIG_AUTH} path={URLS.GLOBAL_CONFIG_AUTH} component={Authorization} />,
                <Route
                    key={URLS.GLOBAL_CONFIG_NOTIFIER}
                    path={`${URLS.GLOBAL_CONFIG_NOTIFIER}/edit`}
                    render={(props) => {
                        return <AddNotification {...props} />
                    }}
                />,
                <Route
                    key={URLS.GLOBAL_CONFIG_NOTIFIER}
                    path={URLS.GLOBAL_CONFIG_NOTIFIER}
                    render={(props) => {
                        return <Notifier {...props} isSuperAdmin={isSuperAdmin} />
                    }}
                />,
                <Route key={URLS.GLOBAL_CONFIG_EXTERNAL_LINKS} path={URLS.GLOBAL_CONFIG_EXTERNAL_LINKS}>
                    <ExternalLinks />
                </Route>,
                ...(serverMode !== SERVER_MODE.EA_ONLY
                    ? [
                          <Route key={URLS.GLOBAL_CONFIG_BUILD_INFRA} path={URLS.GLOBAL_CONFIG_BUILD_INFRA}>
                              <BuildInfra isSuperAdmin={isSuperAdmin} />
                          </Route>,
                      ]
                    : []),
            ]}
            {CatalogFramework && (
                <Route key={URLS.GLOBAL_CONFIG_CATALOG_FRAMEWORK} path={URLS.GLOBAL_CONFIG_CATALOG_FRAMEWORK}>
                    <CatalogFramework isSuperAdmin={isSuperAdmin} />
                </Route>
            )}
            {serverMode !== SERVER_MODE.EA_ONLY && [
                window._env_.ENABLE_SCOPED_VARIABLES && (
                    <Route
                        key={`${CommonURLS.GLOBAL_CONFIG_SCOPED_VARIABLES}-route`}
                        path={CommonURLS.GLOBAL_CONFIG_SCOPED_VARIABLES}
                    >
                        <ScopedVariables isSuperAdmin={isSuperAdmin} />
                    </Route>
                ),
                DeploymentWindow && (
                    <Route key={URLS.GLOBAL_CONFIG_DEPLOYMENT_WINDOW} path={URLS.GLOBAL_CONFIG_DEPLOYMENT_WINDOW}>
                        <DeploymentWindow isSuperAdmin={isSuperAdmin} />
                    </Route>
                ),
                ApprovalPolicy && (
                    <Route key={URLS.GLOBAL_CONFIG_APPROVAL_POLICY} path={URLS.GLOBAL_CONFIG_APPROVAL_POLICY}>
                        <ApprovalPolicy />
                    </Route>
                ),
                ImagePromotion && (
                    <Route key={URLS.GLOBAL_CONFIG_IMAGE_PROMOTION} path={URLS.GLOBAL_CONFIG_IMAGE_PROMOTION}>
                        <ImagePromotion isSuperAdmin={isSuperAdmin} />
                    </Route>
                ),
                window._env_.FEATURE_CD_MANDATORY_PLUGINS_ENABLE
                    ? PluginsPolicy && (
                          <Route path={URLS.GLOBAL_CONFIG_PLUGIN_POLICY}>
                              <PluginsPolicy OfflinePipelineModalAppView={OffendingPipelineModalAppView} />
                          </Route>
                      )
                    : PluginsPolicyV1 && (
                          <Route path={URLS.GLOBAL_CONFIG_PLUGIN_POLICY}>
                              <PluginsPolicyV1 />
                          </Route>
                      ),
                PullImageDigest && (
                    <Route path={URLS.GLOBAL_CONFIG_PULL_IMAGE_DIGEST}>
                        <PullImageDigest isSuperAdmin={isSuperAdmin} />
                    </Route>
                ),
                TagListContainer && (
                    <Route path={URLS.GLOBAL_CONFIG_TAGS}>
                        <TagListContainer />
                    </Route>
                ),
                FilterConditions && (
                    <Route path={URLS.GLOBAL_CONFIG_FILTER_CONDITION}>
                        <FilterConditions isSuperAdmin={isSuperAdmin} />
                    </Route>
                ),
                LockDeploymentConfiguration && (
                    <Route path={URLS.GLOBAL_CONFIG_LOCK_DEPLOYMENT_CONFIGURATION}>
                        <LockDeploymentConfiguration />
                    </Route>
                ),
                window._env_.FEATURE_APPLICATION_TEMPLATES_ENABLE && DevtronAppTemplates && (
                    <Route path={CommonURLS.GLOBAL_CONFIG_TEMPLATES_DEVTRON_APP}>
                        <DevtronAppTemplates AppConfig={AppConfig} />
                    </Route>
                )
            ]}
            <Redirect to={defaultRoute()} />
        </Switch>
    )
}

const Logo = ({ src = '', style = {}, className = '', children = null }) => {
    return (
        <>
            {src && <img src={src} alt="" className={`list__logo ${className}`} style={style} />}
            {children}
        </>
    )
}

const Title = ({ title = '', subtitle = '', style = {}, className = '', tag = '', ...props }) => {
    return (
        <div className="flex column left">
            <div className={`list__title ${className}`} style={style}>
                {title} {tag && <span className="tag">{tag}</span>}
            </div>
            {subtitle && <div className={`list__subtitle ${className}`}>{subtitle}</div>}
        </div>
    )
}

const ListToggle = ({ onSelect, enabled = false, isButtonDisabled = false, ...props }) => {
    const handleToggle = () => {
        if (!isButtonDisabled) {
            onSelect(!enabled)
        }
    }
    return (
        <Toggle
            dataTestId="toggle-button"
            {...props}
            onSelect={handleToggle}
            selected={enabled}
            disabled={isButtonDisabled}
        />
    )
}

const DropDown = ({ className = '', dataTestid = '', style = {}, src = null, ...props }) => {
    if (isValidElement(src)) {
        return src
    }
    return (
        <img
            {...props}
            src={src || arrowTriangle}
            data-testid={dataTestid}
            alt=""
            className={`list__arrow ${className}`}
            style={style}
        />
    )
}

export const List = ({ dataTestId = '', children = null, className = '', ...props }) => {
    return (
        <div className={`list ${className}`} {...props} data-testid={dataTestId}>
            {children}
        </div>
    )
}

function handleError(error: any): any[] {
    if (!error) {
        return []
    }

    if (!Array.isArray(error)) {
        return [error]
    }

    return error
}

export const ProtectedInput = ({
    name,
    value,
    error,
    onChange,
    label = '',
    tabIndex = 1,
    disabled = false,
    hidden = true,
    labelClassName = '',
    placeholder = '',
    dataTestid = '',
    onBlur = (e) => { },
    isRequiredField = false,
    autoFocus = false,
}: ProtectedInputType) => {
    const inputRef = useRef<HTMLInputElement>()

    useEffect(() => {
        setTimeout(() => {
            // Added timeout to ensure the autofocus code is executed post the re-renders
            if (inputRef.current && autoFocus) {
                inputRef.current.focus()
            }
        }, 100)
    }, [autoFocus])
    
    const [shown, toggleShown] = useState(false)
    useEffect(() => {
        toggleShown(!hidden)
    }, [hidden])

    return (
        <div className="flex column left top ">
            <label
                htmlFor=""
                className={`form__label ${labelClassName} ${isRequiredField ? 'dc__required-field' : ''}`}
            >
                {label}
            </label>
            <div className="dc__position-rel w-100">
                <input
                    data-testid={dataTestid}
                    type={shown ? 'text' : 'password'}
                    tabIndex={tabIndex}
                    className={error ? 'form__input form__input--error pl-42' : 'form__input pl-42 fs-13'}
                    name={name}
                    placeholder={placeholder}
                    onChange={(e) => {
                        e.persist()
                        onChange(e)
                    }}
                    value={value}
                    disabled={disabled}
                    onBlur={onBlur}
                    autoFocus={autoFocus}
                    ref={inputRef}
                />
                <ShowHide
                    className="protected-input__toggle"
                    hidden={!shown}
                    defaultOnClick={(e) => toggleShown(!shown)}
                    disabled={disabled}
                />
            </div>
            {error && (
                <div className="form__error">
                    <FormError className="form__icon form__icon--error" />
                    {error}
                </div>
            )}
        </div>
    )
}

export const ShowHide = ({
    hidden = true,
    className = '',
    onClick = null,
    defaultOnClick = null,
    disabled = false,
}) => {
    return hidden ? (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            className={className}
            viewBox="0 0 24 24"
            onClick={disabled ? () => { } : onClick || defaultOnClick}
        >
            <g fill="none" fillRule="evenodd">
                <path d="M0 0h24v24H0V0zm0 0h24v24H0V0zm0 0h24v24H0V0zm0 0h24v24H0V0z" />
                <path
                    fill="#767D84"
                    d="M12 6a9.77 9.77 0 0 1 8.82 5.5 9.647 9.647 0 0 1-2.41 3.12l1.41 1.41c1.39-1.23 2.49-2.77 3.18-4.53C21.27 7.11 17 4 12 4c-1.27 0-2.49.2-3.64.57l1.65 1.65C10.66 6.09 11.32 6 12 6zm-1.07 1.14L13 9.21c.57.25 1.03.71 1.28 1.28l2.07 2.07c.08-.34.14-.7.14-1.07C16.5 9.01 14.48 7 12 7c-.37 0-.72.05-1.07.14zM2.01 3.87l2.68 2.68A11.738 11.738 0 0 0 1 11.5C2.73 15.89 7 19 12 19c1.52 0 2.98-.29 4.32-.82l3.42 3.42 1.41-1.41L3.42 2.45 2.01 3.87zm7.5 7.5l2.61 2.61c-.04.01-.08.02-.12.02a2.5 2.5 0 0 1-2.5-2.5c0-.05.01-.08.01-.13zm-3.4-3.4l1.75 1.75a4.6 4.6 0 0 0-.36 1.78 4.507 4.507 0 0 0 6.27 4.14l.98.98c-.88.24-1.8.38-2.75.38a9.77 9.77 0 0 1-8.82-5.5c.7-1.43 1.72-2.61 2.93-3.53z"
                />
            </g>
        </svg>
    ) : (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            className={className}
            viewBox="0 0 24 24"
            onClick={disabled ? () => { } : onClick || defaultOnClick}
        >
            <g fill="none" fillRule="evenodd">
                <path d="M0 0h24v24H0z" />
                <path
                    fill="#959BA1"
                    d="M12 6a9.77 9.77 0 0 1 8.82 5.5A9.77 9.77 0 0 1 12 17a9.77 9.77 0 0 1-8.82-5.5A9.77 9.77 0 0 1 12 6m0-2C7 4 2.73 7.11 1 11.5 2.73 15.89 7 19 12 19s9.27-3.11 11-7.5C21.27 7.11 17 4 12 4zm0 5a2.5 2.5 0 0 1 0 5 2.5 2.5 0 0 1 0-5m0-2c-2.48 0-4.5 2.02-4.5 4.5S9.52 16 12 16s4.5-2.02 4.5-4.5S14.48 7 12 7z"
                />
            </g>
        </svg>
    )
}

ProtectedInput.ShowHide = ShowHide
List.Logo = Logo
List.Title = Title
List.Toggle = ListToggle
List.DropDown = DropDown
