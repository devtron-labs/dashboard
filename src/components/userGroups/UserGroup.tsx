import React, { useState, useEffect, useRef, useMemo, useCallback, useContext, lazy } from 'react'
import { Switch, Route, Redirect, useLocation, useHistory } from 'react-router-dom'
import { useRouteMatch } from 'react-router'
import {
    showError,
    Progressing,
    ConditionalWrap,
    ErrorScreenNotAuthorized,
    get,
    InfoColourBar,
    Option,
    MultiValueContainer,
    MultiValueRemove,
    multiSelectStyles,
    getRandomColor,
    noop,
    useEffectAfterMount,
    GenericEmptyState,
    useAsync,
    ERROR_EMPTY_SCREEN,
    TOAST_ACCESS_DENIED,
} from '@devtron-labs/devtron-fe-common-lib'
import {
    NavigationArrow,
    useKeyDown,
    getRandomString,
    sortBySelected,
    mapByKey,
    sortObjectArrayAlphabetically,
    importComponentFromFELibrary,
    createClusterEnvGroup,
} from '../common'
import { ReactComponent as ErrorIcon } from '../../assets/icons/ic-error-exclamation.svg'
import {
    getUserList,
    getGroupList,
    getUserId,
    getGroupId,
    getEnvironmentListHelmApps,
    getUsersDataToExport,
    getGroupsDataToExport,
    getUserRole,
    getCustomRoles,
} from './userGroup.service'
import { getAllWorkflowsForAppNames, getEnvironmentListMin, getProjectFilteredApps } from '../../services/service'
import { getChartGroups } from '../charts/charts.service'
import {
    DirectPermissionsRoleFilter,
    ChartGroupPermissionsFilter,
    ActionTypes,
    OptionType,
    CollapsedUserOrGroupProps,
    CreateGroup,
    CreateUser,
    DefaultUserKey,
    DefaultUserValue,
    Custom_Roles,
    EntityTypes,
    UserGroup,
} from './userGroups.types'
import { ACCESS_TYPE_MAP, DOCUMENTATION, HELM_APP_UNASSIGNED_PROJECT, Routes, SERVER_MODE } from '../../config'
import { ReactComponent as AddIcon } from '../../assets/icons/ic-add.svg'
import { ReactComponent as CloseIcon } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Lock } from '../../assets/icons/ic-locked.svg'
import Select, { components } from 'react-select'
import UserForm from './User'
import GroupForm from './Group'
import Tippy from '@tippyjs/react'
import EmptyImage from '../../assets/img/empty-applist@2x.png'
import EmptySearch from '../../assets/img/empty-noresult@2x.png'
import './UserGroup.scss'
import { mainContext } from '../common/navigation/NavigationRoutes'
import { groupHeaderStyle, GroupHeading, Option as singleOption } from '../v2/common/ReactSelect.utils'
import ApiTokens from '../apiTokens/ApiTokens.component'
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg'
import ExportToCsv from '../common/ExportToCsv/ExportToCsv'
import { FILE_NAMES, GROUP_EXPORT_HEADER_ROW, USER_EXPORT_HEADER_ROW } from '../common/ExportToCsv/constants'
import { getSSOConfigList } from '../login/login.service'
import {
    EMPTY_STATE_STATUS,
    SSO_NOT_CONFIGURED_STATE_TEXTS,
    USER_NOT_EDITABLE,
} from '../../config/constantMessaging'
import { getJobs } from '../Jobs/Service'
import { DEFAULT_ENV } from '../app/details/triggerView/Constants'
import { ADD_USER_EXPANDED_SEARCH_VALUE, EXPANDED_TILE_SEARCH_KEY } from './constants'

const ApproverPermission = importComponentFromFELibrary('ApproverPermission')
const AuthorizationGlobalConfigWrapper = importComponentFromFELibrary('AuthorizationGlobalConfigWrapper')
const PermissionGroupInfoBar = importComponentFromFELibrary('PermissionGroupInfoBar', noop, 'function')
const SSOLogin = lazy(() => import('../login/SSOLogin'))

const UserGroupContext = React.createContext<UserGroup>({
    appsList: new Map(),
    userGroupsList: [],
    environmentsList: [],
    projectsList: [],
    chartGroupsList: [],
    fetchAppList: () => {},
    superAdmin: false,
    roles: [],
    envClustersList: [],
    fetchAppListHelmApps: () => {},
    fetchJobsList: () => {},
    jobsList: new Map(),
    appsListHelmApps: new Map(),
    customRoles: {
        customRoles: [],
        possibleRolesMeta: {},
        possibleRolesMetaForHelm: {},
        possibleRolesMetaForCluster: {},
        possibleRolesMetaForJob: {},
    },
})

const tempMultiSelectStyles = {
    ...multiSelectStyles,
    ...groupHeaderStyle,
    menu: (base, state) => ({
        ...base,
        top: 'auto',
        width: '140%',
    }),
    dropdownIndicator: (base, state) => ({
        ...base,
        transition: 'all .2s ease',
        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    }),
}

export function useUserGroupContext() {
    const context = React.useContext(UserGroupContext)
    if (!context) {
        throw new Error(`User group context cannot be used outside user group page`)
    }
    return context
}

function HeaderSection(type: 'user' | 'group') {
    const isUserPermissions = type === 'user'

    return (
        <div data-testid={`${type}-auth-page-header`} className="auth-page__header pt-20">
            <h2 className="auth-page__header-title form__title">
                {isUserPermissions ? 'User permissions' : 'Permission groups'}
            </h2>
            <p className="form__subtitle">
                {isUserPermissions
                    ? "Manage your organization's users and their permissions."
                    : 'Permission groups allow you to easily manage user permissions by assigning desired permissions to a group and assigning these groups to users to provide all underlying permissions.'}
                &nbsp;
                <a
                    data-testid={`${type}-auth-page-learn-more-link`}
                    className="dc__link"
                    rel="noreferrer noopener"
                    href={isUserPermissions ? DOCUMENTATION.GLOBAL_CONFIG_USER : DOCUMENTATION.GLOBAL_CONFIG_GROUPS}
                    target="_blank"
                >
                    Learn more about {isUserPermissions ? 'User permissions' : 'Permission groups'}
                </a>
            </p>
        </div>
    )
}

export default function UserGroupRoute() {
    const { serverMode } = useContext(mainContext)
    const { url, path } = useRouteMatch()
    const [listsLoading, lists, listsError, reloadLists] = useAsync(
        () =>
            Promise.allSettled([
                getGroupList(),
                get(Routes.PROJECT_LIST),
                getEnvironmentListMin(),
                serverMode === SERVER_MODE.EA_ONLY ? null : getChartGroups(),
                getUserRole(),
                getEnvironmentListHelmApps(),
                getCustomRoles(),
            ]),
        [serverMode],
    )
    const [appsList, setAppsList] = useState(new Map())
    const [appsListHelmApps, setAppsListHelmApps] = useState(new Map())
    const [jobsList, setJobsList] = useState(new Map())
    // For handling the auto assign flow for enterprise
    const [isAutoAssignFlowEnabled, setIsAutoAssignFlowEnabled] = useState(false)

    useEffect(() => {
        if (!lists) return
        lists.forEach((list) => {
            if (list.status === 'rejected') {
                showError(list.reason, true, true)
            }
        })
    }, [lists])

    async function fetchJobsList(projectIds: number[]) {
        const missingProjects = projectIds.filter((projectId) => !jobsList.has(projectId))
        if (missingProjects.length === 0) return
        setJobsList((jobsList) => {
            return missingProjects.reduce((jobsList, projectId) => {
                jobsList.set(projectId, { loading: true, result: [], error: null })
                return jobsList
            }, jobsList)
        })
        try {
            const {
                result: { jobContainers },
            } = await getJobs({ teams: missingProjects })

            const jobs = [{ projectId: projectIds[0], jobsList: jobContainers }]
            const projectsMap = mapByKey(jobs || [], 'projectId')
            setJobsList(
                (jobsList) =>
                    new Map(
                        missingProjects.reduce((jobsList, projectId) => {
                            jobsList.set(projectId, {
                                loading: false,
                                result: projectsMap.has(+projectId) ? projectsMap.get(+projectId)?.jobsList || [] : [],
                                error: null,
                            })
                            return jobsList
                        }, jobsList),
                    ),
            )
        } catch (error) {
            showError(error)
            setJobsList((jobsList) => {
                return missingProjects.reduce((jobsList, projectId) => {
                    jobsList.set(projectId, { loading: false, result: [], error: null })
                    return jobsList
                }, jobsList)
            })
        }
    }

    async function fetchAppList(projectIds: number[]) {
        if (serverMode === SERVER_MODE.EA_ONLY) return
        const missingProjects = projectIds.filter((projectId) => !appsList.has(projectId))
        if (missingProjects.length === 0) return
        setAppsList((appList) => {
            return missingProjects.reduce((appList, projectId) => {
                appList.set(projectId, { loading: true, result: [], error: null })
                return appList
            }, appList)
        })
        try {
            const { result } = await getProjectFilteredApps(missingProjects, ACCESS_TYPE_MAP.DEVTRON_APPS)
            const projectsMap = mapByKey(result || [], 'projectId')
            setAppsList((appList) => {
                return new Map(
                    missingProjects.reduce((appList, projectId) => {
                        appList.set(projectId, {
                            loading: false,
                            result: projectsMap.has(+projectId) ? projectsMap.get(+projectId)?.appList || [] : [],
                            error: null,
                        })
                        return appList
                    }, appList),
                )
            })
        } catch (error) {
            showError(error)
            setAppsList((appList) => {
                return missingProjects.reduce((appList, projectId) => {
                    appList.set(projectId, { loading: false, result: [], error })
                    return appList
                }, appList)
            })
        }
    }

    async function fetchAppListHelmApps(projectIds: number[]) {
        const missingProjects = projectIds.filter((projectId) => !appsListHelmApps.has(projectId))
        if (missingProjects.length === 0) return
        setAppsListHelmApps((appListHelmApps) => {
            return missingProjects.reduce((appListHelmApps, projectId) => {
                appListHelmApps.set(projectId, { loading: true, result: [], error: null })
                return appListHelmApps
            }, appListHelmApps)
        })
        try {
            const { result } = await getProjectFilteredApps(missingProjects, ACCESS_TYPE_MAP.HELM_APPS)

            const projectsMap = mapByKey(result || [], 'projectId')
            setAppsListHelmApps((appListHelmApps) => {
                return new Map(
                    missingProjects.reduce((appListHelmApps, projectId) => {
                        appListHelmApps.set(projectId, {
                            loading: false,
                            result: projectsMap.has(+projectId) ? projectsMap.get(+projectId)?.appList || [] : [],
                            error: null,
                        })
                        return appListHelmApps
                    }, appListHelmApps),
                )
            })
        } catch (error) {
            showError(error)
            setAppsListHelmApps((appListHelmApps) => {
                return missingProjects.reduce((appList, projectId) => {
                    appListHelmApps.set(projectId, { loading: false, result: [], error })
                    return appListHelmApps
                }, appListHelmApps)
            })
        }
    }

    if (listsLoading) return <Progressing pageLoader />
    const [userGroups, projects, environments, chartGroups, userRole, envClustersList, customRolesList] = lists
    return (
        <div className="flex h-100">
            <div data-testid="auth-user-page" className="auth-page__body">
                <UserGroupContext.Provider
                    value={{
                        fetchAppList,
                        appsList,
                        userGroupsList: userGroups.status === 'fulfilled' ? userGroups?.value?.result : [],
                        environmentsList: environments?.status === 'fulfilled' ? environments?.value?.result : [],
                        projectsList: projects.status === 'fulfilled' ? projects?.value?.result : [],
                        chartGroupsList: chartGroups.status === 'fulfilled' ? chartGroups?.value?.result?.groups : [],
                        superAdmin: userRole.status === 'fulfilled' ? userRole?.value?.result?.superAdmin : false,
                        roles: userRole.status === 'fulfilled' ? userRole?.value?.result?.roles : [],
                        envClustersList: envClustersList.status === 'fulfilled' ? envClustersList?.value?.result : [],
                        fetchAppListHelmApps,
                        fetchJobsList,
                        jobsList,
                        appsListHelmApps,
                        customRoles: {
                            customRoles: customRolesList.status === 'fulfilled' ? customRolesList?.value?.result : [],
                            possibleRolesMeta: getMetaPossibleRoles(
                                customRolesList.status === 'fulfilled' ? customRolesList?.value?.result : [],
                                EntityTypes.DIRECT,
                                ACCESS_TYPE_MAP.DEVTRON_APPS,
                            ),
                            possibleRolesMetaForHelm: getMetaPossibleRoles(
                                customRolesList.status === 'fulfilled' ? customRolesList?.value?.result : [],
                                EntityTypes.DIRECT,
                                ACCESS_TYPE_MAP.HELM_APPS,
                            ),
                            possibleRolesMetaForCluster: getMetaPossibleRoles(
                                customRolesList.status === 'fulfilled' ? customRolesList?.value?.result : [],
                                EntityTypes.CLUSTER,
                            ),
                            possibleRolesMetaForJob: getMetaPossibleRoles(
                                customRolesList.status === 'fulfilled' ? customRolesList?.value?.result : [],
                                EntityTypes.JOB,
                            ),
                        },
                    }}
                >
                    <Switch>
                        <Route
                            path={`${path}/login-service`}
                            render={(props) => {
                                return <SSOLogin {...props} />
                            }}
                        />
                        <Route path={`${path}/users`}>
                            <ConditionalWrap
                                condition={!!AuthorizationGlobalConfigWrapper}
                                wrap={(children) => (
                                    <AuthorizationGlobalConfigWrapper
                                        setIsAutoAssignFlowEnabled={setIsAutoAssignFlowEnabled}
                                    >
                                        {children}
                                    </AuthorizationGlobalConfigWrapper>
                                )}
                            >
                                <UserGroupList
                                    type="user"
                                    reloadLists={reloadLists}
                                    renderHeaders={HeaderSection}
                                    isAutoAssignFlowEnabled={isAutoAssignFlowEnabled}
                                />
                            </ConditionalWrap>
                        </Route>
                        <Route path={`${path}/groups`}>
                            <ConditionalWrap
                                condition={!!AuthorizationGlobalConfigWrapper}
                                wrap={(children) => (
                                    <AuthorizationGlobalConfigWrapper
                                        setIsAutoAssignFlowEnabled={setIsAutoAssignFlowEnabled}
                                    >
                                        {children}
                                    </AuthorizationGlobalConfigWrapper>
                                )}
                            >
                                <UserGroupList
                                    type="group"
                                    reloadLists={reloadLists}
                                    renderHeaders={HeaderSection}
                                    isAutoAssignFlowEnabled={isAutoAssignFlowEnabled}
                                />
                            </ConditionalWrap>
                        </Route>
                        <Route path={`${path}/${Routes.API_TOKEN}`}>
                            <ApiTokens />
                        </Route>
                        <Redirect to={`${path}/users`} />
                    </Switch>
                </UserGroupContext.Provider>
            </div>
        </div>
    )
}

const UserGroupList: React.FC<{
    type: 'user' | 'group'
    reloadLists: () => void
    renderHeaders: (type: 'user' | 'group') => JSX.Element
    isAutoAssignFlowEnabled: boolean
}> = ({ type, reloadLists, renderHeaders, isAutoAssignFlowEnabled }) => {
    const [loading, data, error, reload, setState] = useAsync(type === 'user' ? getUserList : getGroupList, [type])
    const [fetchingSSOConfigList, ssoConfigListdata, , ,] = useAsync(getSSOConfigList, [type], type === 'user')
    const result = (data && data['result']) || []
    const isSSOConfigured = ssoConfigListdata?.result?.some((a) => a.active) || false
    const [searchString, setSearchString] = useState('')
    const searchRef = useRef(null)
    const keys = useKeyDown()
    const [addHash, setAddHash] = useState(null)
    const { roles, customRoles } = useUserGroupContext()

    const location = useLocation()
    const history = useHistory()
    const searchParams = new URLSearchParams(location.search)
    const expandedTile = searchParams.get(EXPANDED_TILE_SEARCH_KEY) || ''

    const updateCollapsedTile = (id?: string) => {
        if (id) {
            searchParams.set(EXPANDED_TILE_SEARCH_KEY, id)
        } else {
            searchParams.delete(EXPANDED_TILE_SEARCH_KEY)
        }
        history.replace({ search: searchParams.toString() })
    }

    useEffect(() => {
        switch (keys.join(',').toLowerCase()) {
            case 'control,f':
            case 'meta,f':
                searchRef.current.focus()
        }
    }, [keys])

    useEffect(() => {
        if (!error) return
        showError(error, true, true)
    }, [error])

    useEffectAfterMount(() => {
        if (type === 'user') {
            reloadLists()
        }
        if (type == 'group') {
            setSearchString('')
        }
    }, [type])

    useEffect(() => {
        if (loading) return
        if (!result || result.length === 0) {
            // do not show add item, empty placeholder visible
            setAddHash(null)
        } else {
            const randomString = getRandomString()
            setAddHash(randomString)
        }
    }, [result.length, loading])

    const updateCallback = useCallback(
        (id: CreateUser['id'], payload) => {
            const newResult = [...result]
            const index = result.findIndex((userOrGroup) => userOrGroup.id === id)
            newResult[index] = payload
            setState((state) => ({ ...state, result: newResult }))
        },
        [result.length],
    )

    const deleteCallback = useCallback(
        (id: CreateUser['id']) => {
            setState((state) => ({ ...state, result: result.filter((userOrGroup) => userOrGroup.id !== id) }))
        },
        [result.length],
    )

    const createCallback = useCallback(
        (payload) => {
            if (type === 'user') {
                reloadLists()
            } else {
                if (Array.isArray(payload)) {
                    setState((state) => {
                        return { ...state, result: [...payload, ...state.result] }
                    })
                } else {
                    setState((state) => {
                        return { ...state, result: [payload, ...state.result] }
                    })
                }
            }
        },
        [result.length],
    )

    function addNewEntry() {
        setAddHash(getRandomString())
    }

    function cancelCallback(e) {
        if (result.length === 0) {
            setAddHash(null)
        } else {
            setAddHash(getRandomString())
        }
        updateCollapsedTile()
    }

    function processUsersDataToExport(result: CreateUser[]) {
        const _usersList = []
        for (const [idx, _user] of result.entries()) {
            const _userData = {
                emailId: _user.email_id,
                userId: _user.id,
                superAdmin: _user.superAdmin,
                groups: '-',
                project: '-',
                environment: '-',
                application: '-',
                role: '-',
            }

            if (_user.groups?.length && !_user.superAdmin) {
                _userData.groups = _user.groups.join(', ')
                _usersList.push(_userData)
            }

            if (_user.roleFilters?.length) {
                for (const _roleFilter of _user.roleFilters) {
                    if (_roleFilter.team && _roleFilter.accessType !== ACCESS_TYPE_MAP.HELM_APPS) {
                        const _userPermissions = {
                            ..._userData,
                            groups: '-',
                        }

                        _userPermissions.project = _roleFilter.team
                        _userPermissions.environment =
                            _roleFilter.environment?.split(',').join(', ') || 'All existing + future environments'
                        _userPermissions.application =
                            _roleFilter.entityName?.split(',').join(', ') || 'All existing + future applications'
                        _userPermissions.role = customRoles.possibleRolesMeta[_roleFilter.action]?.value || '-'

                        _usersList.push(_userPermissions)
                    }
                }
            } else {
                _usersList.push(_userData)
            }

            if (idx !== result.length - 1) {
                _usersList.push({})
                _usersList.push(USER_EXPORT_HEADER_ROW)
            }
        }

        return _usersList
    }

    function processGroupsDataToExport(result: CreateGroup[]) {
        const _groupsList = []
        for (const [idx, _group] of result.entries()) {
            const _groupData = {
                groupName: _group.name,
                groupId: _group.id,
                description: _group.description || '-',
                project: '-',
                environment: '-',
                application: '-',
                role: '-',
            }

            if (_group.roleFilters?.length) {
                for (const _roleFilter of _group.roleFilters) {
                    if (_roleFilter.team && _roleFilter.accessType !== ACCESS_TYPE_MAP.HELM_APPS) {
                        const _groupPermissions = {
                            ..._groupData,
                        }

                        _groupPermissions.project = _roleFilter.team
                        _groupPermissions.environment =
                            _roleFilter.environment?.split(',').join(', ') || 'All existing + future environments'
                        _groupPermissions.application =
                            _roleFilter.entityName?.split(',').join(', ') || 'All existing + future applications'
                        _groupPermissions.role = customRoles.possibleRolesMeta[_roleFilter.action]?.value || '-'

                        _groupsList.push(_groupPermissions)
                    }
                }
            } else {
                _groupsList.push(_groupData)
            }

            if (idx !== result.length - 1) {
                _groupsList.push({})
                _groupsList.push(GROUP_EXPORT_HEADER_ROW)
            }
        }

        return _groupsList
    }

    function getPermissionsDataToExport() {
        const getPermissionsAPI = type === 'user' ? getUsersDataToExport : getGroupsDataToExport

        return getPermissionsAPI().then((response) => {
            if (response?.result) {
                return type === 'user'
                    ? processUsersDataToExport(
                          sortObjectArrayAlphabetically(response.result, 'email_id') as CreateUser[],
                      )
                    : processGroupsDataToExport(sortObjectArrayAlphabetically(response.result, 'name') as CreateGroup[])
            }

            return []
        })
    }

    if (loading || fetchingSSOConfigList) {
        return (
            <div data-testid={`${type}-permission-page-loading`} className="w-100 flex mh-600">
                <Progressing pageLoader />
            </div>
        )
    } else if (error && (error.code === 403 || error.code === 401)) {
        return (
            <ErrorScreenNotAuthorized
                subtitle={ERROR_EMPTY_SCREEN.REQUIRED_MANAGER_ACCESS}
                title={TOAST_ACCESS_DENIED.TITLE}
            />
        )
    } else if (!addHash) {
        return type === 'user' ? <NoUsers onClick={addNewEntry} /> : <NoGroups onClick={addNewEntry} />
    } else if (type === 'user' && !isSSOConfigured) {
        return <SSONotConfiguredState />
    } else {
        const filteredAndSorted = result.filter(
            (userOrGroup) =>
                userOrGroup.name?.toLowerCase()?.includes(searchString?.toLowerCase()) ||
                userOrGroup.email_id?.toLowerCase()?.includes(searchString?.toLowerCase()) ||
                userOrGroup.description?.toLowerCase()?.includes(searchString?.toLowerCase()),
        )
        return (
            <div
                id="auth-page__body"
                data-testid={`auth-${type}-page`}
                className="auth-page__body-users__list-container"
            >
                {renderHeaders(type)}
                {type === 'group' && isAutoAssignFlowEnabled && <PermissionGroupInfoBar />}
                {result.length > 0 && (
                    <div className="flex dc__content-space">
                        <div className="search dc__position-rel en-2 bw-1 br-4 mb-16 bcn-0">
                            <Search className="search__icon icon-dim-18" />
                            <input
                                value={searchString}
                                autoComplete="off"
                                ref={searchRef}
                                type="search"
                                placeholder={`Search ${type}`}
                                data-testid={`${type}-search-box-input`}
                                className="search__input bcn-0"
                                onChange={(e) => setSearchString(e.target.value)}
                            />
                        </div>
                        {roles?.indexOf('role:super-admin___') !== -1 && (
                            <ExportToCsv
                                className="mb-16"
                                apiPromise={getPermissionsDataToExport}
                                fileName={type === 'user' ? FILE_NAMES.Users : FILE_NAMES.Groups}
                            />
                        )}
                    </div>
                )}
                {!(filteredAndSorted.length === 0 && result.length > 0) && (
                    <AddUser
                        cancelCallback={cancelCallback}
                        key={addHash}
                        text={`Add ${type}`}
                        type={type}
                        collapsed={expandedTile !== ADD_USER_EXPANDED_SEARCH_VALUE && result?.length !== 0}
                        setCollapsed={updateCollapsedTile}
                        {...{ createCallback, updateCallback, deleteCallback }}
                        isAutoAssignFlowEnabled={isAutoAssignFlowEnabled}
                    />
                )}
                {filteredAndSorted.map((data) => (
                    <CollapsedUserOrGroup
                        key={data.id}
                        {...data}
                        type={type}
                        {...{ updateCallback, deleteCallback, createCallback }}
                        isAutoAssignFlowEnabled={isAutoAssignFlowEnabled}
                        collapsed={expandedTile !== String(data.id)}
                        setCollapsed={updateCollapsedTile}
                    />
                ))}
                {filteredAndSorted.length === 0 && result.length > 0 && (
                    <SearchEmpty searchString={searchString} setSearchString={setSearchString} />
                )}
            </div>
        )
    }
}

const CollapsedUserOrGroup: React.FC<CollapsedUserOrGroupProps> = ({
    email_id = null,
    id = null,
    name = null,
    description = null,
    type,
    updateCallback,
    deleteCallback,
    createCallback,
    isAutoAssignFlowEnabled,
    collapsed,
    setCollapsed,
}) => {
    const [dataLoading, data, dataError, reloadData, setData] = useAsync(
        type === 'group' ? () => getGroupId(id) : () => getUserId(id),
        [id, type],
        !collapsed,
    )
    const isAdminOrSystemUser = email_id === DefaultUserKey.ADMIN || email_id === DefaultUserKey.SYSTEM

    useEffect(() => {
        if (!dataError) return
        setCollapsed()
        showError(dataError)
    }, [dataError])

    function cancelCallback(e) {
        setCollapsed(collapsed ? String(id) : undefined)
    }

    function updateCallbackOverride(id, data) {
        setData((state) => ({ ...state, result: data }))
        updateCallback(id, data)
    }

    function getToolTipContent(user: string): string {
        let userName: string
        if (user === DefaultUserKey.ADMIN || user === DefaultUserKey.SYSTEM) {
            userName = DefaultUserValue[user]
        }
        if (userName) {
            return `${userName} ${USER_NOT_EDITABLE}`
        }
        return ''
    }

    const onClickUserDropdownHandler = () => {
        if (isAdminOrSystemUser) {
            noop()
        } else {
            setCollapsed(collapsed ? String(id) : undefined)
        }
    }

    return (
        <article className={`user-list ${collapsed ? 'user-list--collapsed' : ''} flex column left`}>
            <div className="user-list__header w-100">
                <span className="user-list__alphabet" style={{ backgroundColor: getRandomColor(email_id || name) }}>
                    {email_id ? email_id[0] : name[0]}
                </span>
                <span className="user-list__email-name flex left column">
                    <span data-testid={`${type}-display-name-list`} className="user-list__title">
                        {name || email_id}
                    </span>
                    <span className="user-list__subtitle">{description || email_id}</span>
                </span>
                <span
                    data-testid={`${type}-list-${collapsed ? 'expand' : 'collapse'}-dropdown`}
                    className="user-list__direction-container flex rotate pointer"
                    onClick={onClickUserDropdownHandler}
                    style={{ ['--rotateBy' as any]: collapsed ? '0deg' : '180deg' }}
                >
                    <ConditionalWrap
                        condition={isAdminOrSystemUser}
                        wrap={(children) => (
                            <Tippy
                                className="default-tt"
                                arrow={false}
                                placement="top"
                                content={getToolTipContent(email_id)}
                            >
                                <div className="flex">{children}</div>
                            </Tippy>
                        )}
                    >
                        {isAdminOrSystemUser ? (
                            <Lock />
                        ) : dataLoading ? (
                            <Progressing />
                        ) : (
                            <NavigationArrow className="arrow-svg" />
                        )}
                    </ConditionalWrap>
                </span>
            </div>
            {!collapsed && data && !dataLoading && (
                <div className="user-list__form w-100">
                    {type === 'user' ? (
                        <UserForm
                            id={id}
                            userData={data.result}
                            {...{
                                updateCallback: updateCallbackOverride,
                                deleteCallback,
                                createCallback,
                                cancelCallback,
                            }}
                            isAutoAssignFlowEnabled={isAutoAssignFlowEnabled}
                        />
                    ) : (
                        <GroupForm
                            id={id}
                            groupData={data.result}
                            {...{
                                updateCallback: updateCallbackOverride,
                                deleteCallback,
                                createCallback,
                                cancelCallback,
                            }}
                        />
                    )}
                </div>
            )}
        </article>
    )
}

interface AddUser {
    text: string
    type: 'user' | 'group'
    updateCallback: (...args) => void
    deleteCallback: (...args) => void
    createCallback: (...args) => void
    cancelCallback: (...args) => void
    collapsed: boolean
    setCollapsed: (id?: string) => void
    isAutoAssignFlowEnabled: boolean
}
const AddUser: React.FC<AddUser> = ({
    text = '',
    type = '',
    updateCallback,
    deleteCallback,
    createCallback,
    cancelCallback,
    collapsed,
    setCollapsed,
    isAutoAssignFlowEnabled,
}) => {
    return (
        <article className={`user-list flex column left ${collapsed ? 'user-list--collapsed' : ''} user-list--add`}>
            <div
                className={`${collapsed ? 'pointer' : ''} user-list__header user-list__header  w-100`}
                data-testid={collapsed ? `add-${type}-button` : ''}
                onClick={!collapsed ? noop : () => setCollapsed(ADD_USER_EXPANDED_SEARCH_VALUE)}
            >
                {collapsed && <AddIcon className="add-svg mr-16" />}
                <span className="user-list__email-name flex left column">
                    <span className={`${collapsed ? 'anchor' : ''} fw-6`} style={{ fontSize: '14px' }}>
                        {text}
                    </span>
                    <small></small>
                </span>
                <span className="user-list__direction-container flex"></span>
            </div>
            {!collapsed && (
                <div className="user-list__form w-100">
                    {type === 'user' ? (
                        <UserForm
                            id={null}
                            {...{ updateCallback, deleteCallback, createCallback, cancelCallback }}
                            isAutoAssignFlowEnabled={isAutoAssignFlowEnabled}
                        />
                    ) : (
                        <GroupForm
                            id={null}
                            {...{ updateCallback, deleteCallback, createCallback, cancelCallback }}
                        />
                    )}
                </div>
            )}
        </article>
    )
}

const allApplicationsOption = (entity) => ({
    label: entity === EntityTypes.JOB ? 'All Jobs' : 'All applications',
    value: '*',
})

const allEnvironmentsOption = {
    label: 'All environments',
    value: '*',
}

export const APPROVER_ACTION = { label: 'approver', value: 'approver' }
export const CONFIG_APPROVER_ACTION = { label: 'configApprover', value: 'configApprover' }

interface DirectPermissionRow {
    permission: DirectPermissionsRoleFilter
    handleDirectPermissionChange: (...rest) => void
    index: number
    removeRow: (index: number) => void
}

export const DirectPermission: React.FC<DirectPermissionRow> = ({
    permission,
    handleDirectPermissionChange,
    index,
    removeRow,
}) => {
    const { environmentsList, projectsList, appsList, envClustersList, appsListHelmApps, customRoles, jobsList } =
        useUserGroupContext()
    const projectId =
        permission.team && permission.team.value !== HELM_APP_UNASSIGNED_PROJECT
            ? projectsList.find((project) => project.name === permission.team.value)?.id
            : null
    const multiRole = permission.action.value.split(',')
    const configApproverRoleIndex = multiRole.indexOf(CONFIG_APPROVER_ACTION.value)
    const primaryActionRoleIndex = configApproverRoleIndex === 0 ? 1 : 0
    const primaryActionRole = {
        label: multiRole[primaryActionRoleIndex],
        value: multiRole[primaryActionRoleIndex],
        configApprover: multiRole[configApproverRoleIndex]
            ? !!multiRole[configApproverRoleIndex]
            : permission.action.configApprover,
    }

    const [possibleRoles, setPossibleRoles] = useState([])
    const [openMenu, changeOpenMenu] = useState<
        'entityName/apps' | 'entityName/jobs' | 'environment' | 'workflow' | ''
    >('')
    const [environments, setEnvironments] = useState([])
    const [applications, setApplications] = useState([])
    const [envClusters, setEnvClusters] = useState([])
    const [projectInput, setProjectInput] = useState('')
    const [clusterInput, setClusterInput] = useState('')
    const [envInput, setEnvInput] = useState('')
    const [appInput, setAppInput] = useState('')
    const [workflowInput, setWorkflowInput] = useState('')
    const [workflowList, setWorkflowList] = useState({ loading: false, options: [] })

    const abortControllerRef = useRef<AbortController>(new AbortController())

    const RoleValueContainer = ({
        children,
        getValue,
        clearValue,
        cx,
        getStyles,
        hasValue,
        isMulti,
        options,
        selectOption,
        selectProps,
        setValue,
        isDisabled,
        isRtl,
        theme,
        ...props
    }) => {
        const [{ value }] = getValue()
        return (
            <components.ValueContainer
                {...{
                    getValue,
                    clearValue,
                    cx,
                    getStyles,
                    hasValue,
                    isMulti,
                    options,
                    selectOption,
                    selectProps,
                    setValue,
                    isDisabled,
                    isRtl,
                    theme,
                    ...props,
                }}
            >
                {value === '*'
                    ? 'Admin'
                    : permission.accessType === ACCESS_TYPE_MAP.HELM_APPS
                    ? customRoles.possibleRolesMetaForHelm[value].value
                    : permission.entity === EntityTypes.JOB
                    ? customRoles.possibleRolesMetaForJob[value].value
                    : customRoles.possibleRolesMeta[value].value}
                {ApproverPermission && (permission.approver || primaryActionRole.configApprover) && ', Approver'}
                {React.cloneElement(children[1])}
            </components.ValueContainer>
        )
    }

    const RoleMenuList = (props) => {
        return (
            <components.MenuList {...props}>
                {props.children}
                {ApproverPermission && permission.accessType === ACCESS_TYPE_MAP.DEVTRON_APPS && (
                    <ApproverPermission
                        optionProps={props}
                        approver={permission.approver}
                        configApprover={primaryActionRole.configApprover}
                        handleDirectPermissionChange={(...rest: any[]) => {
                            props.selectOption(props.selectProps.value)
                            handleDirectPermissionChange(...rest)
                        }}
                        formatOptionLabel={formatOptionLabel}
                    />
                )}
            </components.MenuList>
        )
    }

    useEffect(() => {
        let envOptions = createClusterEnvGroup(
            environmentsList,
            'cluster_name',
            'environment_name',
            'environmentIdentifier',
        )

        if (permission.entity === EntityTypes.JOB) {
            const deafultEnv = {
                label: '',
                options: [
                    {
                        label: DEFAULT_ENV,
                        value: DEFAULT_ENV,
                    },
                ],
            }
            const filteredEnvOptions = envOptions.filter((envOptions) => {
                const filteredOptions = envOptions.options.filter((option) => option.isClusterCdActive)
                if (filteredOptions.length > 0) {
                    envOptions.options = filteredOptions
                }
                return filteredOptions.length > 0
            })
            setEnvironments([deafultEnv, ...filteredEnvOptions])
        } else {
            setEnvironments(envOptions)
        }
    }, [environmentsList])

    useEffect(() => {
        const customRoleOptions = customRoles.customRoles.map((role) => ({
            label: role.roleDisplayName,
            value: role.roleName,
            description: role.roleDescription,
            entity: role.entity,
            accessType: role.accessType,
        }))
        setPossibleRoles(customRoleOptions)
    }, [customRoles])

    useEffect(() => {
        const envOptions = envClustersList?.map((cluster) => ({
            label: cluster.clusterName,
            options: [
                {
                    label: 'All existing + future environments in ' + cluster.clusterName,
                    value: '#' + cluster.clusterName,
                    namespace: '',
                    clusterName: '',
                },
                {
                    label: 'All existing environments in ' + cluster.clusterName,
                    value: '*' + cluster.clusterName,
                    namespace: '',
                    clusterName: '',
                },
                ...cluster.environments?.map((env) => ({
                    label: env.environmentName,
                    value: env.environmentIdentifier,
                    namespace: env.namespace,
                    clusterName: cluster.clusterName,
                })),
            ],
            isVirtualEnvironment: cluster?.isVirtualCluster,
        }))

        setEnvClusters(envOptions)
    }, [envClustersList])
    useEffect(() => {
        const isJobs = permission.entity === EntityTypes.JOB
        const appOptions = (
            (projectId &&
                (permission.accessType === ACCESS_TYPE_MAP.DEVTRON_APPS
                    ? appsList
                    : isJobs
                    ? jobsList
                    : appsListHelmApps
                ).get(projectId)?.result) ||
            []
        )?.map((app) => ({
            label: isJobs ? app.jobName : app.name,
            value: isJobs ? app.appName : app.name,
        }))
        setApplications(appOptions)
        if (permission.entity === EntityTypes.JOB && permission.entityName.length > 0) {
            setWorkflowsForJobs(permission)
        }
    }, [appsList, appsListHelmApps, projectId, jobsList])

    useEffect(() => {
        if (openMenu || !projectId) return
        if ((environments && environments.length === 0) || applications.length === 0) {
            return
        }
        setApplications((applications) => {
            const sortedApplications =
                openMenu === 'entityName/apps' || openMenu === 'entityName/jobs'
                    ? applications
                    : sortBySelected(permission.entityName, applications, 'value')
            return sortedApplications
        })
    }, [openMenu, permission.environment, permission.entityName, projectId])

    const setWorkflowsForJobs = async (perimssion) => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            abortControllerRef.current = null
        }
        abortControllerRef.current = new AbortController()
        setWorkflowList({ loading: true, options: [] })
        try {
            setWorkflowList({ loading: true, options: [] })
            const jobNames = perimssion.entityName.filter((option) => option.value != '*').map((app) => app.label)
            const {
                result: { appIdWorkflowNamesMapping },
            } = await getAllWorkflowsForAppNames(jobNames, abortControllerRef.current.signal)
            const workflowOptions = []
            for (const jobName in appIdWorkflowNamesMapping) {
                workflowOptions.push({
                    label: jobName,
                    options: appIdWorkflowNamesMapping[jobName].map((workflow) => ({
                        label: workflow,
                        value: workflow,
                    })),
                })
            }
            abortControllerRef.current = null
            setWorkflowList({ loading: false, options: workflowOptions })
        } catch (err: any) {
            if (err.errors && err.errors[0].code != 0) showError(err)
            setWorkflowList({ loading: false, options: [] })
        }
    }

    function formatOptionLabel({ value, label }) {
        return (
            <div className="flex left column">
                <span>
                    {
                        (permission.accessType === ACCESS_TYPE_MAP.HELM_APPS
                            ? customRoles.possibleRolesMetaForHelm
                            : permission.accessType === ACCESS_TYPE_MAP.JOBS
                            ? customRoles.possibleRolesMetaForJob
                            : customRoles.possibleRolesMeta)[value]?.value
                    }
                </span>
                <small className="light-color">
                    {
                        (permission.accessType === ACCESS_TYPE_MAP.HELM_APPS
                            ? customRoles.possibleRolesMetaForHelm
                            : permission.accessType === ACCESS_TYPE_MAP.JOBS
                            ? customRoles.possibleRolesMetaForJob
                            : customRoles.possibleRolesMeta)[value]?.description
                    }
                </small>
            </div>
        )
    }

    function formatOptionLabelClusterEnv(option, { inputValue }) {
        return (
            <div
                className={
                    'flex left column ' +
                    (option.value &&
                        (option.value.startsWith('#') || option.value.startsWith('*')) &&
                        'cluster-label-all')
                }
            >
                {!inputValue ? (
                    <>
                        <span>{option.label}</span>
                        <small className={permission.accessType === ACCESS_TYPE_MAP.HELM_APPS && 'light-color'}>
                            {option.clusterName +
                                (option.clusterName && option.namespace ? '/' : '') +
                                (option.namespace || '')}
                        </small>
                    </>
                ) : (
                    <>
                        <span
                            dangerouslySetInnerHTML={{
                                __html: option.label.replace(
                                    new RegExp(inputValue, 'gi'),
                                    (highlighted) => `<mark>${highlighted}</mark>`,
                                ),
                            }}
                        />
                        {option.clusterName && option.namespace && (
                            <small
                                className={permission.accessType === ACCESS_TYPE_MAP.HELM_APPS && 'light-color'}
                                dangerouslySetInnerHTML={{
                                    __html: (option.clusterName + '/' + option.namespace).replace(
                                        new RegExp(inputValue, 'gi'),
                                        (highlighted) => `<mark>${highlighted}</mark>`,
                                    ),
                                }}
                            ></small>
                        )}
                    </>
                )}
            </div>
        )
    }

    function formatOptionLabelProject(option) {
        return (
            <div className="flex left column">
                <span>{option.label}</span>
                {permission.accessType === ACCESS_TYPE_MAP.HELM_APPS && option.value === HELM_APP_UNASSIGNED_PROJECT && (
                    <>
                        <small className="light-color">Apps without an assigned project</small>
                        <div className="unassigned-project-border"></div>
                    </>
                )}
            </div>
        )
    }

    function customFilter(option, searchText) {
        if (
            option.data.label?.toLowerCase().includes(searchText?.toLowerCase()) ||
            option.data.clusterName?.toLowerCase().includes(searchText?.toLowerCase()) ||
            option.data.namespace?.toLowerCase().includes(searchText?.toLowerCase())
        ) {
            return true
        } else {
            return false
        }
    }

    function onFocus(name: 'entityName/apps' | 'entityName/jobs' | 'environment' | 'workflow') {
        changeOpenMenu(name)
    }

    function onMenuClose() {
        changeOpenMenu('')
    }
    return (
        <React.Fragment>
            <Select
                value={permission.team}
                name="team"
                isMulti={false}
                placeholder="Select project"
                options={(permission.accessType === ACCESS_TYPE_MAP.HELM_APPS
                    ? [{ name: HELM_APP_UNASSIGNED_PROJECT }, ...(projectsList || [])]
                    : projectsList
                )?.map((project) => ({ label: project.name, value: project.name }))}
                className="basic-multi-select"
                classNamePrefix="select-project-dropdown"
                onChange={handleDirectPermissionChange}
                components={{
                    ClearIndicator: null,
                    IndicatorSeparator: null,
                    Option: singleOption,
                    ValueContainer: projectValueContainer,
                }}
                menuPlacement="auto"
                styles={{
                    ...tempMultiSelectStyles,
                    control: (base, state) => ({
                        ...base,
                        border: state.isFocused ? '1px solid #06c' : '1px solid #d6dbdf',
                        boxShadow: 'none',
                    }),
                    valueContainer: (base, state) => ({
                        ...base,
                        display: 'flex',
                    }),
                }}
                formatOptionLabel={formatOptionLabelProject}
                inputValue={projectInput}
                onBlur={() => {
                    setProjectInput('')
                }}
                onInputChange={(value, action) => {
                    if (action.action === 'input-change') setProjectInput(value)
                }}
            />
            {permission.accessType === ACCESS_TYPE_MAP.HELM_APPS ? (
                <div>
                    <Select
                        value={permission.environment}
                        isMulti
                        closeMenuOnSelect={false}
                        name="environment"
                        onFocus={() => onFocus('environment')}
                        onMenuClose={onMenuClose}
                        placeholder="Select environments"
                        options={envClusters}
                        formatOptionLabel={formatOptionLabelClusterEnv}
                        filterOption={customFilter}
                        className="basic-multi-select cluster-select"
                        classNamePrefix="select-helm-app-environment-dropdown"
                        hideSelectedOptions={false}
                        menuPlacement="auto"
                        styles={{
                            ...tempMultiSelectStyles,
                            option: (base, state) => ({
                                ...base,
                                padding: '4px 12px',
                                backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
                                color: 'var(--N900)',
                            }),
                        }}
                        components={{
                            ClearIndicator: null,
                            ValueContainer: clusterValueContainer,
                            IndicatorSeparator: null,
                            Option,
                            GroupHeading,
                        }}
                        isDisabled={!permission.team}
                        onChange={handleDirectPermissionChange}
                        blurInputOnSelect={false}
                        inputValue={clusterInput}
                        onBlur={() => {
                            setClusterInput('')
                        }}
                        onInputChange={(value, action) => {
                            if (action.action === 'input-change') setClusterInput(value)
                        }}
                    />
                    {permission.environmentError && <span className="form__error">{permission.environmentError}</span>}
                </div>
            ) : (
                <div style={{ order: permission.accessType === '' ? 3 : 0 }}>
                    <Select
                        value={permission.environment}
                        isMulti
                        closeMenuOnSelect={false}
                        name="environment"
                        onFocus={() => onFocus('environment')}
                        onMenuClose={onMenuClose}
                        placeholder="Select environments"
                        options={[{ label: '', options: [allEnvironmentsOption] }, ...environments]}
                        className="basic-multi-select"
                        menuPlacement="auto"
                        classNamePrefix="select-devtron-app-environment-dropdown"
                        hideSelectedOptions={false}
                        styles={tempMultiSelectStyles}
                        components={{
                            ClearIndicator: null,
                            ValueContainer,
                            IndicatorSeparator: null,
                            Option,
                            GroupHeading,
                        }}
                        isDisabled={!permission.team}
                        onChange={handleDirectPermissionChange}
                        inputValue={envInput}
                        onBlur={() => {
                            setEnvInput('')
                        }}
                        onInputChange={(value, action) => {
                            if (action.action === 'input-change') setEnvInput(value)
                        }}
                    />
                    {permission.environmentError && <span className="form__error">{permission.environmentError}</span>}
                </div>
            )}
            <div style={{ order: permission.accessType === '' ? 1 : 0 }}>
                <Select
                    value={permission.entityName}
                    isMulti
                    components={{
                        ClearIndicator: null,
                        ValueContainer,
                        IndicatorSeparator: null,
                        Option: (props) => <AppOption props={props} permission={permission} />,
                        GroupHeading,
                    }}
                    isLoading={
                        projectId
                            ? (permission.accessType === ACCESS_TYPE_MAP.DEVTRON_APPS
                                  ? appsList
                                  : permission.entity === EntityTypes.JOB
                                  ? jobsList
                                  : appsListHelmApps
                              ).get(projectId)?.loading
                            : false
                    }
                    isDisabled={!permission.team}
                    styles={tempMultiSelectStyles}
                    closeMenuOnSelect={false}
                    name={`entityName/${permission.entity}`}
                    onFocus={() => onFocus(`entityName/${permission.entity}`)}
                    onMenuClose={onMenuClose}
                    placeholder={permission.accessType === '' ? 'Select Job' : 'Select applications'}
                    options={[allApplicationsOption(permission.entity), ...applications]}
                    className="basic-multi-select"
                    classNamePrefix="select-application-dropdown"
                    onChange={(value, actionMeta) => {
                        handleDirectPermissionChange(value, actionMeta)
                    }}
                    hideSelectedOptions={false}
                    inputValue={appInput}
                    menuPlacement="auto"
                    onBlur={(e) => {
                        setAppInput('') //send selected options to setWorkflowsForJobs function
                        if (permission.entity === EntityTypes.JOB && !jobsList.get(projectId)?.loading)
                            setWorkflowsForJobs(permission)
                    }}
                    onInputChange={(value, action) => {
                        if (action.action === 'input-change') setAppInput(value)
                    }}
                />
                {permission.entityNameError && <span className="form__error">{permission.entityNameError}</span>}
            </div>
            {permission.entity === EntityTypes.JOB && (
                <div style={{ order: 2 }}>
                    <Select
                        value={permission.workflow}
                        isMulti
                        closeMenuOnSelect={false}
                        name="workflow"
                        onFocus={() => onFocus('workflow')}
                        onMenuClose={onMenuClose}
                        placeholder="Select workflow"
                        options={[
                            { label: '', options: [{ label: 'All Workflows', value: '*' }] },
                            ...workflowList.options,
                        ]}
                        className="basic-multi-select"
                        menuPlacement="auto"
                        classNamePrefix="select-devtron-app-workflow-dropdown"
                        hideSelectedOptions={false}
                        styles={tempMultiSelectStyles}
                        isLoading={workflowList.loading}
                        components={{
                            ClearIndicator: null,
                            ValueContainer,
                            IndicatorSeparator: null,
                            Option,
                            GroupHeading: workflowGroupHeading,
                        }}
                        isDisabled={!permission.team}
                        onChange={(value, actionMeta) => {
                            handleDirectPermissionChange(value, actionMeta, workflowList)
                        }}
                        inputValue={workflowInput}
                        onBlur={() => {
                            setWorkflowInput('')
                        }}
                        onInputChange={(value, action) => {
                            if (action.action === 'input-change') setWorkflowInput(value)
                        }}
                    />
                    {permission.workflowError && <span className="form__error">{permission.workflowError}</span>}
                </div>
            )}
            <div style={{ order: permission.accessType === '' ? 4 : 0 }}>
                <Select
                    value={primaryActionRole}
                    name="action"
                    placeholder="Select role"
                    options={ParseData(possibleRoles, permission.entity, permission.accessType)}
                    className="basic-multi-select"
                    classNamePrefix="select-user-role-dropdown"
                    formatOptionLabel={formatOptionLabel}
                    onChange={handleDirectPermissionChange}
                    isDisabled={!permission.team}
                    menuPlacement="auto"
                    blurInputOnSelect={true}
                    styles={{
                        ...tempMultiSelectStyles,
                        option: (base, state) => ({
                            ...base,
                            borderRadius: '4px',
                            color: state.isSelected ? 'var(--B500)' : 'var(--N900)',
                            backgroundColor: state.isSelected
                                ? 'var(--B100)'
                                : state.isFocused
                                ? 'var(--N100)'
                                : 'white',
                            fontWeight: state.isSelected ? 600 : 'normal',
                            cursor: state.isDisabled ? 'not-allowed' : 'pointer',
                            marginRight: '8px',
                        }),
                        valueContainer: (base, state) => ({
                            ...base,
                            display: 'flex',
                            flexWrap: 'nowrap',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                        }),
                    }}
                    components={{
                        ClearIndicator: null,
                        IndicatorSeparator: null,
                        ValueContainer: RoleValueContainer,
                        MenuList: RoleMenuList,
                    }}
                />
            </div>
            <CloseIcon className="pointer margin-top-6px" onClick={(e) => removeRow(index)} style={{ order: 5 }} />
        </React.Fragment>
    )
}
const workflowGroupHeading = (props) => {
    return <GroupHeading {...props} hideClusterName={true} />
}

const AppOption = ({ props, permission }) => {
    const { selectOption, data } = props
    return (
        <div
            onClick={(e) => selectOption(data)}
            className="flex left pl-12"
            style={{ background: props.isFocused ? 'var(--N100)' : 'transparent' }}
        >
            <input
                checked={props.isSelected}
                type="checkbox"
                style={{ height: '16px', width: '16px', flex: '0 0 16px' }}
            />
            <div className="flex left column w-100">
                <components.Option className="w-100 option-label-padding" {...props} />
                {data.value === '*' && (
                    <span className="fs-12 cn-6 ml-8 mb-4 mr-4">
                        {`Allow access to existing and new ${
                            permission.entity === EntityTypes.JOB ? 'jobs' : 'apps'
                        } for this project`}
                    </span>
                )}
            </div>
        </div>
    )
}

interface ChartPermissionRow {
    chartPermission: ChartGroupPermissionsFilter
    setChartPermission: any
    hideInfoLegend?: boolean
}

export const ChartPermission: React.FC<ChartPermissionRow> = React.memo(
    ({ chartPermission, setChartPermission, hideInfoLegend }) => {
        const { chartGroupsList } = useUserGroupContext()
        function handleChartCreateChange(event) {
            if (event.target.checked) {
                // set admin
                setChartPermission((chartPermission) => ({
                    ...chartPermission,
                    action: ActionTypes.ADMIN,
                    entityName: [],
                }))
            } else {
                // set view or update
                setChartPermission((chartPermission) => ({
                    ...chartPermission,
                    action: ActionTypes.VIEW,
                    entityName: [],
                }))
            }
        }

        function handleChartEditChange(selected, actionMeta) {
            const { label, value } = selected
            if (value === 'Deny') {
                setChartPermission((chartPermission) => ({
                    ...chartPermission,
                    action: ActionTypes.VIEW,
                    entityName: [],
                }))
            } else {
                setChartPermission((chartPermission) => ({
                    ...chartPermission,
                    action: ActionTypes.UPDATE,
                    entityName: [],
                }))
            }
        }

        const chartGroupEditOptions: OptionType[] = useMemo(() => {
            if (chartPermission.action === ActionTypes.ADMIN) {
                return [{ label: 'All Chart Groups', value: 'All charts' }]
            } else {
                return [
                    { label: 'Deny', value: 'Deny' },
                    { label: 'Specific Chart Groups', value: 'Specific Charts' },
                ]
            }
        }, [chartPermission.action])

        return (
            <>
                {!hideInfoLegend && <legend>Chart group permissions</legend>}
                <div
                    className="w-100 mt-16"
                    style={{ display: 'grid', gridTemplateColumns: '80px 80px 200px', alignItems: 'center' }}
                >
                    <label className="fw-6 fs-12 cn-5">VIEW</label>
                    <label className="fw-6 fs-12 cn-5">CREATE</label>
                    <label className="fw-6 fs-12 cn-5">EDIT</label>
                    <input type="checkbox" checked disabled />
                    <input
                        data-testid="chart-group-create-permission-checkbox"
                        type="checkbox"
                        checked={chartPermission.action === ActionTypes.ADMIN}
                        onChange={handleChartCreateChange}
                    />
                    <Select
                        value={
                            chartPermission.action === ActionTypes.ADMIN
                                ? chartGroupEditOptions[0]
                                : chartPermission.action === ActionTypes.VIEW
                                ? { label: 'Deny', value: 'Deny' }
                                : { label: 'Specific Chart Groups', value: 'Specific Charts' }
                        }
                        isDisabled={chartPermission.action === ActionTypes.ADMIN}
                        options={chartGroupEditOptions}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        onChange={handleChartEditChange}
                        menuPlacement="auto"
                        components={{
                            ClearIndicator: null,
                            IndicatorSeparator: null,
                            Option,
                        }}
                        styles={{ ...tempMultiSelectStyles }}
                    />
                </div>
                {chartPermission.action === ActionTypes.UPDATE && (
                    <Select
                        value={chartPermission.entityName}
                        placeholder="Select Chart Group"
                        isMulti
                        styles={{
                            ...tempMultiSelectStyles,
                            multiValue: (base) => ({
                                ...base,
                                border: `1px solid var(--N200)`,
                                borderRadius: `4px`,
                                background: 'white',
                                height: '30px',
                                margin: '0 8px 0 0',
                                padding: '1px',
                            }),
                            menu: (base, state) => ({
                                ...base,
                                top: 'auto',
                                width: '100%',
                            }),
                        }}
                        closeMenuOnSelect={false}
                        name="entityName"
                        options={chartGroupsList?.map((chartGroup) => ({
                            label: chartGroup.name,
                            value: chartGroup.name,
                        }))}
                        onChange={(selected, actionMeta) =>
                            setChartPermission((chartPermission) => ({ ...chartPermission, entityName: selected }))
                        }
                        className="mt-8 mb-8"
                        classNamePrefix="select"
                        hideSelectedOptions={false}
                        menuPlacement="auto"
                        components={{
                            ClearIndicator: null,
                            IndicatorSeparator: null,
                            MultiValueRemove,
                            MultiValueContainer: MultiValueContainer,
                            Option,
                        }}
                    />
                )}
            </>
        )
    },
)

const ValueContainer = (props) => {
    let length = props.getValue().length
    let optionLength = props.options.length
    if (props.selectProps.name === 'environment' || props.selectProps.name === 'workflow') {
        let _optionLength = 0
        props.options.forEach((option) => {
            _optionLength += option.options?.length
        })
        optionLength = _optionLength
    }

    let count = ''
    if (
        length === optionLength &&
        (props.selectProps.name.includes('entityName') ||
            props.selectProps.name === 'environment' ||
            props.selectProps.name.includes('workflow'))
    ) {
        count = 'All'
    } else {
        count = length
    }
    let Item
    if (props.selectProps.name.includes('entityName')) {
        Item = props.selectProps.name.split('/')[1] === 'jobs' ? 'job' : 'application'
    } else {
        Item = props.selectProps.name === 'environment' ? 'environment' : 'workflow'
    }
    return (
        <components.ValueContainer {...props}>
            {length > 0 ? (
                <>
                    {!props.selectProps.menuIsOpen && `${count} ${Item}${length !== 1 ? 's' : ''}`}
                    {React.cloneElement(props.children[1])}
                </>
            ) : (
                <>{props.children}</>
            )}
        </components.ValueContainer>
    )
}

const clusterValueContainer = (props) => {
    let length = props
        .getValue()
        .filter((opt) => opt.value && !opt.value.startsWith('#') && !opt.value.startsWith('*')).length
    let count = ''
    let totalEnv = props.options.reduce((len, cluster) => {
        len += cluster.options.length - 2
        return len
    }, 0)
    if (length === totalEnv) {
        count = 'All environments'
    } else {
        count = length + ' environment' + (length !== 1 ? 's' : '')
    }
    return (
        <components.ValueContainer {...props}>
            {length > 0 ? (
                <>
                    {!props.selectProps.menuIsOpen && count}
                    {React.cloneElement(props.children[1])}
                </>
            ) : (
                <>{props.children}</>
            )}
        </components.ValueContainer>
    )
}

export const projectValueContainer = (props) => {
    const value = props.getValue()
    return (
        <components.ValueContainer {...props}>
            {value[0] ? (
                <>
                    {!props.selectProps.menuIsOpen && value[0].value}
                    {React.cloneElement(props.children[1])}
                </>
            ) : (
                <>{props.children}</>
            )}
        </components.ValueContainer>
    )
}

export function GroupRow({ name, description, removeRow }) {
    return (
        <>
            <div className="anchor">{name}</div>
            <div className="dc__ellipsis-right">{description}</div>
            <CloseIcon onClick={removeRow} className="pointer" />
        </>
    )
}

function NoUsers({ onClick }) {
    const handleNoUserButton = () => {
        return (
            <button onClick={onClick} className="cta flex">
                <AddIcon className="mr-5" />
                Add user
            </button>
        )
    }
    return (
        <GenericEmptyState
            image={EmptyImage}
            title={EMPTY_STATE_STATUS.NO_USER.TITLE}
            subTitle={EMPTY_STATE_STATUS.NO_USER.SUBTITLE}
            isButtonAvailable={true}
            renderButton={handleNoUserButton}
        />
    )
}

const renderEmptySSOMessage = (): JSX.Element => {
    return (
        <>
            <span className="dc__bold">{SSO_NOT_CONFIGURED_STATE_TEXTS.notConfigured}</span>
            {SSO_NOT_CONFIGURED_STATE_TEXTS.infoText}
        </>
    )
}

function SSONotConfiguredState() {
    return (
        <GenericEmptyState
            image={EmptyImage}
            classname="fs-16 dc__align-center lh-24 mb-8-imp mt-20"
            title={SSO_NOT_CONFIGURED_STATE_TEXTS.title}
            subTitle={
                <>
                    {SSO_NOT_CONFIGURED_STATE_TEXTS.subTitle}
                    <InfoColourBar
                        message={renderEmptySSOMessage()}
                        classname="error_bar mt-8 dc__align-left info-colour-bar svg p-8 pl-8-imp "
                        linkText={SSO_NOT_CONFIGURED_STATE_TEXTS.linkText}
                        redirectLink={SSO_NOT_CONFIGURED_STATE_TEXTS.redirectLink}
                        internalLink={true}
                        Icon={ErrorIcon}
                    />
                </>
            }
        />
    )
}

function NoGroups({ onClick }) {
    const handleButton = () => {
        return (
            <button onClick={onClick} className="cta flex">
                <AddIcon className="mr-5" />
                Add group
            </button>
        )
    }
    return (
        <GenericEmptyState
            image={EmptyImage}
            title={EMPTY_STATE_STATUS.NO_GROUPS.TITLE}
            subTitle={EMPTY_STATE_STATUS.NO_GROUPS.SUBTITLE}
            isButtonAvailable={true}
            renderButton={handleButton}
        />
    )
}

function SearchEmpty({ searchString, setSearchString }) {
    const handleSearchEmptyButton = () => {
        return (
            <button onClick={(e) => setSearchString('')} className="cta secondary">
                Clear search
            </button>
        )
    }

    return (
        <GenericEmptyState
            image={EmptySearch}
            title={EMPTY_STATE_STATUS.CHART_EMPTY_STATE.TITLE}
            subTitle={
                <>
                    We couldn’t find any result for
                    {<b>{searchString}</b>}
                </>
            }
            isButtonAvailable={true}
            renderButton={handleSearchEmptyButton}
        />
    )
}

export function ParseData(dataList: any[], entity: string, accessType?: string) {
    switch (entity) {
        case EntityTypes.DIRECT:
            if (accessType === ACCESS_TYPE_MAP.DEVTRON_APPS) {
                return dataList.filter(
                    (role) =>
                        role.accessType === ACCESS_TYPE_MAP.DEVTRON_APPS && role.value !== CONFIG_APPROVER_ACTION.value,
                )
            } else {
                return dataList.filter((role) => role.accessType === ACCESS_TYPE_MAP.HELM_APPS)
            }
        case EntityTypes.CLUSTER:
            return dataList.filter((role) => role.entity === EntityTypes.CLUSTER)
        case EntityTypes.CHART_GROUP:
            return dataList.filter((role) => role.entity === EntityTypes.CHART_GROUP)
        case EntityTypes.JOB:
            return dataList.filter((role) => role.entity === EntityTypes.JOB)
    }
}

function getMetaPossibleRoles(customRoles: Custom_Roles[], entity: string, accessType?: string) {
    let possibleRolesMeta = {}
    customRoles.forEach((role) => {
        if (role.entity === entity && (entity !== EntityTypes.DIRECT || role.accessType === accessType)) {
            possibleRolesMeta = {
                ...possibleRolesMeta,
                [role.roleName]: {
                    value: role.roleDisplayName,
                    description: role.roleDescription,
                },
            }
        }
    })
    return possibleRolesMeta
}
