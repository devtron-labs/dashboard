import React, { useState, useEffect, useRef, useMemo, useCallback, useContext } from 'react'
import { NavLink, Switch, Route, Redirect } from 'react-router-dom'
import { useRouteMatch } from 'react-router'
import {
    useAsync,
    NavigationArrow,
    getRandomColor,
    not,
    useKeyDown,
    noop,
    ConditionalWrap,
    Progressing,
    showError,
    removeItemsFromArray,
    getRandomString,
    Option,
    MultiValueContainer,
    MultiValueRemove,
    multiSelectStyles,
    sortBySelected,
    mapByKey,
    useEffectAfterMount,
    sortObjectArrayAlphabetically,
    ErrorScreenNotAuthorized,
} from '../common'
import {
    getUserList,
    getGroupList,
    getUserId,
    getGroupId,
    getEnvironmentListHelmApps,
    getUsersDataToExport,
    getGroupsDataToExport,
    getUserRole
} from './userGroup.service'
import { get } from '../../services/api'
import { getEnvironmentListMin, getProjectFilteredApps } from '../../services/service'
import { getChartGroups } from '../charts/charts.service'
import { ChartGroup } from '../charts/charts.types'
import {
    DirectPermissionsRoleFilter,
    ChartGroupPermissionsFilter,
    ActionTypes,
    OptionType,
    CollapsedUserOrGroupProps,
    CreateGroup,
    CreateUser,
} from './userGroups.types'
import { ACCESS_TYPE_MAP, DOCUMENTATION, HELM_APP_UNASSIGNED_PROJECT, Routes, SERVER_MODE } from '../../config'
import { ReactComponent as AddIcon } from '../../assets/icons/ic-add.svg'
import { ReactComponent as CloseIcon } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Lock } from '../../assets/icons/ic-locked.svg'
import Select, { components } from 'react-select'
import UserForm from './User'
import GroupForm from './Group'
import Tippy from '@tippyjs/react'
import EmptyState from '../EmptyState/EmptyState'
import EmptyImage from '../../assets/img/empty-applist@2x.png'
import EmptySearch from '../../assets/img/empty-noresult@2x.png'
import './UserGroup.scss'
import { mainContext } from '../common/navigation/NavigationRoutes'
import { Option as singleOption } from '../v2/common/ReactSelect.utils'
import ApiTokens from '../apiTokens/ApiTokens.component'
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg'
import ExportToCsv from '../common/ExportToCsv/ExportToCsv'
import { FILE_NAMES, GROUP_EXPORT_HEADER_ROW, USER_EXPORT_HEADER_ROW } from '../common/ExportToCsv/constants'

interface UserGroup {
    appsList: Map<number, { loading: boolean; result: { id: number; name: string }[]; error: any }>
    userGroupsList: any[]
    environmentsList: any[]
    projectsList: any[]
    chartGroupsList: ChartGroup[]
    fetchAppList: (projectId: number[]) => void
    superAdmin: boolean
    roles: string[]
    envClustersList: any[]
    fetchAppListHelmApps: (projectId: number[]) => void
    appsListHelmApps: Map<number, { loading: boolean; result: { id: number; name: string }[]; error: any }>
}
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
    appsListHelmApps: new Map(),
})

const possibleRolesMeta = {
    [ActionTypes.VIEW]: {
        value: 'View only',
        description: 'Can view selected applications',
    },
    [ActionTypes.TRIGGER]: {
        value: 'Build and deploy',
        description: 'Can build and deploy apps on selected environments',
    },
    [ActionTypes.ADMIN]: {
        value: 'Admin',
        description: 'Can view, trigger and edit selected applications',
    },
    '*': {
        value: 'Admin',
        description: 'Can view, trigger and edit selected applications',
    },
    [ActionTypes.MANAGER]: {
        value: 'Manager',
        description: 'Can view, trigger and edit selected applications. Can also manage user access.',
    },
    [ActionTypes.UPDATE]: {
        value: 'Build and deploy',
        description: 'Can build and deploy apps on selected environments.',
    },
}

const possibleRolesMetaHelmApps = {
    [ActionTypes.VIEW]: {
        value: 'View only',
        description: 'Can view selected application(s) and resource manifests of selected application(s)',
    },
    [ActionTypes.EDIT]: {
        value: 'View & Edit',
        description: 'Can also edit resource manifests of selected application(s)',
    },
    [ActionTypes.ADMIN]: {
        value: 'Admin',
        description: 'Complete access on selected applications',
    },
    '*': {
        value: 'Admin',
        description: 'Complete access on selected applications',
    },
}

const tempMultiSelectStyles = {
    ...multiSelectStyles,
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

function HeaderSection(type: string) {
    const isUserPremissions = type === 'user'

    return (
        <div className="auth-page__header">
            <h2 className="auth-page__header-title form__title">
                {isUserPremissions ? 'User permissions' : 'Permission groups'}
            </h2>
            <p className="form__subtitle">
                {isUserPremissions
                    ? "Manage your organization's users and their permissions."
                    : 'Permission groups allow you to easily manage user permissions by assigning desired permissions to a group and assigning these groups to users to provide all underlying permissions.'}
                &nbsp;
                <a
                    className="dc__link"
                    rel="noreferrer noopener"
                    href={
                        isUserPremissions
                            ? DOCUMENTATION.GLOBAL_CONFIG_USER
                            : DOCUMENTATION.GLOBAL_CONFIG_GROUPS
                    }
                    target="_blank"
                >
                    Learn more about {isUserPremissions ? 'User permissions' : 'Permission groups'}
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
                serverMode === SERVER_MODE.EA_ONLY ? null : get(Routes.PROJECT_LIST),
                serverMode === SERVER_MODE.EA_ONLY ? null : getEnvironmentListMin(),
                serverMode === SERVER_MODE.EA_ONLY ? null : getChartGroups(),
                getUserRole(),
                getEnvironmentListHelmApps(),
            ]),
        [serverMode],
    )
    const [appsList, setAppsList] = useState(new Map())
    const [appsListHelmApps, setAppsListHelmApps] = useState(new Map())
    useEffect(() => {
        if (!lists) return
        lists.forEach((list) => {
            if (list.status === 'rejected') {
                showError(list.reason)
            }
        })
    }, [lists])

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
            const { result } = await getProjectFilteredApps(missingProjects)
            const projectsMap = mapByKey(result || [], 'projectId')
            setAppsList((appList) => {
                return new Map(
                    missingProjects.reduce((appList, projectId, index) => {
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
        if (serverMode === SERVER_MODE.EA_ONLY) return
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
                    missingProjects.reduce((appListHelmApps, projectId, index) => {
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
    const [userGroups, projects, environments, chartGroups, userRole, envClustersList] = lists
    return (
        <div className="auth-page">
            <div className="auth-page__body">
                <UserGroupContext.Provider
                    value={{
                        fetchAppList,
                        appsList,
                        userGroupsList: userGroups.status === 'fulfilled' ? userGroups?.value?.result : [],
                        environmentsList: environments.status === 'fulfilled' ? environments?.value?.result : [],
                        projectsList: projects.status === 'fulfilled' ? projects?.value?.result : [],
                        chartGroupsList: chartGroups.status === 'fulfilled' ? chartGroups?.value?.result?.groups : [],
                        superAdmin: userRole.status === 'fulfilled' ? userRole?.value?.result?.superAdmin : false,
                        roles: userRole.status === 'fulfilled' ? userRole?.value?.result?.roles : [],
                        envClustersList: envClustersList.status === 'fulfilled' ? envClustersList?.value?.result : [],
                        fetchAppListHelmApps,
                        appsListHelmApps,
                    }}
                >
                    <Switch>
                        <Route path={`${path}/users`}>
                            <UserGroupList type="user" reloadLists={reloadLists} renderHeaders={HeaderSection} />
                        </Route>
                        <Route path={`${path}/groups`}>
                            <UserGroupList type="group" reloadLists={reloadLists} renderHeaders={HeaderSection} />
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
    renderHeaders: (type: string) => JSX.Element
}> = ({ type, reloadLists, renderHeaders }) => {
    const [loading, data, error, reload, setState] = useAsync(type === 'user' ? getUserList : getGroupList, [type])
    const result = (data && data['result']) || []
    const [searchString, setSearchString] = useState('')
    const searchRef = useRef(null)
    const keys = useKeyDown()
    const [addHash, setAddHash] = useState(null)
    const { roles } = useUserGroupContext()

    useEffect(() => {
        switch (keys.join(',').toLowerCase()) {
            case 'control,f':
            case 'meta,f':
                searchRef.current.focus()
        }
    }, [keys])

    useEffect(() => {
        if (!error) return
        showError(error,true,true)
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
        (index: number, payload) => {
            const newResult = [...result]
            newResult[index] = payload
            setState((state) => ({ ...state, result: newResult }))
        },
        [result.length],
    )

    const deleteCallback = useCallback(
        (index: number, payload) => {
            const newResult = removeItemsFromArray(result, index, 1)
            setState((state) => ({ ...state, result: newResult }))
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
                        _userPermissions.role = possibleRolesMeta[_roleFilter.action]?.value || '-'

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
                        _groupPermissions.role = possibleRolesMeta[_roleFilter.action]?.value || '-'

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

    if (loading)
        return (
            <div className="w-100 flex" style={{ minHeight: '600px' }}>
                <Progressing pageLoader />
            </div>
        )
        
    if (error && (error.code === 403 || error.code === 401)) return <ErrorScreenNotAuthorized subtitle="" />
    if (!addHash) return type === 'user' ? <NoUsers onClick={addNewEntry} /> : <NoGroups onClick={addNewEntry} />
    const filteredAndSorted = result.filter(
        (userOrGroup) =>
            userOrGroup.name?.toLowerCase()?.includes(searchString?.toLowerCase()) ||
            userOrGroup.email_id?.toLowerCase()?.includes(searchString?.toLowerCase()) ||
            userOrGroup.description?.toLowerCase()?.includes(searchString?.toLowerCase()),
    )
    return (
        <div id="auth-page__body" className="auth-page__body-users__list-container">
            {renderHeaders(type)}
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
                    open={!result || result?.length === 0}
                    {...{ createCallback, updateCallback, deleteCallback }}
                />
            )}
            {filteredAndSorted.map((data, index) => (
                <CollapsedUserOrGroup
                    key={data.id}
                    {...data}
                    type={type}
                    {...{ updateCallback, deleteCallback, createCallback, index }}
                />
            ))}
            {filteredAndSorted.length === 0 && result.length > 0 && (
                <SearchEmpty searchString={searchString} setSearchString={setSearchString} />
            )}
        </div>
    )
}

const CollapsedUserOrGroup: React.FC<CollapsedUserOrGroupProps> = ({
    index,
    email_id = null,
    id = null,
    name = null,
    description = null,
    type,
    updateCallback,
    deleteCallback,
    createCallback,
}) => {
    const [collapsed, setCollapsed] = useState(true)
    const [dataLoading, data, dataError, reloadData, setData] = useAsync(
        type === 'group' ? () => getGroupId(id) : () => getUserId(id),
        [id, type],
        !collapsed,
    )

    useEffect(() => {
        if (!dataError) return
        setCollapsed(true)
        showError(dataError)
    }, [dataError])

    function cancelCallback(e) {
        setCollapsed(not)
    }

    function updateCallbackOverride(index, data) {
        setData((state) => ({ ...state, result: data }))
        updateCallback(index, data)
    }
    return (
        <article className={`user-list ${collapsed ? 'user-list--collapsed' : ''} flex column left`}>
            <div className="user-list__header w-100">
                <span className="user-list__alphabet" style={{ backgroundColor: getRandomColor(email_id || name) }}>
                    {email_id ? email_id[0] : name[0]}
                </span>
                <span className="user-list__email-name flex left column">
                    <span className="user-list__title">{name || email_id}</span>
                    <span className="user-list__subtitle">{description || email_id}</span>
                </span>
                <span
                    className="user-list__direction-container flex rotate pointer"
                    onClick={email_id === 'admin' ? noop : (e) => setCollapsed(not)}
                    style={{ ['--rotateBy' as any]: collapsed ? '0deg' : '180deg' }}
                >
                    <ConditionalWrap
                        condition={email_id === 'admin'}
                        wrap={(children) => (
                            <Tippy
                                className="default-tt"
                                arrow={false}
                                placement="top"
                                content="Admin user cannot be edited"
                            >
                                <div className="flex">{children}</div>
                            </Tippy>
                        )}
                    >
                        {email_id === 'admin' ? (
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
                                index,
                                cancelCallback,
                            }}
                        />
                    ) : (
                        <GroupForm
                            id={id}
                            groupData={data.result}
                            {...{
                                updateCallback: updateCallbackOverride,
                                deleteCallback,
                                createCallback,
                                index,
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
    open: boolean
    updateCallback: (...args) => void
    deleteCallback: (...args) => void
    createCallback: (...args) => void
    cancelCallback: (...args) => void
}
const AddUser: React.FC<AddUser> = ({
    text = '',
    type = '',
    open = false,
    updateCallback,
    deleteCallback,
    createCallback,
    cancelCallback,
}) => {
    const [collapsed, setCollapsed] = useState(!open)
    return (
        <article className={`user-list flex column left ${collapsed ? 'user-list--collapsed' : ''} user-list--add`}>
            <div
                className={`${collapsed ? 'pointer' : ''} user-list__header user-list__header  w-100`}
                onClick={!collapsed ? noop : (e) => setCollapsed(not)}
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
                            index={null}
                            {...{ updateCallback, deleteCallback, createCallback, cancelCallback }}
                        />
                    ) : (
                        <GroupForm
                            id={null}
                            index={null}
                            {...{ updateCallback, deleteCallback, createCallback, cancelCallback }}
                        />
                    )}
                </div>
            )}
        </article>
    )
}

const allApplicationsOption = {
    label: 'All applications',
    value: '*',
}

const allEnvironmentsOption = {
    label: 'All environments',
    value: '*',
}
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
    const { serverMode } = useContext(mainContext)
    const { environmentsList, projectsList, appsList, envClustersList, appsListHelmApps } = useUserGroupContext()
    const projectId =
        permission.team && serverMode !== SERVER_MODE.EA_ONLY && permission.team.value !== HELM_APP_UNASSIGNED_PROJECT
            ? projectsList.find((project) => project.name === permission.team.value)?.id
            : null
    const possibleRoles = [ActionTypes.VIEW, ActionTypes.TRIGGER, ActionTypes.ADMIN, ActionTypes.MANAGER]
    const possibleRolesHelmApps = [ActionTypes.VIEW, ActionTypes.EDIT, ActionTypes.ADMIN]
    const [openMenu, changeOpenMenu] = useState<'entityName' | 'environment' | ''>('')
    const [environments, setEnvironments] = useState([])
    const [applications, setApplications] = useState([])
    const [envClusters, setEnvClusters] = useState([])
    const [projectInput, setProjectInput] = useState('')
    const [clusterInput, setClusterInput] = useState('')
    const [envInput, setEnvInput] = useState('')
    const [appInput, setAppInput] = useState('')

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
                    ? possibleRolesMetaHelmApps[value].value
                    : possibleRolesMeta[value].value}
                {React.cloneElement(children[1])}
            </components.ValueContainer>
        )
    }

    useEffect(() => {
        const envOptions = environmentsList?.map((env) => ({
            label: env.environment_name,
            value: env.environmentIdentifier,
        }))
        setEnvironments(envOptions)
    }, [environmentsList])

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
        }))
        setEnvClusters(envOptions)
    }, [envClustersList])

    useEffect(() => {
        const appOptions = (
            (projectId &&
                (permission.accessType === ACCESS_TYPE_MAP.DEVTRON_APPS ? appsList : appsListHelmApps).get(projectId)
                    ?.result) ||
            []
        )?.map((app) => ({
            label: app.name,
            value: app.name,
        }))
        setApplications(appOptions)
    }, [appsList, appsListHelmApps, projectId])

    useEffect(() => {
        if (openMenu || !projectId) return
        if ((environments && environments.length === 0) || applications.length === 0) {
            return
        }
        const sortedEnvironments =
            openMenu === 'environment' ? environments : sortBySelected(permission.environment, environments, 'value')
        const sortedApplications =
            openMenu === 'entityName' ? applications : sortBySelected(permission.entityName, applications, 'value')
        setEnvironments(sortedEnvironments)
        setApplications(sortedApplications)
    }, [openMenu, permission.environment, permission.entityName, projectId])

    function formatOptionLabel({ value, label }) {
        return (
            <div className="flex left column">
                <span>
                    {
                        (permission.accessType === ACCESS_TYPE_MAP.HELM_APPS
                            ? possibleRolesMetaHelmApps
                            : possibleRolesMeta)[value]?.value
                    }
                </span>
                <small className="light-color">
                    {
                        (permission.accessType === ACCESS_TYPE_MAP.HELM_APPS
                            ? possibleRolesMetaHelmApps
                            : possibleRolesMeta)[value]?.description
                    }
                </small>
            </div>
        )
    }

    function formatGroupLabel(option) {
        return (
            <div>
                <span>{'Cluster : ' + option.label}</span>
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
                            {option.clusterName + (option.clusterName ? '/' : '') + option.namespace}
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
            option.data.label.toLowerCase().includes(searchText.toLowerCase()) ||
            option.data.clusterName.toLowerCase().includes(searchText.toLowerCase()) ||
            option.data.namespace.toLowerCase().includes(searchText.toLowerCase())
        ) {
            return true
        } else {
            return false
        }
    }

    function onFocus(name: 'entityName' | 'environment') {
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
                options={(serverMode === SERVER_MODE.EA_ONLY
                    ? [{ name: HELM_APP_UNASSIGNED_PROJECT }]
                    : permission.accessType === ACCESS_TYPE_MAP.HELM_APPS
                    ? [{ name: HELM_APP_UNASSIGNED_PROJECT }, ...(projectsList || [])]
                    : projectsList
                )?.map((project) => ({ label: project.name, value: project.name }))}
                className="basic-multi-select"
                classNamePrefix="select"
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
                        formatGroupLabel={formatGroupLabel}
                        filterOption={customFilter}
                        className="basic-multi-select cluster-select"
                        classNamePrefix="select"
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
                <div>
                    <Select
                        value={permission.environment}
                        isMulti
                        closeMenuOnSelect={false}
                        name="environment"
                        onFocus={() => onFocus('environment')}
                        onMenuClose={onMenuClose}
                        placeholder="Select environments"
                        options={[allEnvironmentsOption, ...environments]}
                        className="basic-multi-select"
                        menuPlacement="auto"
                        classNamePrefix="select"
                        hideSelectedOptions={false}
                        styles={tempMultiSelectStyles}
                        components={{
                            ClearIndicator: null,
                            ValueContainer,
                            IndicatorSeparator: null,
                            Option,
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
            <div>
                <Select
                    value={permission.entityName}
                    isMulti
                    components={{
                        ClearIndicator: null,
                        ValueContainer,
                        IndicatorSeparator: null,
                        Option: AppOption,
                    }}
                    isLoading={
                        projectId
                            ? (permission.accessType === ACCESS_TYPE_MAP.DEVTRON_APPS
                                  ? appsList
                                  : appsListHelmApps
                              ).get(projectId)?.loading
                            : false
                    }
                    isDisabled={!permission.team}
                    styles={tempMultiSelectStyles}
                    closeMenuOnSelect={false}
                    name="entityName"
                    onFocus={() => onFocus('entityName')}
                    onMenuClose={onMenuClose}
                    placeholder="Select applications"
                    options={[allApplicationsOption, ...applications]}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    onChange={handleDirectPermissionChange}
                    hideSelectedOptions={false}
                    inputValue={appInput}
                    menuPlacement="auto"
                    onBlur={() => {
                        setAppInput('')
                    }}
                    onInputChange={(value, action) => {
                        if (action.action === 'input-change') setAppInput(value)
                    }}
                />
                {permission.entityNameError && <span className="form__error">{permission.entityNameError}</span>}
            </div>
            <Select
                value={permission.action}
                name="action"
                placeholder="Select role"
                options={(permission.accessType === ACCESS_TYPE_MAP.HELM_APPS
                    ? possibleRolesHelmApps
                    : possibleRoles
                ).map((role) => ({
                    label: role as string,
                    value: role as ActionTypes.MANAGER | ActionTypes.VIEW | ActionTypes.TRIGGER | ActionTypes.ADMIN,
                }))}
                className="basic-multi-select"
                classNamePrefix="select"
                formatOptionLabel={formatOptionLabel}
                onChange={handleDirectPermissionChange}
                isDisabled={!permission.team}
                menuPlacement="auto"
                styles={{
                    ...tempMultiSelectStyles,
                    option: (base, state) => ({
                        ...base,
                        borderRadius: '4px',
                        color: state.isSelected ? 'var(--B500)' : 'var(--N900)',
                        backgroundColor: state.isSelected ? 'var(--B100)' : state.isFocused ? 'var(--N100)' : 'white',
                        fontWeight: state.isSelected ? 600 : 'normal',
                        marginRight: '8px',
                    }),
                    valueContainer: (base, state) => ({
                        ...base,
                        display: 'flex',
                    }),
                }}
                components={{
                    ClearIndicator: null,
                    IndicatorSeparator: null,
                    ValueContainer: RoleValueContainer,
                }}
            />
            <CloseIcon className="pointer margin-top-6px" onClick={(e) => removeRow(index)} />
        </React.Fragment>
    )
}

const AppOption = (props) => {
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
                        Allow access to existing and new apps for this project
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
    let count = ''
    if (
        length === props.options.length &&
        (props.selectProps.name === 'entityName' || props.selectProps.name === 'environment')
    ) {
        count = 'All'
    } else {
        count = length
    }

    const Item = props.selectProps.name === 'entityName' ? 'application' : 'environment'
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
    return (
        <EmptyState>
            <EmptyState.Image>
                <img src={EmptyImage} alt="so empty" />
            </EmptyState.Image>
            <EmptyState.Title>
                <h4>No users</h4>
            </EmptyState.Title>
            <EmptyState.Subtitle>Add users and assign group or direct permissions</EmptyState.Subtitle>
            <EmptyState.Button>
                <button onClick={onClick} className="cta flex">
                    <AddIcon className="mr-5" />
                    Add user
                </button>
            </EmptyState.Button>
        </EmptyState>
    )
}

function NoGroups({ onClick }) {
    return (
        <EmptyState>
            <EmptyState.Image>
                <img src={EmptyImage} alt="so empty" />
            </EmptyState.Image>
            <EmptyState.Title>
                <h4>No groups</h4>
            </EmptyState.Title>
            <EmptyState.Subtitle>
                Groups allow you to combine permissions and easily assign them to users
            </EmptyState.Subtitle>
            <EmptyState.Button>
                <button onClick={onClick} className="cta flex">
                    <AddIcon className="mr-5" />
                    Add group
                </button>
            </EmptyState.Button>
        </EmptyState>
    )
}

function SearchEmpty({ searchString, setSearchString }) {
    return (
        <EmptyState>
            <EmptyState.Image>
                <img src={EmptySearch} alt="so empty" />
            </EmptyState.Image>
            <EmptyState.Title>
                <h4>No matching results</h4>
            </EmptyState.Title>
            <EmptyState.Subtitle>
                We couldn’t find any result for ”<b>{searchString}</b>”
            </EmptyState.Subtitle>
            <EmptyState.Button>
                <button onClick={(e) => setSearchString('')} className="cta secondary">
                    Clear search
                </button>
            </EmptyState.Button>
        </EmptyState>
    )
}