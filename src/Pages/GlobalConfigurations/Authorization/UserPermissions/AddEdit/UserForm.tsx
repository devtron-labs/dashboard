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

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
    showError,
    Progressing,
    DeleteDialog,
    ClearIndicator,
    MultiValueRemove,
    MultiValueChipContainer,
    ServerErrors,
    OptionType,
    UserStatus,
    useMainContext,
    UserGroupType,
    ToastVariantType,
    ToastManager,
} from '@devtron-labs/devtron-fe-common-lib'
import Creatable from 'react-select/creatable'
import { Link, useHistory } from 'react-router-dom'
import { validateEmail, deepEqual, importComponentFromFELibrary } from '../../../../../components/common'
import { API_STATUS_CODES, REQUIRED_FIELDS_MISSING, URLS } from '../../../../../config'
import { ReactComponent as Error } from '../../../../../assets/icons/ic-warning.svg'
import { useAuthorizationContext } from '../../AuthorizationProvider'
import { ReactComponent as PlusIcon } from '../../../../../assets/icons/ic-delete-interactive.svg'
import { createOrUpdateUser, deleteUser } from '../../authorization.service'
import { User } from '../../types'
import {
    PermissionConfigurationForm,
    usePermissionConfiguration,
} from '../../Shared/components/PermissionConfigurationForm'
import { createUserPermissionPayload, validateDirectPermissionForm } from '../../utils'
import { excludeKeyAndClusterValue } from '../../Shared/components/K8sObjectPermissions/utils'
import { getCreatableChipStyle } from '../utils'
import { getDefaultUserStatusAndTimeout } from '../../libUtils'

const UserAutoAssignedRoleGroupsTable = importComponentFromFELibrary('UserAutoAssignedRoleGroupsTable')
const UserPermissionsInfoBar = importComponentFromFELibrary('UserPermissionsInfoBar', null, 'function')
const UserStatusUpdate = importComponentFromFELibrary('UserStatusUpdate', null, 'function')
const UserGroupSelector = importComponentFromFELibrary('UserGroupSelector', null, 'function')

const creatableChipStyle = getCreatableChipStyle()

const createOption = (label: string) => ({
    label,
    value: label,
})

const UserForm = ({ isAddMode }: { isAddMode: boolean }) => {
    const { serverMode, isSuperAdmin } = useMainContext()

    const { isAutoAssignFlowEnabled } = useAuthorizationContext()

    const {
        permissionType,
        directPermission,
        setDirectPermission,
        chartPermission,
        k8sPermission,
        currentK8sPermissionRef,
        userRoleGroups,
        data: userData,
        userStatus,
        timeToLive,
        handleUserStatusUpdate,
        showStatus,
    } = usePermissionConfiguration()
    const _userData = userData as User

    const [emailState, setEmailState] = useState<{ emails: OptionType[]; inputEmailValue: string; emailError: string }>(
        { emails: [], inputEmailValue: '', emailError: '' },
    )
    const [selectedUserGroups, setSelectedUserGroups] = useState<Pick<UserGroupType, 'name' | 'userGroupId'>[]>([])

    // UI States
    const [submitting, setSubmitting] = useState(false)
    const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false)

    const creatableRef = useRef(null)
    const groupPermissionsRef = useRef(null)
    const { push } = useHistory()

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
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: REQUIRED_FIELDS_MISSING,
            })
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
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'One or more emails could not be verified to be correct.',
            })
            return false
        }
        return true
    }

    const handleSubmit = async () => {
        if (!validateForm() || !validateDirectPermissionForm(directPermission, setDirectPermission).isValid) {
            return
        }

        setSubmitting(true)

        const payload = createUserPermissionPayload({
            id: userData?.id,
            userIdentifier: emailState.emails.map((email) => email.value).join(','),
            userRoleGroups,
            serverMode,
            directPermission,
            chartPermission,
            k8sPermission,
            permissionType,
            userGroups: selectedUserGroups,
            ...getDefaultUserStatusAndTimeout(),
        })

        try {
            await createOrUpdateUser({
                ...payload,
                userStatus,
                timeToLive,
            })
            if (isAddMode) {
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: 'User(s) added',
                })
            } else {
                currentK8sPermissionRef.current = [...k8sPermission].map(excludeKeyAndClusterValue)
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: 'User updated',
                })
            }
            _redirectToUserPermissionList()
        } catch (err) {
            // In case the permissions are partially updated for some reason, we receive 417
            if (err instanceof ServerErrors && err.code === API_STATUS_CODES.EXPECTATION_FAILED) {
                const message = err.errors[0].userMessage
                ToastManager.showToast({
                    variant: ToastVariantType.warn,
                    description: message,
                })
            } else {
                showError(err)
            }
        } finally {
            setSubmitting(false)
        }
    }

    const populateDataFromAPI = (data: User) => {
        const { emailId, userStatus: _userStatus, timeToLive: _timeToLive, userGroups } = data

        setEmailState({ emails: [{ label: emailId, value: emailId }], inputEmailValue: '', emailError: '' })
        setSelectedUserGroups(userGroups)
        handleUserStatusUpdate(_userStatus, _timeToLive)
    }

    useEffect(() => {
        if (_userData) {
            populateDataFromAPI(_userData)
        } else {
            handleUserStatusUpdate(UserStatus.active, '')
        }
    }, [_userData])

    const handleInputChange = (inputEmailValue) => {
        setEmailState((prevEmailState) => ({ ...prevEmailState, inputEmailValue, emailError: '' }))
    }

    const handleEmailChange = (newValue) => {
        setEmailState((prevEmailState) => ({ ...prevEmailState, emails: newValue || [], emailError: '' }))
    }

    const handleDelete = async () => {
        setSubmitting(true)
        try {
            await deleteUser(_userData.id)
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: 'User deleted',
            })
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
            DropdownIndicator: null,
            ClearIndicator,
            MultiValueRemove,
            // eslint-disable-next-line react/no-unstable-nested-components
            MultiValueContainer: (props) => <MultiValueChipContainer {...props} validator={validateEmail} />,
            IndicatorSeparator: null,
            Menu: () => null,
        }),
        [],
    )

    return (
        <div className="flexbox-col dc__align-start dc__align-self-stretch flex-grow-1 dc__gap-24 pb-16">
            <div className="flex pr-20 pl-20 dc__content-space dc__gap-8 w-100">
                <div className="flex dc__content-start dc__gap-4 fs-16 lh-32 fw-4 dc__ellipsis-right">
                    <Link className="anchor" to={URLS.GLOBAL_CONFIG_AUTH_USER_PERMISSION}>
                        User Permissions
                    </Link>
                    <span className="cn-5">/</span>
                    <span className="cn-9 fw-6 dc__ellipsis-right">{isAddMode ? 'Add User' : _userData.emailId}</span>
                </div>
                {(!isAddMode || showStatus) && (
                    <div className="flex dc__content-start dc__gap-12">
                        {showStatus && (
                            <UserStatusUpdate
                                userStatus={userStatus}
                                timeToLive={timeToLive}
                                userEmail={_userData?.emailId ?? ''}
                                handleChange={handleUserStatusUpdate}
                                disabled={submitting}
                            />
                        )}
                        {!isAddMode && (
                            <button
                                disabled={submitting}
                                type="button"
                                className="cta delete override-button flex dc__gap-6 h-32"
                                onClick={toggleDeleteConfirmationModal}
                            >
                                <PlusIcon className="icon-dim-14 mw-14" />
                                Delete
                            </button>
                        )}
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
                                    ref={creatableRef}
                                    options={[]}
                                    components={CreatableComponents}
                                    styles={creatableChipStyle}
                                    autoFocus
                                    isMulti
                                    isClearable
                                    inputValue={emailState.inputEmailValue}
                                    placeholder="Type email and press enter"
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
                            <div className="dc__border-top" />
                        </>
                    )}
                    {/* Show status is enterprise only check hence reusing */}
                    {showStatus && UserGroupSelector && (
                        <UserGroupSelector
                            selectedUserGroups={selectedUserGroups}
                            handleUserGroupChange={setSelectedUserGroups}
                        />
                    )}
                    {!isAddMode && isAutoAssignFlowEnabled && (
                        <UserAutoAssignedRoleGroupsTable roleGroups={_userData.userRoleGroups} />
                    )}
                    {!isAutoAssignFlowEnabled && (
                        <PermissionConfigurationForm
                            showUserPermissionGroupSelector
                            hideDirectPermissions={
                                window._env_.FEATURE_HIDE_USER_DIRECT_PERMISSIONS_FOR_NON_SUPER_ADMINS && !isSuperAdmin
                            }
                        />
                    )}
                </div>
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
                        !deepEqual(currentK8sPermissionRef.current, k8sPermission.map(excludeKeyAndClusterValue)) && (
                            <span className="flex dc__gap-4 cy-7">
                                <Error className="icon-dim-20 warning-icon-y7" />
                                Unsaved changes
                            </span>
                        )}
                </div>
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
