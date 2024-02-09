import React, { useState, useEffect, useRef, ChangeEvent } from 'react'
import {
    showError,
    Progressing,
    DeleteDialog,
    ResizableTextarea,
    CustomInput,
    RadioGroup,
    RadioGroupItem,
} from '@devtron-labs/devtron-fe-common-lib'
import { toast } from 'react-toastify'
import { Link, useHistory } from 'react-router-dom'
import { deepEqual } from '../../../../../components/common'

import {
    DirectPermissionsRoleFilter,
    ChartGroupPermissionsFilter,
    EntityTypes,
    ActionTypes,
} from '../../shared/components/userGroups/userGroups.types'
import AppPermissions from '../../shared/components/AppPermissions'
import { ACCESS_TYPE_MAP, SERVER_MODE, URLS } from '../../../../../config'
import { ReactComponent as Warning } from '../../../../../assets/icons/ic-warning.svg'
import { excludeKeyAndClusterValue } from '../../shared/components/K8sObjectPermissions/K8sPermissions.utils'
import SuperAdminInfoBar from '../../shared/components/SuperAdminInfoBar'
import { useMainContext } from '../../../../../components/common/navigation/NavigationRoutes'
import { PermissionType, PERMISSION_TYPE_LABEL_MAP } from '../../constants'
import { PermissionGroup, PermissionGroupCreateOrUpdatePayload } from '../../types'
import { ReactComponent as PlusIcon } from '../../../../../assets/icons/ic-delete-interactive.svg'
import { createOrUpdatePermissionGroup, deletePermissionGroup } from '../../authorization.service'

const PermissionGroupForm = ({
    isAddMode,
    permissionGroup = null,
}: {
    isAddMode: boolean
    permissionGroup: PermissionGroup
}) => {
    const { serverMode } = useMainContext()

    // Form States
    const [permissionType, setPermissionType] = useState<PermissionType>(PermissionType.SPECIFIC)
    const [chartPermission, setChartPermission] = useState<ChartGroupPermissionsFilter>({
        entity: EntityTypes.CHART_GROUP,
        action: ActionTypes.VIEW,
        entityName: [],
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [k8sPermission, setK8sPermission] = useState<any[]>([])
    const [name, setName] = useState({ value: '', error: '' })
    const [description, setDescription] = useState('')
    const [directPermission, setDirectPermission] = useState<DirectPermissionsRoleFilter[]>([])

    const [submitting, setSubmitting] = useState(false)
    const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentK8sPermissionRef = useRef<any[]>([])
    const { push } = useHistory()

    const isSuperAdminPermission = permissionType === PermissionType.SUPER_ADMIN

    async function populateDataFromAPI(data: PermissionGroup) {
        const { name: _name, description: _description, superAdmin } = data
        setName({ value: _name, error: '' })
        setDescription(_description)
        setPermissionType(superAdmin ? PermissionType.SUPER_ADMIN : PermissionType.SPECIFIC)
    }

    useEffect(() => {
        if (permissionGroup) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            populateDataFromAPI(permissionGroup)
        }
    }, [permissionGroup])

    const _redirectToPermissionGroupList = () => {
        push(URLS.GLOBAL_CONFIG_AUTH_PERMISSION_GROUPS)
    }

    const toggleDeleteConfirmationModal = () => {
        setDeleteConfirmationModal(!deleteConfirmationModal)
    }

    const handlePermissionTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPermissionType(e.target.value as PermissionType)
    }

    function isFormComplete(): boolean {
        let isComplete = true

        // Validation for super admin permission on the group
        if (isSuperAdminPermission) {
            return isComplete
        }

        // Validation for specific permissions on the group
        const tempPermissions = directPermission.reduce((agg, curr) => {
            if (curr.team && curr.entityName.length === 0) {
                isComplete = false
                // eslint-disable-next-line no-param-reassign
                curr.entityNameError = 'Applications are mandatory'
            }
            if (curr.team && curr.environment.length === 0) {
                isComplete = false
                // eslint-disable-next-line no-param-reassign
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

    function getSelectedEnvironments(permission) {
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
        if (!name.value) {
            setName((_name) => ({ ..._name, error: 'Group name is mandatory' }))
            return
        }
        if (!isFormComplete()) {
            return
        }
        setSubmitting(true)

        const payload: PermissionGroupCreateOrUpdatePayload = {
            id: permissionGroup?.id || 0,
            name: name.value,
            description,
            roleFilters: [
                ...directPermission
                    .filter(
                        (permission) =>
                            permission.team?.value && permission.environment.length && permission.entityName.length,
                    )
                    .map((permission) => {
                        const _payload = {
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
                        }
                        return _payload
                    }),
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
        }

        try {
            await createOrUpdatePermissionGroup(payload)
            if (isAddMode) {
                toast.success('Group created')
            } else {
                currentK8sPermissionRef.current = [...k8sPermission].map(excludeKeyAndClusterValue)
                toast.success('Group updated')
            }
            _redirectToPermissionGroupList()
        } catch (err) {
            showError(err)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        setSubmitting(true)
        try {
            await deletePermissionGroup(permissionGroup.id)
            toast.success('Group deleted')
            setDeleteConfirmationModal(false)
            _redirectToPermissionGroupList()
        } catch (err) {
            showError(err)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="flexbox-col dc__align-start dc__align-self-stretch flex-grow-1 dc__gap-24 pb-16">
            <div className="flex dc__content-space dc__gap-8 pr-20 pl-20 w-100">
                <div className="flex dc__content-start dc__gap-4 fs-16 lh-32 fw-4 dc__ellipsis-right">
                    <Link className="anchor" to={URLS.GLOBAL_CONFIG_AUTH_PERMISSION_GROUPS}>
                        Permission Groups
                    </Link>
                    <span className="cn-5">/</span>
                    <span className="cn-9 fw-6 dc__ellipsis-right">
                        {isAddMode ? 'Add Group' : permissionGroup.name}
                    </span>
                </div>
                {!isAddMode && (
                    <div>
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
                    <CustomInput
                        name="permission-group-name-textbox"
                        label="Group name"
                        disabled={!isAddMode}
                        value={name.value}
                        data-testid="permission-group-name-textbox"
                        onChange={(e) => setName({ value: e.target.value, error: '' })}
                        isRequiredField
                        error={name.error}
                        placeholder="Enter group name"
                    />
                    <div>
                        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                        <label htmlFor="" className="form__label">
                            Description
                        </label>
                        <ResizableTextarea
                            name=""
                            maxHeight={300}
                            className="w-100"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            data-testid="permission-group-description-textbox"
                        />
                    </div>
                    <div className="dc__border-top-n1" />
                    <RadioGroup
                        className="permission-type__radio-group"
                        value={permissionType}
                        name="permission-type"
                        onChange={handlePermissionTypeChange}
                    >
                        {Object.entries(PERMISSION_TYPE_LABEL_MAP).map(([value, label]) => (
                            <RadioGroupItem
                                dataTestId={`${
                                    value === PermissionType.SPECIFIC ? 'specific-user' : 'super-admin'
                                }-permission-radio-button`}
                                value={value}
                                key={value}
                            >
                                <span className={`dc__no-text-transform ${permissionType === value ? 'fw-6' : 'fw-4'}`}>
                                    {label}
                                </span>
                            </RadioGroupItem>
                        ))}
                    </RadioGroup>
                    {isSuperAdminPermission ? (
                        <SuperAdminInfoBar />
                    ) : (
                        <AppPermissions
                            data={permissionGroup}
                            directPermission={directPermission}
                            setDirectPermission={setDirectPermission}
                            chartPermission={chartPermission}
                            setChartPermission={setChartPermission}
                            k8sPermission={k8sPermission}
                            setK8sPermission={setK8sPermission}
                            currentK8sPermissionRef={currentK8sPermissionRef}
                        />
                    )}
                </div>
                <div className="flexbox pt-16 pl-20 pr-20 dc__border-top-n1 dc__align-items-center dc__align-self-stretch dc__gap-8">
                    <button type="submit" className="cta flex h-32" disabled={submitting} onClick={handleSubmit}>
                        {submitting ? <Progressing /> : 'Save'}
                    </button>
                    <Link
                        to={URLS.GLOBAL_CONFIG_AUTH_PERMISSION_GROUPS}
                        role="button"
                        aria-disabled={submitting}
                        className={`cta cancel flex h-32 anchor ${
                            submitting ? 'dc__disable-click disabled-opacity' : ''
                        }`}
                    >
                        Cancel
                    </Link>
                    {!isAddMode &&
                        !deepEqual(currentK8sPermissionRef.current, k8sPermission.map(excludeKeyAndClusterValue)) && (
                            <span className="flex cy-7 dc__gap-4">
                                <Warning className="icon-dim-20 warning-icon-y7" />
                                Unsaved changes
                            </span>
                        )}
                </div>
                {deleteConfirmationModal && (
                    <DeleteDialog
                        title={`Delete group '${name.value}'?`}
                        description="Deleting this group will revoke permissions from users added to this group."
                        closeDelete={toggleDeleteConfirmationModal}
                        delete={handleDelete}
                        apiCallInProgress={submitting}
                    />
                )}
            </div>
        </div>
    )
}

export default PermissionGroupForm
