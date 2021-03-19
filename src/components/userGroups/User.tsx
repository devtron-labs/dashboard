
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { showError, Progressing, ConfirmationDialog, mapByKey, removeItemsFromArray, validateEmail, Option, ClearIndicator, MultiValueRemove, multiSelectStyles, DeleteDialog } from '../common'

import { saveUser, deleteUser } from './userGroup.service';
import Creatable from 'react-select/creatable'
import Select, { components } from 'react-select';

import { DirectPermissionsRoleFilter, ChartGroupPermissionsFilter, EntityTypes, ActionTypes, CreateUser, OptionType, APIRoleFilter } from './userGroups.types'
import './UserGroup.scss';
import { toast } from 'react-toastify'
import { useUserGroupContext, DirectPermission, ChartPermission, GroupRow } from './UserGroup'
import deleteIcon from '../../assets/img/warning-medium.svg'
import { ReactComponent as AddIcon } from '../../assets/icons/ic-add.svg';
import { ReactComponent as RedWarning } from '../../assets/icons/ic-error-medium.svg';

const MultiValueContainer = ({ validator, ...props }) => {
    const { children, data, innerProps, selectProps } = props
    const { label, value } = data
    const isValidEmail = validator ? validator(value) : true
    return (
        <components.MultiValueContainer {...{ data, innerProps, selectProps }} >
            <div className={`flex fs-12 ml-4`}>
                {!isValidEmail && <RedWarning className="mr-4" />}
                <div className={`${isValidEmail ? 'cn-9' : 'cr-5'}`}>{label}</div>
            </div>
            {children[1]}
        </components.MultiValueContainer>
    );
};

const CreatableStyle = {
    multiValue: (base, state) => {
        return ({
            ...base,
            border: validateEmail(state.data.value) ? `1px solid var(--N200)` : `1px solid var(--R500)`,
            borderRadius: `4px`,
            background: validateEmail(state.data.value) ? 'white' : 'var(--R100)',
            height: '30px',
            margin: '0 8px 4px 0',
            padding: '1px',
            fontSize: '12px',
        })
    },
    control: (base, state) => ({
        ...base,
        border: state.isFocused ? '1px solid #06c' : '1px solid #d6dbdf', // default border color
        boxShadow: 'none', // no box-shadow
    }),
}

export default function UserForm({ id = null, userData = null, index, updateCallback, deleteCallback, createCallback, cancelCallback }) {
    // id null is for create
    const emptyDirectPermission: DirectPermissionsRoleFilter = {
        entity: EntityTypes.DIRECT,
        entityName: [],
        environment: [],
        team: null,
        action:
        {
            label: "",
            value: ActionTypes.VIEW
        }
    }
    const { userGroupsList, appsList, projectsList, fetchAppList, environmentsList, superAdmin } = useUserGroupContext()
    const userGroupsMap = mapByKey(userGroupsList, 'name')
    const [localSuperAdmin, setSuperAdmin] = useState<boolean>(false)
    const [emailState, setEmailState] = useState<{ emails: OptionType[], inputEmailValue: string, emailError: string }>({ emails: [], inputEmailValue: '', emailError: '' })
    const [directPermission, setDirectPermission] = useState<DirectPermissionsRoleFilter[]>([])
    const [chartPermission, setChartPermission] = useState<ChartGroupPermissionsFilter>({ entity: EntityTypes.CHART_GROUP, action: ActionTypes.VIEW, entityName: [] })
    const [userGroups, setUserGroups] = useState<OptionType[]>([])
    const [submitting, setSubmitting] = useState(false)
    const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false)
    const creatableRef = useRef(null)
    const groupPermissionsRef = useRef(null)


    useEffect(() => {
        if (creatableRef.current) {
            creatableRef.current.focus()
        }
        else if (groupPermissionsRef.current) {
            groupPermissionsRef.current.focus()
        }
    }, [])

    function validateForm(): boolean {
        if (emailState.emails.length === 0) {
            setEmailState(emailState => ({ ...emailState, emailError: 'Emails are mandatory.' }))
            return false
        }

        if (emailState.emails.length !== emailState.emails.map(email => email.value).filter(email => validateEmail(email)).length) {
            setEmailState(emailState => ({ ...emailState, emailError: 'One or more emails could not be verified to be correct.' }))
            return false
        }
        return true
    }

    function isFormComplete(): boolean {
        let isComplete: boolean = true
        const tempPermissions = directPermission.reduce((agg, curr) => {
            if (curr.team && curr.entityName.length === 0) {
                isComplete = false
                curr.entityNameError = 'Applications are mandatory'
            }
            if (curr.team && curr.environment.length === 0) {
                isComplete = false
                curr.environmentError = 'Environments are mandatory'
            }
            agg.push(curr)
            return agg
        }, [])

        if (!isComplete) {
            setDirectPermission(tempPermissions)
        }

        return isComplete
    }

    async function handleSubmit(e) {
        const validForm = validateForm()
        if (!validForm) {
            return
        }
        if (!isFormComplete()) {
            return
        }
        setSubmitting(true)
        const payload: CreateUser = {
            id: id || 0,
            email_id: emailState.emails.map(email => email.value).join(","),
            groups: userGroups.map(group => group.value),
            roleFilters: [
                ...directPermission
                    .filter(permission => (permission.team?.value && permission.environment.length && permission.entityName.length))
                    .map(permission => ({
                        ...permission,
                        action: permission.action.value,
                        team: permission.team.value,
                        environment: permission.environment.find(env => env.value === '*') ? '' : permission.environment.map(env => env.value).join(","),
                        entityName: permission.entityName.find(entity => entity.value === '*') ? '' : permission.entityName.map(entity => entity.value).join(",")
                    })),
                {
                    ...chartPermission,
                    team: "",
                    environment: "",
                    entityName: chartPermission.entityName.map(entity => entity.value).join(",")
                }
            ],
            superAdmin: localSuperAdmin
        }

        try {
            const { result } = await saveUser(payload)
            if (id) {
                updateCallback(index, result)
            }
            else {
                createCallback(result)
            }

            toast.success('Created user successfully')
        }
        catch (err) {
            showError(err)
        }
        finally {
            setSubmitting(false)
        }
    }

    useEffect(() => {
        if (!userData) {
            setDirectPermission([emptyDirectPermission])
            return
        }
        populateDataFromAPI(userData)
    }, [userData])

    async function populateDataFromAPI(data: CreateUser) {
        const { email_id, roleFilters, groups = [], superAdmin } = data
        const allProjects = roleFilters.map((roleFilter) => roleFilter.team).filter(Boolean);
        const projectsMap = mapByKey(projectsList, 'name');
        const allProjectIds = allProjects.map((p) => projectsMap.get(p).id);
        const uniqueProjectIds = Array.from(new Set(allProjectIds));
        await fetchAppList(uniqueProjectIds)
        const directPermissions: DirectPermissionsRoleFilter[] = roleFilters
            ?.filter(roleFilter => roleFilter.entity === EntityTypes.DIRECT)
            ?.map(directRolefilter => {
                const projectId = projectsMap.get(directRolefilter.team).id;
                // fetchAppList(projectId)
                return {
                    ...directRolefilter,
                    action: { label: directRolefilter.action, value: directRolefilter.action },
                    team: { label: directRolefilter.team, value: directRolefilter.team },
                    entity: EntityTypes.DIRECT,
                    entityName: directRolefilter?.entityName
                        ? directRolefilter.entityName.split(',').map((entity) => ({ value: entity, label: entity }))
                        : [
                            { label: 'All applications', value: '*' },
                            ...(appsList.get(projectId)?.result || []).map((app) => ({ label: app.name, value: app.name })),
                        ],
                    environment: directRolefilter.environment ?
                        directRolefilter.environment
                            .split(',')
                            .map((directRole) => ({ value: directRole, label: directRole }))
                        : [
                            { label: 'All environments', value: '*' },
                            ...environmentsList.map((env) => ({ label: env.environment_name, value: env.environment_name }))
                        ]
                    ,
                } as DirectPermissionsRoleFilter;
            })
        setUserGroups(groups?.map(group => ({ label: group, value: group })) || [])
        setEmailState({ emails: [{ label: email_id, value: email_id }], inputEmailValue: '', emailError: '' })
        if (directPermissions.length > 0) {
            setDirectPermission(directPermissions)
        }
        else {
            setDirectPermission([emptyDirectPermission])
        }
        if (superAdmin) {
            setSuperAdmin(superAdmin)
        }

        const tempChartPermission: APIRoleFilter = roleFilters?.find(roleFilter => roleFilter.entity === EntityTypes.CHART_GROUP)
        if (tempChartPermission) {
            const chartPermission: ChartGroupPermissionsFilter = {
                entity: EntityTypes.CHART_GROUP,
                entityName: tempChartPermission?.entityName.split(",")?.map(entity => ({ value: entity, label: entity })) || [],
                action: tempChartPermission.action === '*' ? ActionTypes.ADMIN : tempChartPermission.action
            }

            setChartPermission(chartPermission)
        }
    }

    function handleInputChange(inputEmailValue) {
        setEmailState(emailState => ({ ...emailState, inputEmailValue, emailError: '' }))
    }

    function handleEmailChange(newValue: any, actionMeta: any) {
        setEmailState(emailState => ({ ...emailState, emails: newValue || [], emailError: '' }))
    };

    function handleDirectPermissionChange(index, selectedValue, actionMeta) {
        const { action, option, name } = actionMeta
        const tempPermissions = [...directPermission]

        if (name === "entityName") {
            const { label, value } = option
            if (value === '*') {
                if (action === 'select-option') {
                    // check all applications
                    const projectId = projectsList.find(
                        (project) => project.name === tempPermissions[index]['team'].value,
                    ).id;
                    tempPermissions[index][name] = [{ label: 'All applications', value: '*' }, ...(appsList.get(projectId).result).map(app => ({ label: app.name, value: app.name }))]
                    tempPermissions[index]['entityNameError'] = null;
                }
                else {
                    // uncheck all applications
                    tempPermissions[index][name] = [];
                }
            }
            else {
                tempPermissions[index]['entityNameError'] = null;
                tempPermissions[index][name] = selectedValue.filter(({ value, label }) => value !== '*')
            }
        }

        else if (name === 'environment') {
            const { label, value } = option;
            if (value === '*') {
                if (action === 'select-option') {
                    // select all environments
                    tempPermissions[index][name] = [
                        { label: 'All environments', value: '*' },
                        ...environmentsList.map((env) => ({ label: env.environment_name, value: env.environment_name })),
                    ];
                    tempPermissions[index]['environmentError'] = null;
                } else {
                    // unselect all environments
                    tempPermissions[index][name] = [];
                }
            } else {
                tempPermissions[index]['environmentError'] = null;
                tempPermissions[index][name] = selectedValue.filter(({ value, label }) => value !== '*');
            }
        }
        else if (name === 'team') {
            tempPermissions[index][name] = selectedValue;
            tempPermissions[index]['entityName'] = []
            tempPermissions[index]['environment'] = []
            const projectId = projectsList.find((project) => project.name === selectedValue.value).id;
            fetchAppList([projectId])
        }
        else {
            tempPermissions[index][name] = selectedValue
        }
        setDirectPermission(tempPermissions)
    }

    const createOption = (label: string) => ({
        label,
        value: label,
    });

    const handleKeyDown = useCallback((event) => {
        let { emails, inputEmailValue } = emailState
        inputEmailValue = inputEmailValue.trim()
        switch (event.key) {
            case 'Enter':
            case 'Tab':
            case ',':
            case ' ': // space
                if (inputEmailValue) {
                    setEmailState({
                        inputEmailValue: '',
                        emails: [...emails, createOption(inputEmailValue)],
                        emailError: '',
                    });
                }
                if (event.key !== 'Tab') {
                    event.preventDefault();
                }
                break
        }
    }, [emailState])

    async function handleDelete() {
        setSubmitting(true)
        try {
            await deleteUser(id)
            deleteCallback(index)
            toast.success('Deleted user successfully.')
        }
        catch (err) {
            showError(err)
        }
        finally {
            setSubmitting(false)
        }
    }

    function formatChartGroupOptionLabel({ value, label }) {
        return <div className="flex left column"><span>{label}</span><small>{userGroupsMap.has(value) ? userGroupsMap.get(value).description : ''}</small></div>
    }

    function removeDirectPermissionRow(index) {
        if (index === 0 && directPermission.length === 1) {
            setDirectPermission([emptyDirectPermission])
        }
        else {
            setDirectPermission(permission => removeItemsFromArray(permission, index, 1))
        }
    }

    function handleCreatableBlur(e) {
        let { emails, inputEmailValue } = emailState
        inputEmailValue = inputEmailValue.trim()
        if (!inputEmailValue) return
        setEmailState({
            inputEmailValue: '',
            emails: [...emails, createOption(e.target.value)],
            emailError: '',
        });
    };

    const CreatableComponents = useMemo(() => ({
        DropdownIndicator: () => null,
        ClearIndicator,
        MultiValueRemove,
        MultiValueContainer: ({ ...props }) => <MultiValueContainer {...props} validator={validateEmail} />,
        IndicatorSeparator: () => null,
        Menu: () => null
    }), [])

    const creatableOptions = useMemo(() => ([]), [])

    const availableGroups = userGroupsList?.map(group => ({ value: group.name, label: group.name }))
    return (
        <div className="user-form">
            {!id && (
                <div className="mb-24">
                    <label htmlFor="" className="mb-8">
                        Email addresses*
                    </label>
                    <Creatable
                        ref={creatableRef}
                        options={creatableOptions}
                        components={CreatableComponents}
                        styles={CreatableStyle}
                        autoFocus
                        isMulti
                        isValidNewOption={() => false}
                        inputValue={emailState.inputEmailValue}
                        isClearable
                        onBlur={handleCreatableBlur}
                        backspaceRemovesValue
                        onInputChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Type email and press enter..."
                        value={emailState.emails}
                        onChange={handleEmailChange}
                    />
                    {emailState.emailError && <label className="form__error">{emailState.emailError}</label>}
                </div>
            )}
            {superAdmin && <SuperAdmin superAdmin={localSuperAdmin} setSuperAdmin={setSuperAdmin} />}
            {!localSuperAdmin && (
                <>
                    <div className="cn-9 fs-14 fw-6 mb-16">Group permissions</div>
                    <Select
                        value={userGroups}
                        ref={groupPermissionsRef}
                        components={{
                            MultiValueContainer: ({ ...props }) => <MultiValueContainer {...props} validator={null} />,
                            DropdownIndicator: null,
                            ClearIndicator,
                            MultiValueRemove,
                            Option,
                        }}
                        styles={{
                            ...multiSelectStyles,
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
                        formatOptionLabel={formatChartGroupOptionLabel}
                        closeMenuOnSelect={false}
                        isMulti
                        autoFocus={!id}
                        menuPortalTarget={document.body}
                        name="groups"
                        options={availableGroups}
                        hideSelectedOptions={false}
                        onChange={(selected, actionMeta) => setUserGroups((selected || []) as any)}
                        className={`basic-multi-select ${id ? 'mt-8 mb-16' : ''}`}
                    />
                    {userGroups.length > 0 && id && (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '184px 1fr 24px',
                                gridAutoRows: '48px',
                                gridColumnGap: '16px',
                                alignItems: 'center',
                            }}
                        >
                            {userGroups.map((userGroup, idx) => (
                                <GroupRow
                                    key={idx}
                                    name={userGroup.value}
                                    description={userGroupsMap.get(userGroup.value).description}
                                    removeRow={(e) =>
                                        setUserGroups((userGroups) => removeItemsFromArray(userGroups, idx, 1))
                                    }
                                />
                            ))}
                        </div>
                    )}
                    <fieldset>
                        <legend>Direct permissions</legend>
                        <div
                            className="w-100 mb-26"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr 1fr 1fr 24px',
                                gridGap: '16px',
                            }}
                        >
                            <label className="fw-6 fs-12 cn-5">Project</label>
                            <label className="fw-6 fs-12 cn-5">Environment</label>
                            <label className="fw-6 fs-12 cn-5">Application</label>
                            <label className="fw-6 fs-12 cn-5">Role</label>
                            <span />
                            {directPermission.map((permission, idx) => (
                                <DirectPermission
                                    index={idx}
                                    key={idx}
                                    permission={permission}
                                    removeRow={removeDirectPermissionRow}
                                    handleDirectPermissionChange={(value, actionMeta) =>
                                        handleDirectPermissionChange(idx, value, actionMeta)
                                    }
                                />
                            ))}
                        </div>
                        <b
                            className="anchor pointer flex left"
                            style={{ width: '90px' }}
                            onClick={(e) => setDirectPermission((permission) => [...permission, emptyDirectPermission])}
                        >
                            <AddIcon className="add-svg mr-12" /> Add row
                        </b>
                    </fieldset>
                    <ChartPermission chartPermission={chartPermission} setChartPermission={setChartPermission} />
                </>
            )}
            <div className="flex right mt-32">
                {id && (
                    <button
                        className="cta delete"
                        onClick={(e) => setDeleteConfirmationModal(true)}
                        style={{ marginRight: 'auto' }}
                    >
                        Delete
                    </button>
                )}
                <button disabled={submitting} onClick={cancelCallback} type="button" className="cta cancel mr-16">
                    Cancel
                </button>
                <button disabled={submitting} type="button" className="cta" onClick={handleSubmit}>
                    {submitting ? <Progressing /> : 'Save'}
                </button>
            </div>
            {deleteConfirmationModal && (<DeleteDialog title={`Delete user '${emailState.emails[0]?.value || ''}'?`}
                description={'Deleting this user will remove the user and revoke all their permissions.'}
                delete={handleDelete}
                closeDelete={() => setDeleteConfirmationModal(false)} />
            )}
        </div>
    );
}

const SuperAdmin: React.FC<{
    superAdmin: boolean;
    setSuperAdmin: (checked: boolean) => any
}> = ({ superAdmin, setSuperAdmin }) => {
    return (
        <div className="flex left column top bcn-1 br-4 p-16 mb-24">
            <div className="flex left">
                <input
                    type="checkbox"
                    checked={!!superAdmin}
                    onChange={(e) => setSuperAdmin(e.target.checked)}
                    style={{ height: '13px', width: '13px' }}
                />
                <span className="fs-14 fw-6 cn-9 ml-16">Assign superadmin permissions</span>
            </div>
            <p className="fs-12 cn-7 mt-4">
                Superadmins have complete access to all applications across projects. Only superadmins can add more
                superadmins.
            </p>
        </div>
    );
};
