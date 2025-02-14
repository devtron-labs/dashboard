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

import { useState, useEffect } from 'react'
import {
    showError,
    CustomInput,
    useMainContext,
    ToastVariantType,
    ToastManager,
    ButtonComponentType,
    ButtonVariantType,
    ComponentSizeType,
    ButtonStyleType,
    Button,
    Textarea,
} from '@devtron-labs/devtron-fe-common-lib'
import { Link, useHistory } from 'react-router-dom'
import { ReactComponent as ICDeleteInteractive } from '@Icons/ic-delete-interactive.svg'
import { ReactComponent as ICWarning } from '@Icons/ic-warning.svg'
import { deepEqual } from '../../../../../components/common'

import { URLS } from '../../../../../config'
import { PermissionGroup, PermissionGroupCreateOrUpdatePayload } from '../../types'
import { createOrUpdatePermissionGroup, deletePermissionGroup } from '../../authorization.service'
import {
    PermissionConfigurationForm,
    usePermissionConfiguration,
} from '../../Shared/components/PermissionConfigurationForm'
import { getIsSuperAdminPermission, getRoleFilters, validateDirectPermissionForm } from '../../utils'
import { excludeKeyAndClusterValue } from '../../Shared/components/K8sObjectPermissions/utils'
import { DeleteUserPermission } from '../../UserPermissions/DeleteUserPermission'

const PermissionGroupForm = ({ isAddMode }: { isAddMode: boolean }) => {
    const { serverMode } = useMainContext()

    // Form States
    const {
        permissionType,
        directPermission,
        setDirectPermission,
        chartPermission,
        k8sPermission,
        currentK8sPermissionRef,
        data: permissionGroup,
        isSaveDisabled,
    } = usePermissionConfiguration()
    const _permissionGroup = permissionGroup as PermissionGroup

    const [name, setName] = useState({ value: '', error: '' })
    const [description, setDescription] = useState('')

    const [submitting, setSubmitting] = useState(false)
    const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false)

    const { push } = useHistory()

    async function populateDataFromAPI(data: PermissionGroup) {
        const { name: _name, description: _description } = data
        setName({ value: _name, error: '' })
        setDescription(_description)
    }

    useEffect(() => {
        if (_permissionGroup) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            populateDataFromAPI(_permissionGroup)
        }
    }, [_permissionGroup])

    const _redirectToPermissionGroupList = () => {
        push(URLS.GLOBAL_CONFIG_AUTH_PERMISSION_GROUPS)
    }

    const toggleDeleteConfirmationModal = () => {
        setDeleteConfirmationModal(!deleteConfirmationModal)
    }

    const handleGroupNameChange = (e) => setName({ value: e.target.value, error: '' })

    const handleSubmit = async () => {
        const isSuperAdminPermission = getIsSuperAdminPermission(permissionType)

        if (!name.value) {
            setName((_name) => ({ ..._name, error: 'Group name is mandatory' }))
            return
        }
        if (!isSuperAdminPermission && !validateDirectPermissionForm(directPermission, setDirectPermission).isValid) {
            return
        }
        setSubmitting(true)

        const payload: PermissionGroupCreateOrUpdatePayload = {
            // ID 0 denotes create operation
            id: _permissionGroup?.id || 0,
            name: name.value,
            description,
            superAdmin: isSuperAdminPermission,
            roleFilters: getRoleFilters({
                k8sPermission,
                directPermission,
                serverMode,
                chartPermission,
            }),
        }

        try {
            await createOrUpdatePermissionGroup(payload)
            if (isAddMode) {
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: 'Group created',
                })
            } else {
                currentK8sPermissionRef.current = [...k8sPermission].map(excludeKeyAndClusterValue)
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: 'Group updated',
                })
            }
            _redirectToPermissionGroupList()
        } catch (err) {
            showError(err)
        } finally {
            setSubmitting(false)
        }
    }

    const onDelete = async () => {
        await deletePermissionGroup(_permissionGroup.id)
        _redirectToPermissionGroupList()
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
                        {isAddMode ? 'Add Group' : _permissionGroup.name}
                    </span>
                </div>
                {!isAddMode && (
                    <Button
                        disabled={submitting}
                        variant={ButtonVariantType.secondary}
                        style={ButtonStyleType.negative}
                        size={ComponentSizeType.medium}
                        dataTestId="delete-group"
                        text="Delete"
                        startIcon={<ICDeleteInteractive />}
                        onClick={toggleDeleteConfirmationModal}
                    />
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
                        onChange={handleGroupNameChange}
                        isRequiredField
                        error={name.error}
                        placeholder="Eg. Project managers"
                    />
                    <Textarea
                        label="Description"
                        name="permission-group-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter a description for this group"
                    />
                    <div className="dc__border-top" />
                    <PermissionConfigurationForm showUserPermissionGroupSelector={false} />
                </div>
                <div className="flexbox pt-16 pl-20 pr-20 dc__border-top-n1 dc__align-items-center dc__align-self-stretch dc__gap-8">
                    <Button
                        dataTestId="submit-user-form"
                        text="Save"
                        onClick={handleSubmit}
                        size={ComponentSizeType.medium}
                        disabled={isSaveDisabled}
                        isLoading={submitting}
                        buttonProps={{
                            type: 'submit',
                        }}
                    />
                    <Button
                        dataTestId="cancel-user-form"
                        text="Cancel"
                        component={ButtonComponentType.link}
                        linkProps={{
                            to: URLS.GLOBAL_CONFIG_AUTH_PERMISSION_GROUPS,
                        }}
                        variant={ButtonVariantType.secondary}
                        size={ComponentSizeType.medium}
                        style={ButtonStyleType.neutral}
                        disabled={submitting}
                    />
                    {!isAddMode &&
                        !deepEqual(currentK8sPermissionRef.current, k8sPermission.map(excludeKeyAndClusterValue)) && (
                            <span className="flex cy-7 dc__gap-4">
                                <ICWarning className="icon-dim-20 warning-icon-y7" />
                                Unsaved changes
                            </span>
                        )}
                </div>
                {deleteConfirmationModal && (
                    <DeleteUserPermission
                        title={name.value}
                        onDelete={onDelete}
                        closeConfirmationModal={toggleDeleteConfirmationModal}
                        isUserGroup
                    />
                )}
            </div>
        </div>
    )
}

export default PermissionGroupForm
