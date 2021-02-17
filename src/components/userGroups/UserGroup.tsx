import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { NavLink, Switch, Route, Redirect } from 'react-router-dom'
import { useRouteMatch } from 'react-router'
import { useAsync, NavigationArrow, getRandomColor, not, useKeyDown, noop, ConditionalWrap, Progressing, showError, removeItemsFromArray, getRandomString, Option, MultiValueContainer, MultiValueRemove, multiSelectStyles, sortBySelected, mapByKey, useEffectAfterMount } from '../common'
import { getUserList, getGroupList, getUserId, getGroupId, getUserRole } from './userGroup.service';
import { ReactComponent as AddIcon } from '../../assets/icons/ic-add.svg';
import Select, { components } from 'react-select';
import { get } from '../../services/api'
import { getEnvironmentListMin, getProjectFilteredApps } from '../../services/service'
import { getChartGroups } from '../charts/charts.service'
import { ChartGroup } from '../charts/charts.types'
import { DirectPermissionsRoleFilter, ChartGroupPermissionsFilter, ActionTypes, OptionType } from './userGroups.types'
import UserForm from './User'
import GroupForm from './Group';
import './UserGroup.scss';
import { DOCUMENTATION, Routes } from '../../config'

import { ReactComponent as CloseIcon } from '../../assets/icons/ic-close.svg'
import Tippy from '@tippyjs/react';
import EmptyState from '../EmptyState/EmptyState';
import EmptyImage from '../../assets/img/empty-applist@2x.png';
import EmptySearch from '../../assets/img/empty-noresult@2x.png';
import { ReactComponent as Lock } from '../../assets/icons/ic-locked.svg'

interface UserGroup {
    appsList: Map<number, { loading: boolean, result: { id: number, name: string }[], error: any }>;
    userGroupsList: any[];
    environmentsList: any[];
    projectsList: any[];
    chartGroupsList: ChartGroup[];
    fetchAppList: (projectId: number[]) => void;
    superAdmin: boolean;
}
const UserGroupContext = React.createContext<UserGroup>({
    appsList: new Map(),
    userGroupsList: [],
    environmentsList: [],
    projectsList: [],
    chartGroupsList: [],
    fetchAppList: () => { },
    superAdmin: false,
});

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
};

export function useUserGroupContext() {
    const context = React.useContext(UserGroupContext)
    if (!context) {
        throw new Error(
            `User group context cannot be used outside user group page`,
        )
    }
    return context
}

export default function UserGroupRoute() {
    const { url, path } = useRouteMatch()
    const [listsLoading, lists, listsError, reloadLists] = useAsync(() => Promise.allSettled([getGroupList(), get(Routes.PROJECT_LIST), getEnvironmentListMin(), getChartGroups(), getUserRole()]), [])
    const [appsList, setAppsList] = useState(new Map())
    useEffect(() => {
        if (!lists) return
        lists.forEach(list => {
            if (list.status === 'rejected') {
                showError(list.reason)
            }
        })
    }, [lists])

    async function fetchAppList(projectIds: number[]) {
        const missingProjects = projectIds.filter(projectId => !appsList.has(projectId))
        if (missingProjects.length === 0) return
        setAppsList(appList => {
            return missingProjects.reduce((appList, projectId,) => {
                appList.set(projectId, { loading: true, result: [], error: null })
                return appList
            }, appList)
        })
        try {
            const { result } = await getProjectFilteredApps(missingProjects);
            const projectsMap = mapByKey(result || [], 'projectId')
            setAppsList((appList) => {
                return new Map(missingProjects.reduce((appList, projectId, index) => {
                    appList.set(projectId, { loading: false, result: projectsMap.has(+projectId) ? projectsMap.get(+projectId)?.appList || [] : [], error: null });
                    return appList;
                }, appList));
            });
        }
        catch (error) {
            showError(error);
            setAppsList((appList) => {
                return missingProjects.reduce((appList, projectId) => {
                    appList.set(projectId, { loading: false, result: [], error });
                    return appList;
                }, appList);
            });
        }
    }
    if (listsLoading) return <Progressing pageLoader />
    const [userGroups, projects, environments, chartGroups, userRole] = lists
    return (
        <div className="auth-page">
            <HeaderSection />
            <div className="auth-page__body">
                <UserGroupContext.Provider
                    value={{
                        fetchAppList,
                        appsList,
                        userGroupsList: userGroups.status === 'fulfilled' ? userGroups?.value?.result : [],
                        environmentsList: environments.status === 'fulfilled' ? environments?.value?.result : [],
                        projectsList: projects.status === 'fulfilled' ? projects?.value?.result : [],
                        chartGroupsList: chartGroups.status === 'fulfilled' ? chartGroups?.value?.result?.groups : [],
                        superAdmin: userRole.status === 'fulfilled' ? userRole?.value?.result?.superAdmin : false
                    }}
                >
                    <Switch>
                        <Route path={`${path}/users`}>
                            <UserGroupList type="user" reloadLists={reloadLists} />
                        </Route>
                        <Route path={`${path}/groups`}>
                            <UserGroupList type="group" reloadLists={reloadLists} />
                        </Route>
                        <Redirect to={`${path}/users`} />
                    </Switch>
                </UserGroupContext.Provider>
            </div>
        </div>
    );
}

function HeaderSection() {
    const { url, path } = useRouteMatch()
    return (
        <div className="auth-page__header">
            <h1 className="form__title">User access</h1>
            <p className="form__subtitle">Manage user permissions.&nbsp;
                <a className="learn-more__href" rel="noreferrer noopener" href={DOCUMENTATION.GLOBAL_CONFIG_USER} target="_blank">Learn more about User Access</a>
            </p>

            <ul role="tablist" className="tab-list">
                <li className='tab-list__tab'><NavLink to={`${url}/users`} className="tab-list__tab-link" activeClassName="active">Users</NavLink></li>
                <li className='tab-list__tab'><NavLink to={`${url}/groups`} className="tab-list__tab-link" activeClassName="active">Groups</NavLink></li>
            </ul>
        </div>
    )
}

const UserGroupList: React.FC<{ type: 'user' | 'group', reloadLists: () => void }> = ({ type, reloadLists }) => {
    const [loading, data, error, reload, setState] = useAsync(type === 'user' ? getUserList : getGroupList, [type])
    const result = data?.result || []
    const [searchString, setSearchString] = useState("")
    const searchRef = useRef(null)
    const keys = useKeyDown()
    const [addHash, setAddHash] = useState(null)

    useEffect(() => {
        switch (keys.join(",").toLowerCase()) {
            case 'control,f':
            case 'meta,f':
                searchRef.current.focus()
        }
    }, [keys])

    useEffect(() => {
        if (!error) return
        showError(error)
    }, [error])

    useEffectAfterMount(() => {
        if (type === 'user') {
            reloadLists()
        }
    }, [type])

    useEffect(() => {
        if (loading) return
        if (!result || result.length === 0) {
            // do not show add item, empty placeholder visible
            setAddHash(null)
        }
        else {
            const randomString = getRandomString()
            setAddHash(randomString)
        }
    }, [result.length, loading])

    const updateCallback = useCallback((index: number, payload) => {
        const newResult = [...result]
        newResult[index] = payload
        setState(state => ({ ...state, result: newResult }))
    }, [result.length])

    const deleteCallback = useCallback((index: number, payload) => {
        const newResult = removeItemsFromArray(result, index, 1)
        setState(state => ({ ...state, result: newResult }))
    }, [result.length])

    const createCallback = useCallback((payload) => {
        if (Array.isArray(payload)) {
            setState(state => {
                return ({ ...state, result: [...payload, ...state.result] })
            })
        }
        else {
            setState(state => {
                return ({ ...state, result: [payload, ...state.result] })
            })
        }
    }, [result.length])

    function addNewEntry() {
        setAddHash(getRandomString())
    }

    function cancelCallback(e) {
        if (result.length === 0) {
            setAddHash(null)
        }
        else {
            setAddHash(getRandomString())
        }
    }

    if (loading) return <div className="w-100 flex" style={{ minHeight: '600px' }}><Progressing pageLoader /></div>
    if (!addHash) return type === "user" ? <NoUsers onClick={addNewEntry} /> : <NoGroups onClick={addNewEntry} />
    const filteredAndSorted = result
        .filter(userOrGroup => (userOrGroup.email_id?.includes(searchString) || userOrGroup.name?.includes(searchString) || userOrGroup.description?.includes(searchString)))
    return (
        <div id="auth-page__body" className="auth-page__body-users__list-container">
            {result.length > 0 && <input value={searchString} autoComplete="off" ref={searchRef} type="search" placeholder={`search ${type}`} className="auth-search" onChange={e => setSearchString(e.target.value)} />}
            {!(filteredAndSorted.length === 0 && result.length > 0) && <AddUser cancelCallback={cancelCallback} key={addHash} text={`Add ${type}`} type={type} open={!(result) || result?.length === 0} {...{ createCallback, updateCallback, deleteCallback }} />}
            {filteredAndSorted
                .map((data, index) =>
                    <CollapsedUserOrGroup
                        key={data.id}
                        {...data}
                        type={type}
                        {...{ updateCallback, deleteCallback, createCallback, index }}
                    />)}
            {filteredAndSorted.length === 0 && result.length > 0 && <SearchEmpty searchString={searchString} setSearchString={setSearchString} />}
        </div>
    )
}

interface Collapsed {
    index: number;
    email_id?: string;
    id?: number;
    name?: string;
    description?: string;
    type: 'user' | 'group';
    updateCallback: (index: number, payload: any) => void;
    deleteCallback: (index: number) => void;
    createCallback: (payload: any) => void;
}

const CollapsedUserOrGroup: React.FC<Collapsed> = ({ index, email_id = null, id = null, name = null, description = null, type, updateCallback, deleteCallback, createCallback }) => {
    const [collapsed, setCollapsed] = useState(true)
    const [dataLoading, data, dataError, reloadData, setData] = useAsync(type === 'group' ? () => getGroupId(id) : () => getUserId(id), [id, type], !collapsed)

    useEffect(() => {
        if (!dataError) return
        setCollapsed(true)
        showError(dataError)
    }, [dataError])

    function cancelCallback(e) {
        setCollapsed(not)
    }

    function updateCallbackOverride(index, data) {
        setData(state => ({ ...state, result: data }));
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
                <span className="user-list__direction-container flex rotate pointer"
                    onClick={email_id === 'admin' ? noop : e => setCollapsed(not)}
                    style={{ ['--rotateBy' as any]: collapsed ? '0deg' : '180deg' }}
                >
                    <ConditionalWrap
                        condition={email_id === 'admin'}
                        wrap={children => <Tippy className="default-tt" arrow={false} placement="top" content="Admin user cannot be edited"><div className="flex">{children}</div></Tippy>}
                    >
                        {email_id === 'admin' ? <Lock /> : dataLoading ? <Progressing /> : <NavigationArrow className="arrow-svg" />}
                    </ConditionalWrap>
                </span>
            </div>
            {!collapsed && data && !dataLoading && <div className="user-list__form w-100">
                {type === 'user' ?
                    <UserForm
                        id={id}
                        userData={data.result}
                        {...{ updateCallback: updateCallbackOverride, deleteCallback, createCallback, index, cancelCallback }}
                    />
                    :
                    <GroupForm
                        id={id}
                        groupData={data.result}
                        {...{ updateCallback: updateCallbackOverride, deleteCallback, createCallback, index, cancelCallback }}
                    />}
            </div>}
        </article>
    )
}

interface AddUser {
    text: string;
    type: 'user' | 'group';
    open: boolean;
    updateCallback: (...args) => void;
    deleteCallback: (...args) => void;
    createCallback: (...args) => void;
    cancelCallback: (...args) => void;
}
const AddUser: React.FC<AddUser> = ({ text = "", type = "", open = false, updateCallback, deleteCallback, createCallback, cancelCallback }) => {
    const [collapsed, setCollapsed] = useState(!open);
    return (
        <article className={`user-list flex column left ${collapsed ? 'user-list--collapsed' : ''} user-list--add`}>
            <div className={`${collapsed ? 'pointer' : ''} user-list__header user-list__header  w-100`} onClick={!collapsed ? noop : e => setCollapsed(not)}>
                {collapsed && <AddIcon className="add-svg mr-16" />}
                <span className="user-list__email-name flex left column">
                    <span className={`${collapsed ? 'anchor' : ''} fw-6`} style={{ fontSize: '14px' }}>{text}</span>
                    <small></small>
                </span>
                <span className="user-list__direction-container flex">
                </span>
            </div>
            {!collapsed && <div className="user-list__form w-100">
                {type === 'user' ?
                    <UserForm
                        id={null}
                        index={null}
                        {...{ updateCallback, deleteCallback, createCallback, cancelCallback }}
                    />
                    :
                    <GroupForm
                        id={null}
                        index={null}
                        {...{ updateCallback, deleteCallback, createCallback, cancelCallback }}
                    />}
            </div>}

        </article>
    )
}


const allApplicationsOption = {
    label: "All applications",
    value: "*"
};

const allEnvironmentsOption = {
    label: 'All environments',
    value: '*',
};
interface DirectPermissionRow {
    permission: DirectPermissionsRoleFilter;
    handleDirectPermissionChange: (...rest) => void;
    index: number;
    removeRow: (index: number) => void;
}

export const DirectPermission: React.FC<DirectPermissionRow> = ({ permission, handleDirectPermissionChange, index, removeRow }) => {
    const { environmentsList, projectsList, appsList } = useUserGroupContext()
    const projectId = permission.team ? projectsList.find(project => project.name === permission.team.value).id : null
    const possibleRoles = [
        ActionTypes.VIEW,
        ActionTypes.TRIGGER,
        ActionTypes.ADMIN,
        ActionTypes.MANAGER
    ]
    const [openMenu, changeOpenMenu] = useState<'entityName' | 'environment' | ''>('')
    const [environments, setEnvironments] = useState([])
    const [applications, setApplications] = useState([])

    useEffect(() => {
        const envOptions = environmentsList?.map((env) => ({
            label: env.environment_name,
            value: env.environment_name,
        }));
        setEnvironments(envOptions);
    }, [environmentsList])

    useEffect(() => {
        const appOptions = (appsList.get(projectId)?.result || [])?.map((app) => ({
            label: app.name,
            value: app.name,
        }))
        setApplications(appOptions)
    }, [appsList, projectId])

    useEffect(() => {
        if (openMenu || !projectId) return
        if (environments.length === 0 || applications.length === 0) {
            return
        }
        const sortedEnvironments =
            openMenu === 'environment' ? environments : sortBySelected(permission.environment, environments, 'value');
        const sortedApplications = openMenu === 'entityName'
            ? applications
            : sortBySelected(permission.entityName, applications, 'value');
        setEnvironments(sortedEnvironments)
        setApplications(sortedApplications)

    }, [openMenu, permission.environment, permission.entityName, projectId])


    function formatOptionLabel({ value, label }) {
        return (
            <div className="flex left column">
                <span>{possibleRolesMeta[value]?.value}</span>
                <small>{possibleRolesMeta[value]?.description}</small>
            </div>)
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
                placeholder="Select project"
                options={projectsList?.map((project) => ({ label: project.name, value: project.name }))}
                className="basic-multi-select"
                classNamePrefix="select"
                menuPortalTarget={document.body}
                onChange={handleDirectPermissionChange}
                components={{
                    ClearIndicator: null,
                    IndicatorSeparator: null,
                    Option,
                }}
                styles={{
                    ...multiSelectStyles,
                    control: (base, state) => ({
                        ...base,
                        border: state.isFocused ? '1px solid #06c' : '1px solid #d6dbdf',
                        boxShadow: 'none',
                    }),
                }}
            />
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
                    classNamePrefix="select"
                    menuPortalTarget={document.body}
                    hideSelectedOptions={false}
                    styles={multiSelectStyles}
                    components={{
                        ClearIndicator: null,
                        ValueContainer,
                        IndicatorSeparator: null,
                        Option,
                    }}
                    isDisabled={!permission.team}
                    onChange={handleDirectPermissionChange}
                />
                {permission.environmentError && <span className="form__error">{permission.environmentError}</span>}
            </div>
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
                    isLoading={projectId ? appsList.get(projectId)?.loading : false}
                    isDisabled={!permission.team}
                    styles={multiSelectStyles}
                    closeMenuOnSelect={false}
                    name="entityName"
                    onFocus={() => onFocus('entityName')}
                    onMenuClose={onMenuClose}
                    placeholder="Select applications"
                    options={[allApplicationsOption, ...applications]}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    menuPortalTarget={document.body}
                    onChange={handleDirectPermissionChange}
                    hideSelectedOptions={false}
                />
                {permission.entityNameError && <span className="form__error">{permission.entityNameError}</span>}
            </div>
            <Select
                value={permission.action}
                name="action"
                placeholder="Select role"
                options={possibleRoles.map((role) => ({ label: role as string, value: role as string }))}
                className="basic-multi-select"
                classNamePrefix="select"
                menuPortalTarget={document.body}
                formatOptionLabel={formatOptionLabel}
                onChange={handleDirectPermissionChange}
                isDisabled={!permission.team}
                styles={{
                    ...multiSelectStyles,
                    option: (base, state) => ({
                        ...base,
                        borderRadius: '4px',
                        color: state.isSelected ? 'var(--B500)' : 'var(--N900)',
                        backgroundColor: state.isSelected ? 'var(--B100)' : state.isFocused ? 'var(--N100)' : 'white',
                        fontWeight: state.isSelected ? 600 : 'normal',
                        marginRight: '8px',
                    }),
                }}
                components={{
                    ClearIndicator: null,
                    IndicatorSeparator: null,
                    ValueContainer: RoleValueContainer,
                }}
            />
            <CloseIcon className="pointer" onClick={(e) => removeRow(index)} />
        </React.Fragment>
    );
}


const AppOption = props => {
    const { selectOption, data } = props;
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
                <components.Option className="w-100" {...props} />
                {data.value === '*' && (
                    <span className="fs-12 cn-6 ml-8 mb-4 mr-4">Allow access to existing and new apps for this project</span>
                )}
            </div>
        </div>
    );
}

interface ChartPermissionRow {
    chartPermission: ChartGroupPermissionsFilter;
    setChartPermission: any;
}

export const ChartPermission: React.FC<ChartPermissionRow> = React.memo(({ chartPermission, setChartPermission }) => {
    const { chartGroupsList } = useUserGroupContext()
    function handleChartCreateChange(event) {
        if (event.target.checked) {
            // set admin
            setChartPermission(chartPermission => ({ ...chartPermission, action: ActionTypes.ADMIN, entityName: [] }))
        }
        else {
            // set view or update
            setChartPermission(chartPermission => ({ ...chartPermission, action: ActionTypes.VIEW, entityName: [] }))
        }
    }

    function handleChartEditChange(selected, actionMeta) {
        const { label, value } = selected
        if (value === 'Deny') {
            setChartPermission(chartPermission => ({ ...chartPermission, action: ActionTypes.VIEW, entityName: [] }))
        }
        else {
            setChartPermission(chartPermission => ({ ...chartPermission, action: ActionTypes.UPDATE, entityName: [] }))
        }
    }



    const chartGroupEditOptions: OptionType[] = useMemo(() => {
        if (chartPermission.action === ActionTypes.ADMIN) {
            return [{ label: 'All Chart Groups', value: 'All charts' }]
        }
        else {
            return [{ label: 'Deny', value: 'Deny' }, { label: 'Specific Chart Groups', value: 'Specific Charts' }]
        }
    }, [chartPermission.action])

    return (
        <fieldset>
            <legend>Chart group permissions</legend>
            <div className="w-100" style={{ display: 'grid', gridTemplateColumns: '80px 80px 200px', alignItems: 'center' }}>
                <label className="fw-6 fs-12 cn-5">VIEW</label>
                <label className="fw-6 fs-12 cn-5">CREATE</label>
                <label className="fw-6 fs-12 cn-5">EDIT</label>
                <input type="checkbox" checked disabled />
                <input type="checkbox" checked={chartPermission.action === ActionTypes.ADMIN} onChange={handleChartCreateChange} />
                <Select
                    value={chartPermission.action === ActionTypes.ADMIN ? chartGroupEditOptions[0] : chartPermission.action === ActionTypes.VIEW ? { label: 'Deny', value: 'Deny' } : { label: 'Specific Chart Groups', value: 'Specific Charts' }}
                    isDisabled={chartPermission.action === ActionTypes.ADMIN}
                    options={chartGroupEditOptions}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    menuPortalTarget={document.body}
                    onChange={handleChartEditChange}
                    components={{
                        ClearIndicator: null,
                        IndicatorSeparator: null,
                        Option
                    }}
                    styles={{ ...multiSelectStyles }}
                />
            </div>
            {chartPermission.action === ActionTypes.UPDATE &&
                <Select
                    value={chartPermission.entityName}
                    placeholder="Select Chart Group"
                    isMulti
                    styles={{
                        ...multiSelectStyles,
                        multiValue: base => ({
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
                    menuPortalTarget={document.body}
                    options={chartGroupsList?.map(chartGroup => ({ label: chartGroup.name, value: chartGroup.name }))}
                    onChange={(selected, actionMeta) => setChartPermission(chartPermission => ({ ...chartPermission, entityName: selected }))}
                    className="mt-8 mb-8"
                    classNamePrefix="select"
                    hideSelectedOptions={false}
                    components={{
                        ClearIndicator: null,
                        IndicatorSeparator: null,
                        MultiValueRemove,
                        MultiValueContainer: MultiValueContainer,
                        Option
                    }}
                />
            }
        </fieldset>
    )
})


const ValueContainer = props => {
    let length = props.getValue().length;
    let count = ''
    if (length === props.options.length && (props.selectProps.name === 'entityName' || props.selectProps.name === 'environment')) {
        count = 'All'
    }
    else {
        count = length
    }

    const Item = props.selectProps.name === 'entityName' ? 'application' : 'environment'
    return (
        <components.ValueContainer  {...props}>
            {length > 0 ?
                <>
                    {!props.selectProps.menuIsOpen && `${count} ${Item}${length !== 1 ? "s" : ""}`}
                    {React.cloneElement(props.children[1])}
                </>
                : <>{props.children}</>}
        </components.ValueContainer>
    );
};

export const RoleValueContainer = ({ children, getValue, clearValue, cx, getStyles, hasValue, isMulti, options, selectOption, selectProps, setValue, ...props }) => {
    const [{ value }] = getValue()
    return (
        <components.ValueContainer  {...{ getValue, clearValue, cx, getStyles, hasValue, isMulti, options, selectOption, selectProps, setValue, ...props }}>
            {value === '*' ? 'Admin' : possibleRolesMeta[value].value}
            {React.cloneElement(children[1])}
        </components.ValueContainer>
    );
};

export function GroupRow({ name, description, removeRow }) {
    return (
        <>
            <div className="anchor">{name}</div>
            <div className="ellipsis-right">{description}</div>
            <CloseIcon onClick={removeRow} className="pointer" />
        </>
    )
}

function NoUsers({ onClick }) {
    return (
        <EmptyState>
            <EmptyState.Image><img src={EmptyImage} alt="so empty" /></EmptyState.Image>
            <EmptyState.Title><h4>No users</h4></EmptyState.Title>
            <EmptyState.Subtitle>Add users and assign group or direct permissions</EmptyState.Subtitle>
            <EmptyState.Button>
                <button onClick={onClick} className="cta flex"><AddIcon className="mr-5" />Add user</button>
            </EmptyState.Button>
        </EmptyState>
    )
}

function NoGroups({ onClick }) {
    return (
        <EmptyState>
            <EmptyState.Image><img src={EmptyImage} alt="so empty" /></EmptyState.Image>
            <EmptyState.Title><h4>No groups</h4></EmptyState.Title>
            <EmptyState.Subtitle>Groups allow you to combine permissions and easily assign them to users</EmptyState.Subtitle>
            <EmptyState.Button>
                <button onClick={onClick} className="cta flex"><AddIcon className="mr-5" />Add group</button>
            </EmptyState.Button>
        </EmptyState>
    )
}

function SearchEmpty({ searchString, setSearchString }) {
    return (
        <EmptyState>
            <EmptyState.Image><img src={EmptySearch} alt="so empty" /></EmptyState.Image>
            <EmptyState.Title><h4>No matching results</h4></EmptyState.Title>
            <EmptyState.Subtitle>We couldn’t find any result for ”<b>{searchString}</b>”</EmptyState.Subtitle>
            <EmptyState.Button>
                <button onClick={e => setSearchString("")} className="cta secondary">Clear search</button>
            </EmptyState.Button>
        </EmptyState>
    )
}

