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

import { lazy, useState, useEffect, Suspense, isValidElement, PropsWithChildren, LazyExoticComponent } from 'react'
import { Route, NavLink, Router, Switch, Redirect, useHistory, useLocation } from 'react-router-dom'
import {
    showError,
    Progressing,
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
import { getHostURLConfiguration, getAppCheckList } from '../../services/service'
import './globalConfigurations.scss'
import {
    ModuleNameMap,
    MODULE_STATUS_POLLING_INTERVAL,
    MODULE_STATUS_RETRY_COUNT,
    Routes,
    SERVER_MODE,
} from '../../config/constants'
import { ModuleStatus } from '../v2/devtronStackManager/DevtronStackManager.type'
import { getModuleInfo } from '../v2/devtronStackManager/DevtronStackManager.service'
import { BodyType } from './globalConfiguration.type'
import { GlobalConfigurationProvider, useGlobalConfiguration } from './GlobalConfigurationProvider'
import { OffendingPipelineModalAppView } from '@Pages/GlobalConfigurations/PluginPolicy/OffendingPipelineModal'
import { getShouldHidePageHeaderAndSidebar } from './utils'
import { ListProps } from './types'
import { InteractiveCellText } from '@Components/common/helpers/InteractiveCellText/InteractiveCellText'

const HostURLConfiguration = lazy(() => import('../hostURL/HostURL'))
const Docker = lazy(() => import('../dockerRegistry/Docker'))
const Clusters = lazy(() => import('@Pages/GlobalConfigurations/ClustersAndEnvironments/ClusterList'))
const Authorization = lazy(() => import('@Pages/GlobalConfigurations/Authorization'))
// NOTE: Might import from index itself
const TagListContainer = importComponentFromFELibrary('TagListContainer')
const PluginsPolicy = importComponentFromFELibrary('PluginsPolicy', null, 'function')
const FilterConditions = importComponentFromFELibrary('FilterConditions')
const LockDeploymentConfiguration = importComponentFromFELibrary('LockDeploymentConfiguration', null, 'function')
const ApprovalPolicy = importComponentFromFELibrary('ApprovalPolicy', null, 'function')
const PullImageDigest = importComponentFromFELibrary('PullImageDigest')
const DeploymentWindow = importComponentFromFELibrary('DeploymentWindowComponent')
const ImagePromotion = importComponentFromFELibrary('ImagePromotion')

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
        <main
            className={`global-configuration ${shouldHidePageHeaderAndSidebar ? 'global-configuration--full-content' : ''}`}
        >
            {!shouldHidePageHeaderAndSidebar && <PageHeader headerName="Global Configurations" />}
            <Router history={useHistory()}>
                <GlobalConfigurationProvider>
                    {!shouldHidePageHeaderAndSidebar && (
                        <section className="global-configuration__navigation">
                            <NavItem serverMode={serverMode} />
                        </section>
                    )}
                    <section className="global-configuration__component-wrapper bg__secondary">
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
    const {
        featureGitOpsFlags: { isFeatureGitOpsEnabled },
    } = useMainContext()

    let moduleStatusTimer = null
    const ConfigRequired: {
        name: string
        href: string
        component: LazyExoticComponent<any>
        isAvailableInEA: boolean
        moduleName?: string
        isAvailableInDesktop?: boolean
        hideRoute?: boolean
    }[] = [
        {
            name: 'Host URL',
            href: URLS.GLOBAL_CONFIG_HOST_URL,
            component: HostURLConfiguration,
            isAvailableInEA: false,
        },
        {
            name: `Clusters${window._env_.K8S_CLIENT ? '' : ' & Environments'}`,
            href: URLS.GLOBAL_CONFIG_CLUSTER,
            component: Clusters,
            isAvailableInEA: true,
            isAvailableInDesktop: true,
        },
        {
            name: serverMode === SERVER_MODE.EA_ONLY ? 'OCI Registry' : 'Container/ OCI Registry',
            href: URLS.GLOBAL_CONFIG_DOCKER,
            component: Docker,
            isAvailableInEA: true,
        },
    ]

    const ConfigOptional = [
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
                    className={`${
                        route.name === 'API tokens' &&
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
                        !route.hideRoute &&
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
                            ((serverMode !== SERVER_MODE.EA_ONLY && !(route as any).moduleName) ||
                                route.isAvailableInEA ||
                                installedModuleMap.current?.[(route as any).moduleName]) &&
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
                    {serverMode !== SERVER_MODE.EA_ONLY && (
                        <>
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
                        </>
                    )}
                </>
            )}
        </div>
    )
}

const Body = ({ getHostURLConfig, checkList, serverMode, handleChecklistUpdate, isSuperAdmin }: BodyType) => {
    const {
        featureGitOpsFlags: { isFeatureGitOpsEnabled },
    } = useMainContext()

    const defaultRoute = (): string => {
        if (window._env_.K8S_CLIENT) {
            return URLS.GLOBAL_CONFIG_CLUSTER
        }
        if (serverMode === SERVER_MODE.EA_ONLY) {
            return CommonURLS.APPLICATION_MANAGEMENT_PROJECTS
        }
        return URLS.GLOBAL_CONFIG_HOST_URL
    }

    return (
        <Switch>
            <Route
                path={URLS.GLOBAL_CONFIG_CLUSTER}
                render={() => {
                    return <Clusters />
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

                <Route key={URLS.GLOBAL_CONFIG_AUTH} path={URLS.GLOBAL_CONFIG_AUTH} component={Authorization} />,
            ]}
            {serverMode !== SERVER_MODE.EA_ONLY && [
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
                PluginsPolicy && (
                    <Route path={URLS.GLOBAL_CONFIG_PLUGIN_POLICY}>
                        <PluginsPolicy OfflinePipelineModalAppView={OffendingPipelineModalAppView} />
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

const Title = ({ title = '', subtitle = '', style = {}, className = '', tag = '', category = '' }) => {
    return (
        <div className="flex column left">
            <div className={`list__title ${className} flex left w-100`} style={style}>
                <div className="dc__no-shrink dc__mxw-400 dc__truncate">
                    <InteractiveCellText text={title} />
                </div>
                {tag && <div className="tag dc__no-shrink">{tag}</div>}
                {category && (
                    <div className="dc__border bg__secondary px-6 fs-12 lh-18 br-4 ml-8 fw-4 lh-18 dc__mxw-150 dc__no-shrink dc__truncate dc__text-center">
                        <InteractiveCellText text={category} fontSize={12} />
                    </div>
                )}
            </div>
            {subtitle && <div className={`list__subtitle ${className}`}>{subtitle}</div>}
        </div>
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

export const List = ({
    dataTestId = '',
    children = null,
    className = '',
    internalRef = null,
    ...props
}: PropsWithChildren<ListProps>) => (
    <div ref={internalRef} className={`list ${className}`} {...props} data-testid={dataTestId}>
        {children}
    </div>
)

List.Logo = Logo
List.Title = Title
List.DropDown = DropDown
