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

import { lazy, useState, useEffect, Suspense, isValidElement, PropsWithChildren } from 'react'
import { Route, Routes, Navigate, useLocation } from 'react-router-dom'
import {
    showError,
    Progressing,
    useMainContext,
    PageHeader,
    SideNavigation,
    getComponentSpecificThemeClass,
    AppThemeType,
    SideNavigationProps,
    DOCUMENTATION,
    BASE_ROUTES,
} from '@devtron-labs/devtron-fe-common-lib'
import { ErrorBoundary } from '../common'
import arrowTriangle from '../../assets/icons/ic-chevron-down.svg'
import { getHostURLConfiguration, getAppCheckList } from '../../services/service'
import './globalConfigurations.scss'
import {
    ModuleNameMap,
    MODULE_STATUS_POLLING_INTERVAL,
    MODULE_STATUS_RETRY_COUNT,
    SERVER_MODE,
} from '../../config/constants'
import { ModuleStatus } from '../v2/devtronStackManager/DevtronStackManager.type'
import { getModuleInfo } from '../v2/devtronStackManager/DevtronStackManager.service'
import { BodyType } from './globalConfiguration.type'
import { GlobalConfigurationProvider, useGlobalConfiguration } from './GlobalConfigurationProvider'
import { getShouldHidePageHeaderAndSidebar } from './utils'
import { ListProps } from './types'
import { InteractiveCellText } from '@Components/common/helpers/InteractiveCellText/InteractiveCellText'
import { UserPermissionsTooltipContent } from './UserPermissionsTooltipContent'

const HostURLConfiguration = lazy(() => import('../hostURL/HostURL'))
const Docker = lazy(() => import('../dockerRegistry/Docker'))
const Clusters = lazy(() => import('@Pages/GlobalConfigurations/ClustersAndEnvironments/ClusterList'))
const ChartRepo = lazy(() => import('@Components/chartRepo/ChartRepo'))
const ExternalLinks = lazy(() => import('@Components/externalLinks/ExternalLinks'))
const Authorization = lazy(() => import('@Pages/GlobalConfigurations/Authorization'))
const ProjectList = lazy(() => import('@Components/project/ProjectList'))

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
        if (location.pathname.includes(BASE_ROUTES.GLOBAL_CONFIG.HOST_URL)) {
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
            {!shouldHidePageHeaderAndSidebar && (
                <PageHeader headerName="Global Configurations" docPath={DOCUMENTATION.GLOBAL_CONFIGUDATIONS} />
            )}
            <GlobalConfigurationProvider>
                {!shouldHidePageHeaderAndSidebar && (
                    <section className="global-configuration__navigation py-12 pl-8 pr-7 border__primary--right">
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
        </main>
    )
}

const NavItem = ({ serverMode }) => {
    const { installedModuleMap } = useMainContext()
    const [, setForceUpdateTime] = useState(Date.now())
    const { tippyConfig, setTippyConfig } = useGlobalConfiguration()

    let moduleStatusTimer = null

    useEffect(() => {
        getModuleStatus(ModuleNameMap.ARGO_CD, MODULE_STATUS_RETRY_COUNT)
        getModuleStatus(ModuleNameMap.NOTIFICATION, MODULE_STATUS_RETRY_COUNT)
        return () => {
            if (moduleStatusTimer) {
                clearTimeout(moduleStatusTimer)
            }
        }
    }, [])

    // TODO: Might need to check if it is required now
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

    const handleTooltipClose = () => {
        setTippyConfig({
            showTippy: false,
        })
    }

    const sideNavigationList: SideNavigationProps['list'] = [
        ...(serverMode === SERVER_MODE.FULL
            ? [
                  {
                      id: 'host-url',
                      title: 'Host URL',
                      dataTestId: 'global-configurations-host-url',
                      href: BASE_ROUTES.GLOBAL_CONFIG.HOST_URL,
                  },
              ]
            : []),
        {
            title: 'External Links',
            dataTestId: 'click-on-configurations-external-links',
            id: 'external-links',
            href: BASE_ROUTES.GLOBAL_CONFIG.EXTERNAL_LINKS,
        },
        {
            title: 'Chart Repository',
            dataTestId: 'click-on-configurations-chart-repository',
            id: 'chart-repository',
            href: BASE_ROUTES.GLOBAL_CONFIG.CHART_REPOSITORIES,
        },
        {
            id: 'clusters-environments',
            title: `Clusters${window._env_.K8S_CLIENT ? '' : ' & Environments'}`,
            dataTestId: 'global-configurations-clusters-environments',
            href: BASE_ROUTES.GLOBAL_CONFIG.CLUSTER_ENV.ROOT,
        },
        {
            id: 'container-oci-registry',
            title: serverMode === SERVER_MODE.EA_ONLY ? 'OCI Registry' : 'Container/ OCI Registry',
            dataTestId: 'global-configurations-container-oci-registry',
            href: BASE_ROUTES.GLOBAL_CONFIG.DOCKER,
        },
        {
            id: 'global-configurations-projects',
            title: 'Projects',
            dataTestId: 'global-configurations-projects',
            href: BASE_ROUTES.GLOBAL_CONFIG.PROJECTS,
        },
        {
            id: 'authorization',
            title: 'Authorization',
            dataTestId: 'global-configurations-authorization',
            items: [
                {
                    id: 'sso-login-services',
                    title: 'SSO Login Services',
                    dataTestId: 'authorization-sso-login-link',
                    href: `${BASE_ROUTES.GLOBAL_CONFIG.AUTH.ROOT}/${BASE_ROUTES.GLOBAL_CONFIG.AUTH.LOGIN_SERVICE}`,
                },
                {
                    id: 'user-permissions',
                    title: 'User Permissions',
                    dataTestId: 'authorization-user-permissions-link',
                    href: `${BASE_ROUTES.GLOBAL_CONFIG.AUTH.ROOT}/${BASE_ROUTES.GLOBAL_CONFIG.AUTH.USERS}`,
                    tooltipProps: {
                        alwaysShowTippyOnHover: true,
                        trigger: 'manual',
                        arrow: true,
                        interactive: true,
                        animation: 'shift-toward-subtle',
                        visible:
                            tippyConfig.showTippy &&
                            tippyConfig.showOnRoute === `${BASE_ROUTES.GLOBAL_CONFIG.AUTH.ROOT}/${BASE_ROUTES.GLOBAL_CONFIG.AUTH.USERS}`,
                        className: `global-configuration__user-permissions-tooltip no-content-padding dc__mxw-250 br-8 ${getComponentSpecificThemeClass(AppThemeType.light)}`,
                        placement: 'right',
                        content: <UserPermissionsTooltipContent onClose={handleTooltipClose} />,
                    },
                },
                {
                    id: 'permission-groups',
                    title: 'Permission Groups',
                    dataTestId: 'authorization-permission-groups-link',
                    href: `${BASE_ROUTES.GLOBAL_CONFIG.AUTH.ROOT}/${BASE_ROUTES.GLOBAL_CONFIG.AUTH.GROUPS}`,
                },
                {
                    id: 'api-tokens',
                    title: 'API Tokens',
                    dataTestId: 'authorization-api-tokens-link',
                    href: `${BASE_ROUTES.GLOBAL_CONFIG.AUTH.ROOT}/${BASE_ROUTES.GLOBAL_CONFIG.AUTH.API_TOKEN}`,
                },
            ],
        },
    ]

    return !window._env_.K8S_CLIENT && <SideNavigation list={sideNavigationList} />
}

const Body = ({ getHostURLConfig, serverMode, handleChecklistUpdate, isSuperAdmin }: BodyType) => {
    const defaultRoute = (): string => {
        if (window._env_.K8S_CLIENT) {
            return BASE_ROUTES.GLOBAL_CONFIG.CLUSTER_ENV.ROOT
        }
        if (serverMode === SERVER_MODE.EA_ONLY) {
            return BASE_ROUTES.GLOBAL_CONFIG.PROJECTS
        }
        return BASE_ROUTES.GLOBAL_CONFIG.HOST_URL
    }

    return (
        <Routes>
            <Route key={BASE_ROUTES.GLOBAL_CONFIG.EXTERNAL_LINKS} path={BASE_ROUTES.GLOBAL_CONFIG.EXTERNAL_LINKS} element={<ExternalLinks />} />
            <Route key={BASE_ROUTES.GLOBAL_CONFIG.CHART_REPOSITORIES} path={BASE_ROUTES.GLOBAL_CONFIG.CHART_REPOSITORIES} element={<ChartRepo isSuperAdmin={isSuperAdmin} />} />
            <Route path={`${BASE_ROUTES.GLOBAL_CONFIG.CLUSTER_ENV.ROOT}/*`} element={<Clusters />} />
            <Route key={BASE_ROUTES.GLOBAL_CONFIG.PROJECTS} path={BASE_ROUTES.GLOBAL_CONFIG.PROJECTS} element={<ProjectList isSuperAdmin={isSuperAdmin} />} />
            {!window._env_.K8S_CLIENT ? [
                ...(serverMode !== SERVER_MODE.EA_ONLY
                    ? [
                          <Route
                              key={BASE_ROUTES.GLOBAL_CONFIG.HOST_URL}
                              path={BASE_ROUTES.GLOBAL_CONFIG.HOST_URL}
                              element={
                                  <HostURLConfiguration
                                      isSuperAdmin={isSuperAdmin}
                                      refreshGlobalConfig={getHostURLConfig}
                                      handleChecklistUpdate={handleChecklistUpdate}
                                  />
                              }
                          />,
                      ]
                    : []),

                <Route
                    key={BASE_ROUTES.GLOBAL_CONFIG.DOCKER}
                    path={`${BASE_ROUTES.GLOBAL_CONFIG.DOCKER}/:id?`}
                    element={
                        <Docker
                            handleChecklistUpdate={handleChecklistUpdate}
                            isSuperAdmin={isSuperAdmin}
                            isHyperionMode={serverMode === SERVER_MODE.EA_ONLY}
                        />
                    }
                />,

                <Route key={BASE_ROUTES.GLOBAL_CONFIG.AUTH.ROOT} path={`${BASE_ROUTES.GLOBAL_CONFIG.AUTH.ROOT}/*`} element={<Authorization />} />,
            ]: []}
            <Route path="*" element={<Navigate to={defaultRoute()} />} />
        </Routes>
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
