import React, { useState, useEffect, useContext, useRef, ChangeEvent } from 'react'
import { deepEqual } from '../common'
import {
    showError,
    Progressing,
    DeleteDialog,
    ResizableTextarea,
    CustomInput,
    RadioGroup,
    RadioGroupItem,
} from '@devtron-labs/devtron-fe-common-lib'
import { saveGroup, deleteGroup } from './userGroup.service'

import {
    DirectPermissionsRoleFilter,
    ChartGroupPermissionsFilter,
    EntityTypes,
    ActionTypes,
    CreateGroup,
} from './userGroups.types'
import './UserGroup.scss'
import { toast } from 'react-toastify'
import AppPermissions from './AppPermissions'
import { ACCESS_TYPE_MAP, SERVER_MODE } from '../../config'
import { PermissionType } from '../apiTokens/authorization.utils'
import { mainContext } from '../common/navigation/NavigationRoutes'
import { ReactComponent as Warning } from '../../assets/icons/ic-warning.svg'
import { excludeKeyAndClusterValue } from './K8sObjectPermissions/K8sPermissions.utils'

enum PermissionTypeEnum {
    SUPER_ADMIN = 'SUPERADMIN',
    SPECIFIC = 'SPECIFIC',
}

export default function GroupForm({
    id = null,
    groupData = null,
    updateCallback,
    deleteCallback,
    createCallback,
    cancelCallback,
}) {
    // id null is for create
    const { serverMode } = useContext(mainContext)
    const [directPermission, setDirectPermission] = useState<DirectPermissionsRoleFilter[]>([])
    const [chartPermission, setChartPermission] = useState<ChartGroupPermissionsFilter>({
        entity: EntityTypes.CHART_GROUP,
        action: ActionTypes.VIEW,
        entityName: [],
    })
    const [submitting, setSubmitting] = useState(false)
    const [k8sPermission, setK8sPermission] = useState<any[]>([])
    const [name, setName] = useState({ value: '', error: '' })
    const [description, setDescription] = useState('')
    const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false)
    const [permissionType, setPermissionType] = useState<PermissionTypeEnum>(PermissionTypeEnum.SPECIFIC)
    const currentK8sPermissionRef = useRef<any[]>([])

    const isSuperAdminPermission = permissionType === PermissionTypeEnum.SUPER_ADMIN

    const handlePermissionTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPermissionType(e.target.value as PermissionTypeEnum)
    }

    function isFormComplete(): boolean {
        let isComplete: boolean = true

        // Validation for super admin permission on the group
        if (isSuperAdminPermission) {
            return isComplete
        }

        // Validation for specific permissions on the group
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

    function getSelectedEnvironments(permission) {
        if (permission.accessType === ACCESS_TYPE_MAP.DEVTRON_APPS || permission.entity === EntityTypes.JOB) {
            return permission.environment.find((env) => env.value === '*')
                ? ''
                : permission.environment.map((env) => env.value).join(',')
        } else {
            let allFutureCluster = {}
            let envList = ''
            permission.environment.forEach((element) => {
                if (element.clusterName === '' && element.value.startsWith('#')) {
                    const clusterName = element.value.substring(1)
                    allFutureCluster[clusterName] = true
                    envList += (envList !== '' ? ',' : '') + clusterName + '__*'
                } else if (element.clusterName !== '' && !allFutureCluster[element.clusterName]) {
                    envList += (envList !== '' ? ',' : '') + element.value
                }
            })
            return envList
        }
    }

    async function handleSubmit(e) {
        if (!name.value) {
            setName((name) => ({ ...name, error: 'Group name is mandatory' }))
            return
        }
        if (!isFormComplete()) {
            return
        }
        setSubmitting(true)
        const payload: CreateGroup = {
            id: id || 0,
            name: name.value,
            description,
            roleFilters: [
                ...directPermission
                    .filter(
                        (permission) =>
                            permission.team?.value && permission.environment.length && permission.entityName.length,
                    )
                    .map((permission) => {
                        const payload = {
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
                                workflow: permission.workflow?.length
                                    ? permission.workflow.find((workflow) => workflow.value === '*')
                                        ? ''
                                        : permission.workflow.map((workflow) => workflow.value).join(',')
                                    : '',
                            }),
                        }
                        return payload
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
            const { result } = await saveGroup(payload)
            if (id) {
                currentK8sPermissionRef.current = [...k8sPermission].map(excludeKeyAndClusterValue)
                updateCallback(id, result)
                toast.success('Group updated')
            } else {
                createCallback(result)
                toast.success('Group created')
            }
        } catch (err) {
            showError(err)
        } finally {
            setSubmitting(false)
        }
    }
    useEffect(() => {
        groupData && populateDataFromAPI(groupData)
    }, [groupData])

    async function populateDataFromAPI(data: CreateGroup) {
        const { name, description, superAdmin } = data
        setName({ value: name, error: '' })
        setDescription(description)
        setPermissionType(superAdmin ? PermissionTypeEnum.SUPER_ADMIN : PermissionTypeEnum.SPECIFIC)
    }

    async function handleDelete() {
        setSubmitting(true)
        try {
            await deleteGroup(id)
            deleteCallback(id)
            toast.success('Group deleted')
            setDeleteConfirmationModal(false)
        } catch (err) {
            showError(err)
        } finally {
            setSubmitting(false)
        }
    }
    return (
        <div className="user-form">
            <CustomInput
                name="permission-group-name-textbox"
                label="Group name"
                disabled={!!id}
                value={name.value}
                data-testid="permission-group-name-textbox"
                onChange={(e) => setName({ value: e.target.value, error: '' })}
                isRequiredField={true}
                error={name.error}
            />
            <label htmlFor="" className="form__label mt-16">
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
            <RadioGroup
                className="permission-type__radio-group mt-12"
                value={permissionType}
                name={`permission-type_${id}`}
                onChange={handlePermissionTypeChange}
            >
                {PermissionType.map(({ label, value }) => (
                    <RadioGroupItem
                        dataTestId={`${
                            value === PermissionTypeEnum.SPECIFIC ? 'specific-user' : 'super-admin'
                        }-permission-radio-button`}
                        value={value}
                        key={label}
                    >
                        <span className={`dc__no-text-transform ${permissionType === value ? 'fw-6' : 'fw-4'}`}>
                            {label}
                        </span>
                    </RadioGroupItem>
                ))}
            </RadioGroup>
            {!isSuperAdminPermission && (
                <AppPermissions
                    data={groupData}
                    directPermission={directPermission}
                    setDirectPermission={setDirectPermission}
                    chartPermission={chartPermission}
                    setChartPermission={setChartPermission}
                    k8sPermission={k8sPermission}
                    setK8sPermission={setK8sPermission}
                    currentK8sPermissionRef={currentK8sPermissionRef}
                />
            )}
            <div className="flex right mt-32">
                {id && (
                    <button
                        className="cta delete"
                        style={{ marginRight: 'auto' }}
                        data-testid="permission-group-form-delete-button"
                        onClick={(e) => setDeleteConfirmationModal(true)}
                    >
                        Delete
                    </button>
                )}
                {id && !deepEqual(currentK8sPermissionRef.current, k8sPermission.map(excludeKeyAndClusterValue)) && (
                    <span className="flex cy-7 mr-12">
                        <Warning className="icon-dim-20 warning-icon-y7 mr-8" />
                        Unsaved changes
                    </span>
                )}
                <button
                    data-testid="permission-group-form-cancel-button"
                    disabled={submitting}
                    onClick={cancelCallback}
                    type="button"
                    className="cta cancel mr-16"
                >
                    Cancel
                </button>
                <button
                    data-testid="permission-group-form-save-button"
                    disabled={submitting}
                    type="button"
                    className="cta"
                    onClick={handleSubmit}
                >
                    {submitting ? <Progressing /> : 'Save'}
                </button>
            </div>
            {deleteConfirmationModal && (
                <DeleteDialog
                    title={`Delete group '${name.value}'?`}
                    description={'Deleting this group will revoke permissions from users added to this group.'}
                    closeDelete={() => setDeleteConfirmationModal(false)}
                    delete={handleDelete}
                    apiCallInProgress={submitting}
                />
            )}
        </div>
    )
}
