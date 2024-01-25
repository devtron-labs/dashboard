import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
    showError,
    Progressing,
    DeleteDialog,
    Option,
    ClearIndicator,
    MultiValueRemove,
    multiSelectStyles,
    MultiValueChipContainer,
    RadioGroup,
    RadioGroupItem,
    ServerErrors,
    OptionType,
} from '@devtron-labs/devtron-fe-common-lib'
import Creatable from 'react-select/creatable'
import Select from 'react-select'
import { toast } from 'react-toastify'
import { Link, useHistory } from 'react-router-dom'
import {
    DirectPermissionsRoleFilter,
    ChartGroupPermissionsFilter,
    EntityTypes,
    ActionTypes,
    ViewChartGroupPermission,
} from '../../shared/components/userGroups/userGroups.types'
import { mapByKey, validateEmail, deepEqual, importComponentFromFELibrary } from '../../../../../components/common'
import AppPermissions from '../../shared/components/AppPermissions'
import { ACCESS_TYPE_MAP, API_STATUS_CODES, SERVER_MODE, URLS } from '../../../../../config'
import { useMainContext } from '../../../../../components/common/navigation/NavigationRoutes'
import { ReactComponent as Error } from '../../../../../assets/icons/ic-warning.svg'
import { excludeKeyAndClusterValue } from '../../shared/components/K8sObjectPermissions/K8sPermissions.utils'
import { useAuthorizationContext } from '../../AuthorizationProvider'
import SuperAdminInfoBar from '../../shared/components/SuperAdminInfoBar'
import { PermissionType, PERMISSION_TYPE_LABEL_MAP } from '../../constants'
import { ReactComponent as PlusIcon } from '../../../../../assets/icons/ic-delete-interactive.svg'
import { createOrUpdateUser, deleteUser } from '../../authorization.service'
import { User, UserCreateOrUpdatePayload } from '../../types'

const UserPermissionGroupTable = importComponentFromFELibrary('UserPermissionGroupTable')
const UserPermissionsInfoBar = importComponentFromFELibrary('UserPermissionsInfoBar', null, 'function')

const CreatableChipStyle = {
    multiValue: (base, state) => {
        return {
            ...base,
            border: validateEmail(state.data.value) ? `1px solid var(--N200)` : `1px solid var(--R500)`,
            borderRadius: `4px`,
            background: validateEmail(state.data.value) ? 'white' : 'var(--R100)',
            height: '28px',
            margin: '8px 8px 4px 0px',
            paddingLeft: '4px',
            fontSize: '12px',
        }
    },
    control: (base, state) => ({
        ...base,
        border: state.isFocused ? '1px solid #06c' : '1px solid #d6dbdf', // default border color
        boxShadow: 'none', // no box-shadow
    }),
    indicatorsContainer: () => ({
        height: '38px',
    }),
}

const UserForm = ({ isAddMode, userData = null }: { isAddMode: boolean; userData: User }) => {
    const { serverMode } = useMainContext()

    const { userGroupsList, isAutoAssignFlowEnabled } = useAuthorizationContext()
    const userGroupsMap = mapByKey(userGroupsList, 'name')
    const availableGroups = userGroupsList?.map((group) => ({ value: group.name, label: group.name }))

    // Form States
    const [permissionType, setPermissionType] = useState<PermissionType>(PermissionType.SPECIFIC)
    const [emailState, setEmailState] = useState<{ emails: OptionType[]; inputEmailValue: string; emailError: string }>(
        { emails: [], inputEmailValue: '', emailError: '' },
    )
    const [directPermission, setDirectPermission] = useState<DirectPermissionsRoleFilter[]>([])
    const [chartPermission, setChartPermission] = useState<ChartGroupPermissionsFilter>({
        entity: EntityTypes.CHART_GROUP,
        action: ActionTypes.VIEW,
        entityName: [],
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [k8sPermission, setK8sPermission] = useState<any[]>([])
    const [userGroups, setUserGroups] = useState<OptionType[]>([])

    // UI States
    const [submitting, setSubmitting] = useState(false)
    const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false)

    const creatableRef = useRef(null)
    const groupPermissionsRef = useRef(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentK8sPermissionRef = useRef<any[]>([])
    const { push } = useHistory()

    const isSuperAdminPermission = permissionType === PermissionType.SUPER_ADMIN

    useEffect(() => {
        if (creatableRef.current) {
            creatableRef.current.focus()
        } else if (groupPermissionsRef.current) {
            groupPermissionsRef.current.focus()
        }
    }, [])

    const _redirectToUserPermissionList = () => {
        push(URLS.GLOBAL_CONFIG_AUTH_USER_PERMISSION)
    }

    const toggleDeleteConfirmationModal = () => {
        setDeleteConfirmationModal(!deleteConfirmationModal)
    }

    const validateForm = (): boolean => {
        if (emailState.emails.length === 0) {
            setEmailState((prevEmailState) => ({ ...prevEmailState, emailError: 'Emails are mandatory.' }))
            toast.error('Some required fields are missing')
            return false
        }

        if (
            emailState.emails.length !==
            emailState.emails.map((email) => email.value).filter((email) => validateEmail(email)).length
        ) {
            setEmailState((prevEmailState) => ({
                ...prevEmailState,
                emailError: 'One or more emails could not be verified to be correct.',
            }))
            toast.error('One or more emails could not be verified to be correct.')
            return false
        }
        return true
    }

    const isFormComplete = (): boolean => {
        let isComplete = true
        const tempPermissions = directPermission.reduce((agg, curr) => {
            if (curr.team && curr.entityName.length === 0) {
                isComplete = false
                // eslint-disable-next-line no-param-reassign
                curr.entityNameError = `${curr.entity === EntityTypes.JOB ? 'Jobs' : 'Applications'} are mandatory`
            }
            if (curr.team && curr.environment.length === 0) {
                isComplete = false
                // eslint-disable-next-line no-param-reassign
                curr.environmentError = 'Environments are mandatory'
            }
            if (curr.team && curr.entity === EntityTypes.JOB && curr.workflow?.length === 0) {
                isComplete = false
                // eslint-disable-next-line no-param-reassign
                curr.workflowError = 'Workflows are mandatory'
            }
            agg.push(curr)
            return agg
        }, [])

        if (!isComplete) {
            setDirectPermission(tempPermissions)
        }

        return isComplete
    }

    const getSelectedEnvironments = (permission) => {
        if (permission.accessType === ACCESS_TYPE_MAP.DEVTRON_APPS || permission.entity === EntityTypes.JOB) {
            return permission.environment.find((env) => env.value === '*')
                ? ''
                : permission.environment.map((env) => env.value).join(',')
        }
        const allFutureCluster = {}
        let envList = ''
        permission.environment.forEach((element) => {
            if (element.clusterName === '' && element.value.startsWith('#')) {
                const clusterName = element.value.substring(1)
                allFutureCluster[clusterName] = true
                envList += `${(envList !== '' ? ',' : '') + clusterName}__*`
            } else if (element.clusterName !== '' && !allFutureCluster[element.clusterName]) {
                envList += (envList !== '' ? ',' : '') + element.value
            }
        })
        return envList
    }

    const handleSubmit = async () => {
        if (!validateForm() || !isFormComplete()) {
            return
        }
        setSubmitting(true)

        const payload: UserCreateOrUpdatePayload = {
            id: userData?.id || 0,
            emailId: emailState.emails.map((email) => email.value).join(','),
            groups: userGroups.map((group) => group.value),
            roleFilters: [
                ...directPermission
                    .filter((permission) => {
                        return permission.team?.value && permission.environment.length && permission.entityName.length
                    })
                    .map((permission) => ({
                        ...permission,
                        action: permission.action.configApprover
                            ? `${permission.action.value},configApprover`
                            : permission.action.value,
                        team: permission.team.value,
                        environment: getSelectedEnvironments(permission),
                        entityName: permission.entityName.find((entity) => entity.value === '*')
                            ? ''
                            : permission.entityName.map((entity) => entity.value).join(','),
                        entity: permission.entity,
                        ...(permission.entity === EntityTypes.JOB && {
                            // eslint-disable-next-line no-nested-ternary
                            workflow: permission.workflow?.length
                                ? permission.workflow.find((workflow) => workflow.value === '*')
                                    ? ''
                                    : permission.workflow.map((workflow) => workflow.value).join(',')
                                : '',
                        }),
                    })),
                ...k8sPermission.map((permission) => ({
                    ...permission,
                    entity: EntityTypes.CLUSTER,
                    action: permission.action.value,
                    cluster: permission.cluster.label,
                    group: permission.group.value === '*' ? '' : permission.group.value,
                    kind: permission.kind.value === '*' ? '' : permission.kind.label,
                    namespace: permission.namespace.value === '*' ? '' : permission.namespace.value,
                    resource: permission.resource.find((entity) => entity.value === '*')
                        ? ''
                        : permission.resource.map((entity) => entity.value).join(','),
                })),
            ],
            superAdmin: isSuperAdminPermission,
        }
        if (serverMode !== SERVER_MODE.EA_ONLY) {
            payload.roleFilters.push({
                ...chartPermission,
                team: '',
                environment: '',
                entityName: chartPermission.entityName.map((entity) => entity.value).join(','),
            })
            if (chartPermission.action !== ActionTypes.VIEW) {
                payload.roleFilters.push({
                    ...ViewChartGroupPermission,
                    team: '',
                    environment: '',
                })
            }
        }
        try {
            await createOrUpdateUser(payload)
            if (isAddMode) {
                toast.success('User(s) created')
            } else {
                currentK8sPermissionRef.current = [...k8sPermission].map(excludeKeyAndClusterValue)
                toast.success('User updated')
            }
            _redirectToUserPermissionList()
        } catch (err) {
            // In case the permissions are partially updated for some reason, we receive 417
            if (err instanceof ServerErrors && err.code === API_STATUS_CODES.EXPECTATION_FAILED) {
                const message = err.errors[0].userMessage
                toast.warn(message)
            } else {
                showError(err)
            }
        } finally {
            setSubmitting(false)
        }
    }

    async function populateDataFromAPI(data: User) {
        const { emailId, groups = [], superAdmin } = data
        setUserGroups(groups?.map((group) => ({ label: group, value: group })) || [])
        setEmailState({ emails: [{ label: emailId, value: emailId }], inputEmailValue: '', emailError: '' })
        setPermissionType(superAdmin ? PermissionType.SUPER_ADMIN : PermissionType.SPECIFIC)
    }

    useEffect(() => {
        if (userData) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            populateDataFromAPI(userData)
        }
    }, [userData])

    const handleInputChange = (inputEmailValue) => {
        setEmailState((prevEmailState) => ({ ...prevEmailState, inputEmailValue, emailError: '' }))
    }

    const handleEmailChange = (newValue) => {
        setEmailState((prevEmailState) => ({ ...prevEmailState, emails: newValue || [], emailError: '' }))
    }

    const createOption = (label: string) => ({
        label,
        value: label,
    })

    const handleDelete = async () => {
        setSubmitting(true)
        try {
            await deleteUser(userData.id)
            toast.success('User deleted')
            setDeleteConfirmationModal(false)
            _redirectToUserPermissionList()
        } catch (err) {
            showError(err)
        } finally {
            setSubmitting(false)
        }
    }

    const handleKeyDown = useCallback(
        (event) => {
            const { emails } = emailState
            let { inputEmailValue } = emailState
            inputEmailValue = inputEmailValue.trim()
            switch (event.key) {
                case 'Enter':
                case 'Tab':
                case ',':
                case ' ': // space
                    if (inputEmailValue) {
                        const newEmails = inputEmailValue.split(',').map((e) => createOption(e.trim()))
                        setEmailState({
                            inputEmailValue: '',
                            emails: [...emails, ...newEmails],
                            emailError: '',
                        })
                    }
                    if (event.key !== 'Tab') {
                        event.preventDefault()
                    }
                    break
                default:
                    break
            }
        },
        [emailState],
    )

    const formatChartGroupOptionLabel = ({ value, label }) => (
        <div className="flex left column">
            <span>{label}</span>
            <small>{userGroupsMap.has(value) ? userGroupsMap.get(value).description : ''}</small>
        </div>
    )

    const handleCreatableBlur = (e) => {
        const { emails } = emailState
        let { inputEmailValue } = emailState
        inputEmailValue = inputEmailValue.trim()
        if (!inputEmailValue) {
            return
        }
        setEmailState({
            inputEmailValue: '',
            emails: [...emails, createOption(e.target.value)],
            emailError: '',
        })
    }

    const CreatableComponents = useMemo(
        () => ({
            DropdownIndicator: () => null,
            ClearIndicator,
            MultiValueRemove,
            MultiValueContainer: ({ ...props }) => <MultiValueChipContainer {...props} validator={validateEmail} />,
            IndicatorSeparator: () => null,
            Menu: () => null,
        }),
        [],
    )

    const handlePermissionType = (e) => {
        setPermissionType(e.target.value)
    }

    return (
        <div className="flexbox-col dc__align-start dc__align-self-stretch flex-grow-1 dc__gap-24 pb-16">
            <div className="flex pr-20 pl-20 dc__content-space dc__gap-8 w-100">
                <div className="flex dc__content-start dc__gap-4 fs-16 lh-32 fw-4 dc__ellipsis-right">
                    <Link className="anchor" to={URLS.GLOBAL_CONFIG_AUTH_USER_PERMISSION}>
                        User Permissions
                    </Link>
                    <span className="cn-5">/</span>
                    <span className="cn-9 fw-6 dc__ellipsis-right">{isAddMode ? 'Add User' : userData.emailId}</span>
                </div>
                {!isAddMode && (
                    <div className="flex dc__content-start dc__gap-12">
                        <button
                            disabled={submitting}
                            type="button"
                            className="cta delete override-button flex dc__gap-6 h-32"
                            onClick={toggleDeleteConfirmationModal}
                        >
                            <PlusIcon className="icon-dim-14 mw-14" />
                            Delete
                        </button>
                    </div>
                )}
            </div>
            <div className="flexbox-col dc__content-space flex-grow-1 w-100">
                <div className="flexbox-col dc__gap-16 pr-20 pl-20 pb-16 w-100 flex-grow-1">
                    {isAddMode && (
                        <>
                            {isAutoAssignFlowEnabled && <UserPermissionsInfoBar />}
                            <div>
                                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                                <label htmlFor="email-addresses" className="fs-13 fw-4 lh-20 cn-7 mb-8">
                                    Email addresses
                                    <span className="cr-5">&nbsp;*</span>
                                </label>
                                <Creatable
                                    classNamePrefix="email-address-dropdown"
                                    ref={creatableRef}
                                    options={[]}
                                    components={CreatableComponents}
                                    styles={CreatableChipStyle}
                                    autoFocus
                                    isMulti
                                    isClearable
                                    inputValue={emailState.inputEmailValue}
                                    placeholder="Type email and press enter..."
                                    isValidNewOption={() => false}
                                    backspaceRemovesValue
                                    value={emailState.emails}
                                    onBlur={handleCreatableBlur}
                                    onInputChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                    onChange={handleEmailChange}
                                    id="email-addresses"
                                />
                                {emailState.emailError && (
                                    <span className="form__error">
                                        <Error className="form__icon form__icon--error" />
                                        {emailState.emailError}
                                    </span>
                                )}
                            </div>
                            <div className="dc__border-top-n1" />
                        </>
                    )}
                    {!isAddMode && isAutoAssignFlowEnabled && (
                        <UserPermissionGroupTable permissionGroups={userData?.roleGroups} />
                    )}
                    {!isAutoAssignFlowEnabled && (
                        <>
                            <div className="flex left">
                                <RadioGroup
                                    className="permission-type__radio-group"
                                    value={permissionType}
                                    name="permission-type"
                                    onChange={handlePermissionType}
                                >
                                    {Object.entries(PERMISSION_TYPE_LABEL_MAP).map(([value, label]) => (
                                        <RadioGroupItem
                                            dataTestId={`${
                                                value === PermissionType.SPECIFIC ? 'specific-user' : 'super-admin'
                                            }-permission-radio-button`}
                                            value={value}
                                            key={value}
                                        >
                                            <span
                                                className={`dc__no-text-transform ${
                                                    permissionType === value ? 'fw-6' : 'fw-4'
                                                }`}
                                            >
                                                {label}
                                            </span>
                                        </RadioGroupItem>
                                    ))}
                                </RadioGroup>
                            </div>
                            {isSuperAdminPermission ? (
                                <SuperAdminInfoBar />
                            ) : (
                                <>
                                    <div className="flexbox-col dc__gap-8">
                                        <h3 className="cn-9 fs-13 lh-20 fw-6 m-0">Permission Groups</h3>
                                        <Select
                                            value={userGroups}
                                            ref={groupPermissionsRef}
                                            classNamePrefix="group-permission-dropdown"
                                            components={{
                                                MultiValueContainer: ({ ...props }) => (
                                                    <MultiValueChipContainer {...props} validator={null} />
                                                ),
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
                                            autoFocus={isAddMode}
                                            name="groups"
                                            options={availableGroups}
                                            hideSelectedOptions={false}
                                            onChange={(selected) => setUserGroups((selected || []) as OptionType[])}
                                            className="basic-multi-select"
                                        />
                                    </div>
                                    <div className="dc__border-top-n1" />
                                    <div className="flexbox-col dc__gap-8">
                                        <h3 className="cn-9 fs-13 lh-20 fw-6 m-0">Direct Permissions</h3>
                                        <AppPermissions
                                            data={userData}
                                            directPermission={directPermission}
                                            setDirectPermission={setDirectPermission}
                                            chartPermission={chartPermission}
                                            setChartPermission={setChartPermission}
                                            k8sPermission={k8sPermission}
                                            setK8sPermission={setK8sPermission}
                                            currentK8sPermissionRef={currentK8sPermissionRef}
                                        />
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
                {!(isAutoAssignFlowEnabled && !isAddMode) && (
                    <div className="flexbox pt-16 pl-20 pr-20 dc__border-top-n1 dc__align-items-center dc__align-self-stretch dc__gap-8">
                        <button type="submit" className="cta flex h-32" disabled={submitting} onClick={handleSubmit}>
                            {submitting ? <Progressing /> : 'Save'}
                        </button>
                        <Link
                            to={URLS.GLOBAL_CONFIG_AUTH_USER_PERMISSION}
                            role="button"
                            aria-disabled={submitting}
                            className={`cta cancel flex h-32 anchor ${
                                submitting ? 'dc__disable-click disabled-opacity' : ''
                            }`}
                            type="button"
                        >
                            Cancel
                        </Link>
                        {!isAddMode &&
                            !deepEqual(
                                currentK8sPermissionRef.current,
                                k8sPermission.map(excludeKeyAndClusterValue),
                            ) && (
                                <span className="flex dc__gap-4 cy-7">
                                    <Error className="icon-dim-20 warning-icon-y7" />
                                    Unsaved changes
                                </span>
                            )}
                    </div>
                )}
            </div>
            {deleteConfirmationModal && (
                <DeleteDialog
                    title={`Delete user '${emailState.emails[0]?.value || ''}'?`}
                    description="Deleting this user will remove the user and revoke all their permissions."
                    delete={handleDelete}
                    closeDelete={toggleDeleteConfirmationModal}
                    apiCallInProgress={submitting}
                />
            )}
        </div>
    )
}

export default UserForm
