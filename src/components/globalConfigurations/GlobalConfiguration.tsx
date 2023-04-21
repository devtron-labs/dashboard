import React, { lazy, useState, useEffect, Suspense, useContext } from 'react'
import { Route, NavLink, Router, Switch, Redirect } from 'react-router-dom'
import { useHistory, useLocation } from 'react-router'
import { URLS } from '../../config'
import { Toggle, ErrorBoundary, importComponentFromFELibrary } from '../common'
import { showError, Progressing } from '@devtron-labs/devtron-fe-common-lib'
import arrowTriangle from '../../assets/icons/ic-chevron-down.svg'
import { AddNotification } from '../notifications/AddNotification'
import { ReactComponent as FormError } from '../../assets/icons/ic-warning.svg'
import { getHostURLConfiguration } from '../../services/service'
import { getAppCheckList } from '../../services/service'
import './globalConfigurations.scss'
import {
    ModuleNameMap,
    MODULE_STATUS_POLLING_INTERVAL,
    MODULE_STATUS_RETRY_COUNT,
    Routes,
    SERVER_MODE,
} from '../../config/constants'
import { mainContext } from '../common/navigation/NavigationRoutes'
import ExternalLinks from '../externalLinks/ExternalLinks'
import PageHeader from '../common/header/PageHeader'
import { ReactComponent as Dropdown } from '../../assets/icons/ic-chevron-down.svg'
import { ModuleStatus } from '../v2/devtronStackManager/DevtronStackManager.type'
import { getModuleInfo } from '../v2/devtronStackManager/DevtronStackManager.service'
import { BodyType } from './globalConfiguration.type'

const HostURLConfiguration = lazy(() => import('../hostURL/HostURL'))
const GitOpsConfiguration = lazy(() => import('../gitOps/GitOpsConfiguration'))
const GitProvider = lazy(() => import('../gitProvider/GitProvider'))
const Docker = lazy(() => import('../dockerRegistry/Docker'))
const ClusterList = lazy(() => import('../cluster/Cluster'))
const ChartRepo = lazy(() => import('../chartRepo/ChartRepo'))
const Notifier = lazy(() => import('../notifications/Notifications'))
const Project = lazy(() => import('../project/ProjectList'))
const UserGroup = lazy(() => import('../userGroups/UserGroup'))
const SSOLogin = lazy(() => import('../login/SSOLogin'))
const CustomChartList = lazy(() => import('../CustomChart/CustomChartList'))
const TagListContainer = importComponentFromFELibrary('TagListContainer')

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
    const { serverMode } = useContext(mainContext)

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
                let appChecklist = response.result.appChecklist || {}
                let chartChecklist = response.result.chartChecklist || {}
                let appStageArray: number[] = Object.values(appChecklist)
                let chartStageArray: number[] = Object.values(chartChecklist)
                let appStageCompleted: number = appStageArray.reduce((item, sum) => {
                    sum = sum + item
                    return sum
                }, 0)
                let chartStageCompleted: number = chartStageArray.reduce((item, sum) => {
                    sum = sum + item
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
        <main className="global-configuration">
            <PageHeader headerName="Global configurations" />
            <Router history={useHistory()}>
                <section className="global-configuration__navigation">
                    <NavItem serverMode={serverMode} />
                </section>
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
            </Router>
        </main>
    )
}

function NavItem({ serverMode }) {
    const location = useLocation()
    const { installedModuleMap } = useContext(mainContext)
    const [, setForceUpdateTime] = useState(Date.now())
    // Add key of NavItem if grouping is used
    const [collapsedState, setCollapsedState] = useState<Record<string, boolean>>({
        Authorization: location.pathname.startsWith('/global-config/auth') ? false : true,
    })
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
            name: 'Clusters' + (serverMode === SERVER_MODE.EA_ONLY ? '' : ' & Environments'),
            href: URLS.GLOBAL_CONFIG_CLUSTER,
            component: ClusterList,
            isAvailableInEA: true,
            isAvailableInDesktop: true,
        },
        { name: 'Git Accounts', href: URLS.GLOBAL_CONFIG_GIT, component: GitProvider, isAvailableInEA: false },
        { name: 'Container Registries', href: URLS.GLOBAL_CONFIG_DOCKER, component: Docker, isAvailableInEA: false },
    ]

    const ConfigOptional = [
        { name: 'Chart Repositories',href: URLS.GLOBAL_CONFIG_CHART, component: ChartRepo, isAvailableInEA: true },
        {
            name: 'Custom Charts',
            href: URLS.GLOBAL_CONFIG_CUSTOM_CHARTS,
            component: CustomChartList,
            isAvailableInEA: false,
        },
        { name: 'SSO Login Services', href: URLS.GLOBAL_CONFIG_LOGIN, component: SSOLogin, isAvailableInEA: true },
        {
            name: 'Authorization',
            href: `${URLS.GLOBAL_CONFIG_AUTH}/users`,
            preventDefaultKey: URLS.GLOBAL_CONFIG_AUTH,
            group: [
                {
                    name: 'User Permissions',
                    dataTestId: 'authorization-user-permissions-link',
                    href: `${URLS.GLOBAL_CONFIG_AUTH}/users`,
                    isAvailableInEA: true,
                },
                {
                    name: 'Permission Groups',
                    dataTestId: 'authorization-permission-groups-link',
                    href: `${URLS.GLOBAL_CONFIG_AUTH}/groups`,
                    isAvailableInEA: true,
                },
                {
                    name: 'API Tokens',
                    dataTestId: 'authorization-api-tokens-link',
                    href: `${URLS.GLOBAL_CONFIG_AUTH}/${Routes.API_TOKEN}/list`,
                    isAvailableInEA: true,
                },
            ],
            component: UserGroup,
            isAvailableInEA: true,
        },
        {
            name: 'Notifications',
            href: URLS.GLOBAL_CONFIG_NOTIFIER,
            component: Notifier,
            moduleName: ModuleNameMap.NOTIFICATION,
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
                getModuleStatus(moduleName, retryOnError--)
            }
        }
    }

    const renderNavItem = (route, className = '', preventOnClickOp = false) => {
        return (
            <NavLink
                to={`${route.href}`}
                key={route.href}
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
                                            className="icon-dim-24 rotate"
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
                    <NavLink
                        to={URLS.GLOBAL_CONFIG_EXTERNAL_LINKS}
                        key={URLS.GLOBAL_CONFIG_EXTERNAL_LINKS}
                        activeClassName="active-route"
                    >
                        <div className="flexbox flex-justify">External Links</div>
                    </NavLink>
                    {TagListContainer && (
                        <NavLink
                            to={URLS.GLOBAL_CONFIG_TAGS}
                            key={URLS.GLOBAL_CONFIG_TAGS}
                            activeClassName="active-route"
                        >
                            <div className="flexbox flex-justify">Tags</div>
                        </NavLink>
                    )}
                </>
            )}
        </div>
    )
}

function Body({ getHostURLConfig, checkList, serverMode, handleChecklistUpdate, isSuperAdmin }: BodyType) {
    const location = useLocation()

    const defaultRoute = (): string => {
        if (window._env_.K8S_CLIENT) {
            return URLS.GLOBAL_CONFIG_CLUSTER
        } else if (serverMode === SERVER_MODE.EA_ONLY) {
            return URLS.GLOBAL_CONFIG_PROJECT
        } else {
            return URLS.GLOBAL_CONFIG_HOST_URL
        }
    }

    return (
        <Switch location={location}>
            <Route
                path={URLS.GLOBAL_CONFIG_CLUSTER}
                render={(props) => {
                    return (
                        <div className="flexbox">
                            <ClusterList
                                {...props}
                                serverMode={serverMode}
                                isSuperAdmin={isSuperAdmin || window._env_.K8S_CLIENT}
                            />
                        </div>
                    )
                }}
            />
            {!window._env_.K8S_CLIENT && [
                <Route
                    key={URLS.GLOBAL_CONFIG_HOST_URL}
                    path={URLS.GLOBAL_CONFIG_HOST_URL}
                    render={(props) => {
                        return (
                            <div className="flexbox">
                                <HostURLConfiguration
                                    {...props}
                                    isSuperAdmin={isSuperAdmin}
                                    refreshGlobalConfig={getHostURLConfig}
                                    handleChecklistUpdate={handleChecklistUpdate}
                                />
                            </div>
                        )
                    }}
                />,
                <Route
                    key={URLS.GLOBAL_CONFIG_GITOPS}
                    path={URLS.GLOBAL_CONFIG_GITOPS}
                    render={(props) => {
                        return (
                            <div className="flexbox">
                                <GitOpsConfiguration handleChecklistUpdate={handleChecklistUpdate} {...props} />
                            </div>
                        )
                    }}
                />,
                <Route
                    key={URLS.GLOBAL_CONFIG_PROJECT}
                    path={URLS.GLOBAL_CONFIG_PROJECT}
                    render={(props) => {
                        return (
                            <div className="flexbox">
                                <Project {...props} isSuperAdmin={isSuperAdmin} />
                            </div>
                        )
                    }}
                />,
                <Route
                    key={URLS.GLOBAL_CONFIG_GIT}
                    path={URLS.GLOBAL_CONFIG_GIT}
                    render={(props) => {
                        return (
                            <div className="flexbox">
                                <GitProvider {...props} isSuperAdmin={isSuperAdmin} />
                            </div>
                        )
                    }}
                />,
                <Route
                    key={URLS.GLOBAL_CONFIG_DOCKER}
                    path={`${URLS.GLOBAL_CONFIG_DOCKER}/:id?`}
                    render={(props) => {
                        return (
                            <div className="flexbox">
                                <Docker
                                    {...props}
                                    handleChecklistUpdate={handleChecklistUpdate}
                                    isSuperAdmin={isSuperAdmin}
                                />
                            </div>
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
                <Route key={URLS.GLOBAL_CONFIG_CUSTOM_CHARTS} path={URLS.GLOBAL_CONFIG_CUSTOM_CHARTS}>
                    <CustomChartList />
                </Route>,
                <Route
                    key={URLS.GLOBAL_CONFIG_LOGIN}
                    path={URLS.GLOBAL_CONFIG_LOGIN}
                    render={(props) => {
                        return <SSOLogin {...props} />
                    }}
                />,
                <Route
                    key={URLS.GLOBAL_CONFIG_AUTH}
                    path={URLS.GLOBAL_CONFIG_AUTH}
                    render={(props) => {
                        return <UserGroup />
                    }}
                />,
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
            ]}
            {TagListContainer && (
                <Route path={URLS.GLOBAL_CONFIG_TAGS}>
                    <TagListContainer />
                </Route>
            )}
            <Redirect to={defaultRoute()} />
        </Switch>
    )
}

function Logo({ src = '', style = {}, className = '', children = null }) {
    return (
        <>
            {src && <img src={src} alt="" className={`list__logo ${className}`} style={style} />}
            {children}
        </>
    )
}

function Title({ title = '', subtitle = '', style = {}, className = '', tag = '', ...props }) {
    return (
        <div className="flex column left">
            <div className={`list__title ${className}`} style={style}>
                {title} {tag && <span className="tag">{tag}</span>}
            </div>
            {subtitle && <div className={`list__subtitle ${className}`}>{subtitle}</div>}
        </div>
    )
}

function ListToggle({ onSelect, enabled = false, ...props }) {
    return <Toggle dataTestId="toggle-button" {...props} onSelect={onSelect} selected={enabled} />
}

function DropDown({ className = '', dataTestid = '', style = {}, src = null, ...props }) {
    if (React.isValidElement(src)) return src
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

export function List({ dataTestId = '', children = null, className = '', ...props }) {
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

export function CustomInput({
    name,
    value,
    error,
    onChange,
    onBlur = (e) => {},
    onFocus = (e) => {},
    label,
    type = 'text',
    disabled = false,
    autoComplete = 'off',
    labelClassName = '',
    placeholder = '',
    tabIndex = 1,
    dataTestid = '',
}) {
    return (
        <div className="flex column left top">
            <label className={`form__label ${labelClassName}`}>{label}</label>
            <input
                data-testid={dataTestid}
                type={type}
                name={name}
                autoComplete="off"
                className="form__input"
                onChange={(e) => {
                    e.persist()
                    onChange(e)
                }}
                onBlur={onBlur}
                onFocus={onFocus}
                placeholder={placeholder}
                value={value}
                disabled={disabled}
                tabIndex={tabIndex}
            />
            {handleError(error).map((err) => (
                <div className="form__error">
                    <FormError className="form__icon form__icon--error" />
                    {err}
                </div>
            ))}
        </div>
    )
}

export function ProtectedInput({
    name,
    value,
    error,
    onChange,
    label,
    type = 'text',
    tabIndex = 1,
    disabled = false,
    hidden = true,
    labelClassName = '',
    placeholder = '',
}) {
    const [shown, toggleShown] = useState(false)
    useEffect(() => {
        toggleShown(!hidden)
    }, [hidden])

    return (
        <div className="flex column left top ">
            <label htmlFor="" className={`form__label ${labelClassName}`}>
                {label}
            </label>
            <div className="dc__position-rel w-100">
                <input
                    type={shown ? 'text' : 'password'}
                    tabIndex={tabIndex}
                    className={error ? 'form__input form__input--error pl-42' : 'form__input pl-42'}
                    name={name}
                    placeholder={placeholder}
                    onChange={(e) => {
                        e.persist()
                        onChange(e)
                    }}
                    value={value}
                    disabled={disabled}
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

export function ShowHide({ hidden = true, className = '', onClick = null, defaultOnClick = null, disabled = false }) {
    return hidden ? (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            className={className}
            viewBox="0 0 24 24"
            onClick={disabled ? () => {} : onClick || defaultOnClick}
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
            onClick={disabled ? () => {} : onClick || defaultOnClick}
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
